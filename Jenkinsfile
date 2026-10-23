// Pipeline CI/CD AsramaCare
// Prasyarat agent: Node.js 22.13+ dan Bun 1.x (stage "Setup" memasang Bun jika belum ada).
// Deployment hanya dijalankan jika parameter DEPLOY bernilai true dan kredensial tersedia.
pipeline {
  agent any

  parameters {
    booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Jalankan deployment ke Railway setelah semua tahap lulus')
    string(name: 'RAILWAY_SERVICE', defaultValue: 'asramacare', description: 'Nama service Railway yang di-deploy')
    string(name: 'APP_URL', defaultValue: '', description: 'URL aplikasi online untuk verifikasi health check, mis. https://asramacare.up.railway.app')
  }

  options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    CI = 'true'
    NODE_ENV = 'test'
    PATH = "${env.HOME}/.bun/bin:${env.PATH}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Setup') {
      steps {
        sh '''
          node -v
          npm -v
          if ! command -v bun >/dev/null 2>&1; then
            curl -fsSL https://bun.sh/install | bash
          fi
          bun -v
        '''
      }
    }

    stage('Install Dependencies') {
      parallel {
        stage('Back-end') {
          steps {
            dir('back-end') { sh 'npm ci' }
          }
        }
        stage('Front-end') {
          steps {
            dir('front-end') { sh 'bun install --frozen-lockfile' }
          }
        }
      }
    }

    stage('Test Back-end') {
      steps {
        dir('back-end') { sh 'npm run test:ci' }
      }
    }

    stage('Test Front-end') {
      steps {
        dir('front-end') { sh 'bun run test:ci' }
      }
    }

    stage('Build Front-end') {
      environment { NODE_ENV = 'production' }
      steps {
        dir('front-end') { sh 'bun run build' }
      }
    }

    stage('Smoke Test') {
      // Menjalankan server produksi lokal (SQLite sementara) dan memeriksa health check + halaman utama.
      environment {
        NODE_ENV = 'production'
        PORT = '3999'
        DB_PATH = "${env.WORKSPACE}/back-end/data/smoke.db"
        STATIC_DIR = "${env.WORKSPACE}/front-end/dist"
        JWT_SECRET = 'smoke-test-secret-yang-hanya-dipakai-di-jenkins-0123456789'
      }
      steps {
        dir('back-end') {
          sh '''
            rm -f data/smoke.db*
            node src/server.js > smoke.log 2>&1 &
            SERVER_PID=$!
            trap "kill $SERVER_PID" EXIT
            for i in $(seq 1 20); do
              curl -fsS http://localhost:3999/api/health && break
              sleep 1
            done
            curl -fsS http://localhost:3999/api/health | grep '"status":"ok"'
            curl -fsS http://localhost:3999/ | grep '<div id="root">'
          '''
        }
      }
    }

    stage('Deploy') {
      when {
        expression { return params.DEPLOY }
      }
      steps {
        // Kredensial "railway-token" (Secret text) dibuat di Jenkins > Manage Credentials.
        withCredentials([string(credentialsId: 'railway-token', variable: 'RAILWAY_TOKEN')]) {
          sh 'npx --yes @railway/cli@latest up --ci --service "$RAILWAY_SERVICE"'
        }
      }
    }

    stage('Verify Deployment') {
      when {
        expression { return params.DEPLOY && params.APP_URL?.trim() }
      }
      steps {
        sh '''
          for i in $(seq 1 30); do
            if curl -fsS "${APP_URL}/api/health" | grep '"status":"ok"'; then
              echo "Deployment terverifikasi: ${APP_URL}"
              exit 0
            fi
            sleep 10
          done
          echo "Health check ${APP_URL} gagal" >&2
          exit 1
        '''
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: 'back-end/reports/junit.xml, front-end/reports/junit.xml'
      archiveArtifacts allowEmptyArchive: true, artifacts: 'back-end/coverage/**, front-end/coverage/**, front-end/dist/**, back-end/smoke.log'
    }
    success { echo 'Pipeline AsramaCare berhasil.' }
    failure { echo 'Pipeline AsramaCare gagal. Periksa log tahap yang merah.' }
  }
}

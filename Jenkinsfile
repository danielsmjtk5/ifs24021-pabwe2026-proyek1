// Pipeline CI/CD AsramaCare
// Dipicu otomatis oleh webhook GitHub (push ke repository) melalui https://<jenkins>/github-webhook/.
// Agent cukup memiliki sh, curl, dan tar: stage "Setup" memasang Node.js 22 dan Bun bila belum ada.
// Deployment: memicu redeploy website di panel Delcom (DEPLOY_TARGET=delcom, default) atau
// Factory rebuild Space Hugging Face (DEPLOY_TARGET=huggingface). Token disimpan di Jenkins Credentials.
pipeline {
  agent any

  triggers {
    githubPush()
  }

  parameters {
    booleanParam(name: 'DEPLOY', defaultValue: true, description: 'Deploy setelah semua tahap lulus')
    choice(name: 'DEPLOY_TARGET', choices: ['delcom', 'huggingface'], description: 'Tujuan deployment')
    string(name: 'APP_URL', defaultValue: 'https://ifs24021-pabwe2026-proyek1.s1if.cloud', description: 'URL aplikasi online untuk verifikasi health check')
    string(name: 'DELCOM_URL_REDEPLOY', defaultValue: 'https://delcom.org/api/dws/websites/redeploy', description: 'URL_REDEPLOY dari panel Delcom')
    string(name: 'DELCOM_URL_PROGRESS', defaultValue: 'https://delcom.org/api/dws/websites/progress', description: 'URL_PROGRESS dari panel Delcom')
    string(name: 'HF_SPACE', defaultValue: '', description: 'Khusus huggingface: ID Space, mis. danielsmjtk5/asramacare')
  }

  options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    CI = 'true'
    NODE_ENV = 'test'
    TOOLS_DIR = "${env.HOME}/.asramacare-tools"
    PATH = "${env.HOME}/.asramacare-tools/node/bin:${env.HOME}/.asramacare-tools/bun/node_modules/.bin:${env.PATH}"
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
          # Pasang Node.js 22 di folder tools jika agent belum punya Node >= 22.13 (dibutuhkan node:sqlite).
          if ! node -e "const [a,b]=process.versions.node.split('.').map(Number); process.exit(a>22||(a===22&&b>=13)?0:1)" 2>/dev/null; then
            NODE_VERSION=v22.22.0
            mkdir -p "$TOOLS_DIR"
            curl -fsSL "https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-linux-x64.tar.gz" -o "$TOOLS_DIR/node.tar.gz"
            rm -rf "$TOOLS_DIR/node" && mkdir -p "$TOOLS_DIR/node"
            tar -xzf "$TOOLS_DIR/node.tar.gz" -C "$TOOLS_DIR/node" --strip-components=1
            rm "$TOOLS_DIR/node.tar.gz"
          fi
          # Pasang Bun lewat npm (tidak butuh unzip) jika belum ada.
          if ! command -v bun >/dev/null 2>&1; then
            npm install --prefix "$TOOLS_DIR/bun" --no-save bun@1.4
          fi
          node -v
          npm -v
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

    stage('Deploy ke Delcom') {
      when {
        expression { return params.DEPLOY && params.DEPLOY_TARGET == 'delcom' }
      }
      steps {
        // Kredensial Secret text: "delcom-website-id" (WEBSITE_ID) dan "delcom-deploy-token" (DEPLOY_TOKEN).
        withCredentials([
          string(credentialsId: 'delcom-website-id', variable: 'WEBSITE_ID'),
          string(credentialsId: 'delcom-deploy-token', variable: 'DEPLOY_TOKEN')
        ]) {
          sh '''
            BODY=$(printf '{"website_id":"%s","token":"%s"}' "$WEBSITE_ID" "$DEPLOY_TOKEN")
            echo "Memicu redeploy Delcom..."
            curl -fsS -X POST "$DELCOM_URL_REDEPLOY" \
              -H "Content-Type: application/json" -H "Accept: application/json" \
              -H "Authorization: Bearer $DEPLOY_TOKEN" -d "$BODY"
            echo
            # Memantau progres deploy (maks. 10 menit); berhenti jika status selesai/gagal.
            for i in $(seq 1 60); do
              RESP=$(curl -fsS -X POST "$DELCOM_URL_PROGRESS" \
                -H "Content-Type: application/json" -H "Accept: application/json" \
                -H "Authorization: Bearer $DEPLOY_TOKEN" -d "$BODY" || true)
              echo "Progres: $RESP"
              if echo "$RESP" | grep -qiE '"status" *: *"(success|succeeded|done|completed|finished|selesai)"'; then exit 0; fi
              if echo "$RESP" | grep -qiE '"status" *: *"(failed|error|gagal)"'; then echo "Deploy Delcom gagal" >&2; exit 1; fi
              sleep 10
            done
            echo "Status progres tidak dikenali; lanjut ke verifikasi health check."
          '''
        }
      }
    }

    stage('Deploy ke Hugging Face') {
      when {
        expression { return params.DEPLOY && params.DEPLOY_TARGET == 'huggingface' && params.HF_SPACE?.trim() }
      }
      steps {
        // Kredensial "hf-token" (Secret text): access token Hugging Face dengan izin write.
        withCredentials([string(credentialsId: 'hf-token', variable: 'HF_TOKEN')]) {
          sh '''
            curl -fsS -X POST -H "Authorization: Bearer $HF_TOKEN" \
              "https://huggingface.co/api/spaces/${HF_SPACE}/restart?factory=true"
          '''
        }
      }
    }

    stage('Verify Deployment') {
      when {
        expression { return params.DEPLOY }
      }
      steps {
        sh '''
          URL="${APP_URL}"
          if [ "$DEPLOY_TARGET" = "huggingface" ] && [ -n "$HF_SPACE" ]; then
            URL="https://$(echo "$HF_SPACE" | tr '[:upper:]' '[:lower:]' | tr '/_.' '---').hf.space"
          fi
          sleep 30   # beri waktu server memulai ulang aplikasi
          for i in $(seq 1 60); do
            if curl -fsS "$URL/api/health" | grep '"status":"ok"'; then
              echo "Deployment terverifikasi: $URL"
              exit 0
            fi
            sleep 10
          done
          echo "Health check $URL gagal" >&2
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

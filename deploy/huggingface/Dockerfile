# Dockerfile khusus Hugging Face Spaces (Docker SDK).
# Space hanya berisi file ini dan README.md; kode diambil dari repository GitHub publik saat build,
# sehingga tidak perlu push file biner (screenshot/flowchart) ke Hugging Face.

ARG REPO=danielsmjtk5/ifs24021-pabwe2026-proyek1
ARG BRANCH=main

# 0) Ambil kode terbaru dari GitHub
FROM alpine/git:latest AS source
ARG REPO
ARG BRANCH
ARG REPO_URL=https://github.com/${REPO}.git
ARG COMMIT_URL=https://api.github.com/repos/${REPO}/commits/${BRANCH}
# Membaca commit terakhir agar Docker tidak memakai cache clone lama saat Space di-rebuild.
ADD ${COMMIT_URL} /tmp/latest-commit.json
RUN git clone --depth 1 --branch "${BRANCH}" "${REPO_URL}" /src

# 1) Build front-end dengan Bun
FROM oven/bun:1.4 AS frontend
WORKDIR /app/front-end
COPY --from=source /src/front-end/package.json /src/front-end/bun.lock ./
RUN bun install --frozen-lockfile
COPY --from=source /src/front-end/ ./
RUN bun run build

# 2) Back-end Node.js (SQLite bawaan node:sqlite)
FROM node:22-bookworm-slim
WORKDIR /app/back-end
COPY --from=source /src/back-end/package.json /src/back-end/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=source /src/back-end/ ./
COPY --from=frontend /app/front-end/dist /app/front-end/dist

# Nilai non-rahasia. JWT_SECRET, ADMIN_EMAIL, dan ADMIN_PASSWORD diisi lewat
# Settings -> Variables and secrets pada Space.
# Storage gratis Space bersifat sementara: database dibuat ulang (dengan data demo) setiap restart.
ENV NODE_ENV=production \
    PORT=7860 \
    DB_PATH=/data/asramacare.db \
    STATIC_DIR=/app/front-end/dist \
    SEED_DEMO=true \
    COOKIE_SECURE=true \
    COOKIE_SAMESITE=none \
    FRAME_ANCESTORS=https://huggingface.co

# Space menjalankan container sebagai uid 1000 (user "node" pada image ini).
RUN mkdir -p /data && chown -R 1000:1000 /data /app
USER 1000
EXPOSE 7860

CMD ["sh", "-c", "node --disable-warning=ExperimentalWarning database/seeds/seed.js && node --disable-warning=ExperimentalWarning src/server.js"]

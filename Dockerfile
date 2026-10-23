# Image produksi AsramaCare: satu layanan Express yang menyajikan REST API
# sekaligus hasil build React. Database SQLite disimpan di /data (hubungkan volume persisten ke path ini bila hosting mendukung).

# 1) Build front-end dengan Bun
FROM oven/bun:1.4 AS frontend
WORKDIR /app/front-end
COPY front-end/package.json front-end/bun.lock ./
RUN bun install --frozen-lockfile
COPY front-end/ ./
RUN bun run build

# 2) Back-end Node.js (SQLite bawaan node:sqlite, tanpa kompilasi native)
FROM node:22-bookworm-slim AS backend
WORKDIR /app/back-end
COPY back-end/package.json back-end/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY back-end/ ./
COPY --from=frontend /app/front-end/dist /app/front-end/dist

ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/data/asramacare.db \
    STATIC_DIR=/app/front-end/dist

RUN mkdir -p /data && chown -R node:node /data /app
USER node
EXPOSE 3000

# Migrasi berjalan otomatis saat koneksi dibuka; seed hanya membuat admin jika belum ada.
CMD ["sh", "-c", "node --disable-warning=ExperimentalWarning database/seeds/seed.js && node --disable-warning=ExperimentalWarning src/server.js"]

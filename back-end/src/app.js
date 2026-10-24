import fs from 'node:fs';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import env from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import routes from './routes/index.js';

export function createApp({ staticDir = env.staticDir } = {}) {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  // Respon API selalu dinamis; tanpa ETag klien/auditor tidak menerima 304 Not Modified.
  app.set('etag', false);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // Mengizinkan Google Fonts yang dipakai front-end.
          'style-src': ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          // Hugging Face Spaces menampilkan aplikasi di dalam iframe huggingface.co.
          'frame-ancestors': ["'self'", ...env.frameAncestors],
        },
      },
      // X-Frame-Options tidak mendukung daftar origin, jadi dimatikan bila iframe diizinkan.
      xFrameOptions: env.frameAncestors.length > 0 ? false : { action: 'sameorigin' },
    }),
  );
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use('/api', routes);
  app.use('/api', notFoundHandler);

  // Mode produksi satu layanan: Express juga menyajikan hasil build React.
  const distDir = staticDir ? path.resolve(staticDir) : '';
  if (distDir && fs.existsSync(path.join(distDir, 'index.html'))) {
    // Aset ber-hash (assets/*) boleh di-cache; index.html selalu dikirim baru (200, bukan 304)
    // agar halaman seperti /auth/login dapat diakses auditor dan versi terbaru langsung terpakai.
    // res.end dipakai langsung karena res.send/sendFile bisa membalas 304 untuk permintaan bersyarat.
    const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'));
    app.use(express.static(distDir, { index: false }));
    app.get('/{*splat}', (req, res) => {
      res.status(200).type('html').set('Cache-Control', 'no-store').end(indexHtml);
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

export default createApp;
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
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // Mengizinkan Google Fonts yang dipakai front-end.
          'style-src': ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
        },
      },
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
    app.use(express.static(distDir));
    app.get('/{*splat}', (req, res) => res.sendFile(path.join(distDir, 'index.html')));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

export default createApp;

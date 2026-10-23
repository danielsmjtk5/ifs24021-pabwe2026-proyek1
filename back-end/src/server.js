import { createApp } from './app.js';
import { closeDb, getDb } from './config/database.js';
import env from './config/env.js';

getDb();
const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`AsramaCare API berjalan di http://localhost:${env.port} (${env.nodeEnv})`);
});

function shutdown() {
  server.close(() => {
    closeDb();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

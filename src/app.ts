<<<<<<< HEAD
import express from 'express';
import bodyParser from 'body-parser';
import routes from './services/router';
import { logInfo } from './utils/logger';

export function createApp() {
  const app = express();
  app.use(bodyParser.json());
  app.use('/api', routes);
  logInfo('TradingIQ automation api started');
  return app;
}
=======
import express from 'express';
import bodyParser from 'body-parser';
import routes from './services/router';
import { logInfo } from './utils/logger';

export function createApp() {
  const app = express();
  app.use(bodyParser.json());
  app.use('/api', routes);
  logInfo('TradingIQ automation api started');
  return app;
}
>>>>>>> a34b550ff69e15b298aff73a6573db3d2f9b064e

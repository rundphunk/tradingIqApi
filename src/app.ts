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

import { Router } from 'express';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { logInfo, logToFile } from '../utils/logger';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const service = new WebhookService();
const controller = new WebhookController(service);

const router = Router();

interface Route {
  path: string,
  action: string
}

export enum RouteActions {
  LongOrder = "LongOrder",
  SetLongTpPrice = "SetLongTpPrice",
  SetLongSlPrice = "SetLongSlPrice",
  ShortOrder = "ShortOrder",
  SetShortTpPrice = "SetShortTpPrice",
  SetShortSlPrice = "SetShortSlPrice",
  CloseLong = "CloseLong",
  CloseShort = "CloseShort"
}

const routes: Route[] = [
  { path: '/longEntryPrice', action: RouteActions.LongOrder},
  { path: '/setLongTpPrice', action: RouteActions.SetLongTpPrice},
  { path: '/setLongSlPrice', action: RouteActions.SetLongSlPrice},
  { path: '/shortEntryPrice', action: RouteActions.ShortOrder},
  { path: '/setShortTpPrice', action: RouteActions.SetShortTpPrice},
  { path: '/setShortSlPrice', action: RouteActions.SetShortSlPrice},
  { path: '/closeLong', action: RouteActions.CloseLong},
  { path: '/closeShort', action: RouteActions.CloseShort}
] ;

router.use((req, _res, next) => {
  if (process.env["LOG_TO_CONSOLE"] === 'true') logInfo(`API route called: ${req.method} ${req.originalUrl}`);
  if (process.env["LOG_TO_FILE"] === 'true') logToFile(`API route called: ${req.method} ${req.originalUrl}`);
  if (process.env["LOG_REQUESTS_TO_CONSOLE"] === 'true') logInfo(req.body);
  if (process.env["LOG_REQUESTS_TO_FILE"] === 'true') logToFile(`${JSON.stringify(req.body, null, 2)}`)
  next();
});

routes.forEach( route => router.post(route.path, (req, res) => controller.handleWebhook(req, res, route.action)));

export default router;

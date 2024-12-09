import { Router } from 'express';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

const service = new WebhookService();
const controller = new WebhookController(service);

const router = Router();

interface Route {
  path: string,
  action: string
}

export enum RouteActions {
  LongEntryPrice = "LongEntryPrice",
  SetLongTpPrice = "SetLongTpPrice",
  SetLongSlPrice = "SetLongSlPrice",
  ShortEntryPrice = "ShortEntryPrice",
  SetShortTpPrice = "SetShortTpPrice",
  SetShortSlPrice = "SetShortSlPrice"
}

const routes: Route[] = [
  { path: '/longEntryPrice', action: RouteActions.LongEntryPrice},
  { path: '/setLongTpPrice', action: RouteActions.SetLongTpPrice},
  { path: '/setLongSlPrice', action: RouteActions.SetLongSlPrice},
  { path: '/shortEntryPrice', action: RouteActions.ShortEntryPrice},
  { path: '/setShortTpPrice', action: RouteActions.SetShortTpPrice},
  { path: '/setShortSlPrice', action: RouteActions.SetShortSlPrice}
] ;

router.use((req, _res, next) => {
    console.log(`API route called: ${req.method} ${req.originalUrl}`);
    console.log(req.body);
    next();
  });

routes.forEach( route => router.post(route.path, (req, res) => controller.handleWebhook(req, res, route.action)));

export default router;

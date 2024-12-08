<<<<<<< HEAD
import { Router } from 'express';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

const service = new WebhookService();
const controller = new WebhookController(service);

const router = Router();

router.use((req, _res, next) => {
    console.log(`API route called: ${req.method} ${req.originalUrl}`);
    console.log(req.body);
    next();
  });

router.post('/longEntryPrice', (req, res) => controller.handleWebhook(req, res, "LongEntryPrice"));
router.post('/setLongTpPrice', (req, res) => controller.handleWebhook(req, res, "SetLongTpPrice"));
router.post('/setLongSlPrice', (req, res) => controller.handleWebhook(req, res, "SetLongSlPrice"));
router.post('/shortEntryPrice', (req, res) => controller.handleWebhook(req, res, "ShortEntryPrice"));
router.post('/setShortTpPrice', (req, res) => controller.handleWebhook(req, res, "SetShortTpPrice"));
router.post('/setShortSlPrice', (req, res) => controller.handleWebhook(req, res, "SetShortSlPrice"));

export default router;
=======
import { Router } from 'express';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

const service = new WebhookService();
const controller = new WebhookController(service);

const router = Router();

router.use((req, _res, next) => {
    console.log(`API route called: ${req.method} ${req.originalUrl}`);
    console.log(req.body);
    next();
  });

router.post('/longEntryPrice', (req, res) => controller.handleWebhook(req, res, "LongEntryPrice"));
router.post('/setLongTpPrice', (req, res) => controller.handleWebhook(req, res, "SetLongTpPrice"));
router.post('/setLongSlPrice', (req, res) => controller.handleWebhook(req, res, "SetLongSlPrice"));
router.post('/shortEntryPrice', (req, res) => controller.handleWebhook(req, res, "ShortEntryPrice"));
router.post('/setShortTpPrice', (req, res) => controller.handleWebhook(req, res, "SetShortTpPrice"));
router.post('/setShortSlPrice', (req, res) => controller.handleWebhook(req, res, "SetShortSlPrice"));

export default router;
>>>>>>> a34b550ff69e15b298aff73a6573db3d2f9b064e

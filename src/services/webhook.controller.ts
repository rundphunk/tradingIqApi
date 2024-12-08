import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';
import { logError, logRequestProcessingTime } from '../utils/logger';

export class WebhookController {
  private service: WebhookService;

  constructor(service: WebhookService) {
    this.service = service;
  }

  async handleWebhook(req: Request, res: Response, action: string) {
    const requestTime = new Date();
    try {
      let result;
      switch (action) {
        case "LongEntryPrice":
          result = await this.service.handleLongEntryPrice(req.body);
          break;
        case "SetLongTpPrice":
          result = await this.service.handleSetLongTpPrice(req.body);
          break;
        case "SetLongSlPrice":
          result = await this.service.handleSetLongSlPrice(req.body);
          break;
        case "ShortEntryPrice":
          result = await this.service.handleShortEntryPrice(req.body);
          break;
        case "SetShortTpPrice":
          result = await this.service.handleSetShortTpPrice(req.body);
          break;
        case "SetShortSlPrice":
          result = await this.service.handleSetShortSlPrice(req.body);
          break;
      }
      res.status(200).json(result);
    } catch (error) {
      logError(`Webhook handling failed: ${(error as Error).message}`);
      res.status(500).send('Webhook handling failed');
    } finally {
      const responseTime = new Date();
      logRequestProcessingTime(requestTime, responseTime);
    }
  }

}

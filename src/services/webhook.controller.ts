import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';
import { logError, logRequestProcessingTime } from '../utils/logger';
import { RouteActions } from './router';

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
        case RouteActions.LongEntryPrice:
          result = await this.service.handleLongEntryPrice(req.body);
          break;
        case RouteActions.SetLongTpPrice:
          result = await this.service.handleSetLongTpPrice(req.body);
          break;
        case RouteActions.SetLongSlPrice:
          result = await this.service.handleSetLongSlPrice(req.body);
          break;
        case RouteActions.ShortEntryPrice:
          result = await this.service.handleShortEntryPrice(req.body);
          break;
        case RouteActions.SetShortTpPrice:
          result = await this.service.handleSetShortTpPrice(req.body);
          break;
        case RouteActions.SetShortSlPrice:
          result = await this.service.handleSetShortSlPrice(req.body);
          break;
      }
      res.status(200).json(result);
    } catch (error) {
      logError(`Webhook handling failed: ${(error as Error).message}`);
      res.status(500).send(`Webhook handling failed: ${(error as Error).message}`);
    } finally {
      const responseTime = new Date();
      logRequestProcessingTime(requestTime, responseTime);
    }
  }

}

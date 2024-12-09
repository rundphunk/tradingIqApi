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
        case RouteActions.LongOrder:
          result = await this.service.createLongOrder(req.body);
          break;
        case RouteActions.SetLongTpPrice:
          result = await this.service.setLongTakeProfitPrice(req.body);
          break;
        case RouteActions.SetLongSlPrice:
          result = await this.service.setLongStopLossPrice(req.body);
          break;
        case RouteActions.ShortOrder:
          result = await this.service.createShortOrder(req.body);
          break;
        case RouteActions.SetShortTpPrice:
          result = await this.service.setShortTakeProfitPrice(req.body);
          break;
        case RouteActions.SetShortSlPrice:
          result = await this.service.setShortStopLossPrice(req.body);
          break;
        case RouteActions.CloseLong:
          result = await this.service.closeLongPositions(req.body);
          break;
        case RouteActions.CloseShort:
          result = await this.service.closeShortPositions(req.body);
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

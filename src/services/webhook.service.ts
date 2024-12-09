import { IWebhookPayload } from '../interfaces/IWebhookPayload';
import dotenv from 'dotenv';
import { PhemexService } from './exchanges/phemex.service';

// Load environment variables from .env file
dotenv.config();

export class WebhookService {
  private exchangeServices: { [key: string]: any } = {};

  constructor() {
    this.initializeExchangeServices();
  }

  // Initialize exchange services
  private initializeExchangeServices() {
    if (process.env['ENABLE_PHEMEX'] === 'true' && process.env['PHEMEX_API_KEY'] && process.env['PHEMEX_API_SECRET']) {
      this.exchangeServices['phemex'] = new PhemexService();
    }
  }

  // Get the exchange service instance by name
  getExchangeService(exchangeName: string): any {
    const exchangeService = this.exchangeServices[exchangeName.toLowerCase()];
    if (!exchangeService) {
      throw new Error(`Exchange ${exchangeName} not supported`);
    }
    return exchangeService;
  }

  getExchange(payload: IWebhookPayload) {
    return payload.exchange?.toUpperCase() || process.env['DEFAULT_EXCHANGE']?.toUpperCase() + '';
  }

  async createLongOrder(payload: IWebhookPayload) {   
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.createLongOrder(payload);
  }

  async setLongTakeProfitPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.setLongTakeProfitPrice(payload);
  }

  async setLongStopLossPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.setLongStopLossPrice(payload);
  }

  async createShortOrder(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.createShortOrder(payload);
  }

  async setShortTakeProfitPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.setShortTakeProfitPrice(payload);
  }

  async setShortStopLossPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.setShortStopLossPrice(payload);
  }

  async closeLongPositions(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    try {
      await exchangeService.closeLongPositions(payload);
    } catch (error) {
      console.error(`Error closing long positions: ${(error as Error).message}`);
    }
    try {
      await exchangeService.cancelLongOrders(payload);
    } catch (error) {
      console.error(`Error closing long orders: ${(error as Error).message}`);
    }
  }

  async closeShortPositions(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    try {
      await exchangeService.closeShortPositions(payload);
    } catch (error) {
      console.error(`Error closing short positions: ${(error as Error).message}`);
    }
    try {
      await exchangeService.cancelShortOrders(payload);
    } catch (error) {
      console.error(`Error closing short orders: ${(error as Error).message}`);
    }
  }
}

<<<<<<< HEAD
import { IWebhookPayload } from '../interfaces/IWebhookPayload';
import dotenv from 'dotenv';
import { PhemexService } from './exchanges/phemex.service';
import { BitfinexService } from './exchanges/bitfinex.service';

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
    if (process.env['ENABLE_BITFINEX'] === 'true' && process.env['BITFINEX_API_KEY'] && process.env['BITFINEX_API_SECRET']) {
      this.exchangeServices['bitfinex'] = new BitfinexService();
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

  async handleLongEntryPrice(payload: IWebhookPayload) {   
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.handleLongEntryPrice(payload);
  }

  async handleSetLongTpPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.handleSetLongTpPrice(payload);
  }

  async handleSetLongSlPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.handleSetLongSlPrice(payload);
  }

  async handleShortEntryPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.handleShortEntryPrice(payload);
  }

  async handleSetShortTpPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.handleSetShortTpPrice(payload);
  }

  async handleSetShortSlPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.handleSetShortSlPrice(payload);
  }
}
=======
import { IWebhookPayload } from '../interfaces/IWebhookPayload';
import dotenv from 'dotenv';
import { PhemexService } from './exchanges/phemex.service';
import { BitfinexService } from './exchanges/bitfinex.service';

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
    if (process.env['ENABLE_BITFINEX'] === 'true' && process.env['BITFINEX_API_KEY'] && process.env['BITFINEX_API_SECRET']) {
      this.exchangeServices['bitfinex'] = new BitfinexService();
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

  async handleLongEntryPrice(payload: IWebhookPayload) {   
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.handleLongEntryPrice(payload);
  }

  async handleSetLongTpPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.handleSetLongTpPrice(payload);
  }

  async handleSetLongSlPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.handleSetLongSlPrice(payload);
  }

  async handleShortEntryPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.handleShortEntryPrice(payload);
  }

  async handleSetShortTpPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.handleSetShortTpPrice(payload);
  }

  async handleSetShortSlPrice(payload: IWebhookPayload) {
    const exchangeService = this.getExchangeService(this.getExchange(payload));
    return await exchangeService.handleSetShortSlPrice(payload);
  }
}
>>>>>>> a34b550ff69e15b298aff73a6573db3d2f9b064e

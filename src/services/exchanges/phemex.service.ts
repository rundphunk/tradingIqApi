import { IWebhookPayload } from '../../interfaces/IWebhookPayload';
import { PhemexServiceContracts } from './phemex.service.contracts';
import { PhemexServiceSpot } from './phemex.service.spot';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export class PhemexService {
  private contractsService: PhemexServiceContracts;
  private spotService: PhemexServiceSpot;

  constructor() {
    this.contractsService = new PhemexServiceContracts();
    this.spotService = new PhemexServiceSpot();
  }

  isUsingContracts(payload: IWebhookPayload) {
    return payload.symbol.includes(':');
  }

  async createLongOrder(payload: IWebhookPayload) {
    return this.isUsingContracts(payload) 
      ? this.contractsService.createLongOrder(payload) 
      : this.spotService.createLongOrder(payload);
  }

  async createShortOrder(payload: IWebhookPayload) {
    return this.isUsingContracts(payload) 
      ? this.contractsService.createShortOrder(payload) 
      : this.spotService.createShortOrder(payload);
  }

  async closeLongPositions(payload: IWebhookPayload) {
    return this.isUsingContracts(payload) 
      ? this.contractsService.closeLongPositions(payload) 
      : this.spotService.closeLongPositions(payload);
  }

  async cancelLongOrders(payload: IWebhookPayload) {
    return this.isUsingContracts(payload) 
      ? this.contractsService.cancelLongOrders(payload) 
      : this.spotService.cancelLongOrders(payload);
  }

  async closeShortPositions(payload: IWebhookPayload) {
    return this.isUsingContracts(payload) 
      ? this.contractsService.closeShortPositions(payload) 
      : this.spotService.closeShortPositions(payload);
  }

  async cancelShortOrders(payload: IWebhookPayload) {
    return this.isUsingContracts(payload) 
      ? this.contractsService.cancelShortOrders(payload) 
      : this.spotService.cancelShortOrders(payload);
  }

  async setLongTakeProfitPrice(payload: IWebhookPayload) {
    return this.isUsingContracts(payload) 
      ? this.contractsService.setLongTakeProfitPrice(payload) 
      : this.spotService.setLongTakeProfitPrice(payload);
  }

  async setLongStopLossPrice(payload: IWebhookPayload) {
    return this.isUsingContracts(payload) 
      ? this.contractsService.setLongStopLossPrice(payload) 
      : this.spotService.setLongStopLossPrice(payload);
  }

  async setShortTakeProfitPrice(payload: IWebhookPayload) {
    return this.isUsingContracts(payload) 
      ? this.contractsService.setShortTakeProfitPrice(payload) 
      : this.spotService.setShortTakeProfitPrice(payload);
  }

  async setShortStopLossPrice(payload: IWebhookPayload) {
    return this.isUsingContracts(payload) 
      ? this.contractsService.setShortStopLossPrice(payload) 
      : this.spotService.setShortStopLossPrice(payload);
  }
}

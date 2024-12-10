import { IWebhookPayload } from '../../interfaces/IWebhookPayload';
import { PhemexServiceContracts } from './phemex.service.contracts';
import { PhemexServiceSpot } from './phemex.service.spot';
import dotenv from 'dotenv';
import { createWebSocket, webSocketLogin, listenForOrderFulfillment, startHeartbeat as startHeartbeatAndListen } from './phemex.websocket';

// Load environment variables from .env file
dotenv.config();

export class PhemexService {
  private contractsService: PhemexServiceContracts;
  private spotService: PhemexServiceSpot;

  constructor() {
    this.contractsService = new PhemexServiceContracts((orderID, callback) => this.listenForOrderFulfillment(orderID, callback));
    this.spotService = new PhemexServiceSpot();
    createWebSocket();
    webSocketLogin((error, data) => {
      if (error) {
        console.error('WebSocket login error:', error);
      } else {
        console.log('WebSocket login successful:', data);
        startHeartbeatAndListen();
      }
    });
  }

  isUsingContracts(payload: IWebhookPayload) {
    return payload.symbol.includes(':');
  }

  async createLongOrder(payload: IWebhookPayload) {
    if (this.isUsingContracts(payload)) {
      const createdOrder = await this.contractsService.createLongOrder(payload);
      return createdOrder;
    } else {
      return this.spotService.createLongOrder(payload);
    }
  }

  async createShortOrder(payload: IWebhookPayload) {
    if (this.isUsingContracts(payload)) {
      const createdOrder = await this.contractsService.createShortOrder(payload);
      return createdOrder;
    } else {
      return this.spotService.createShortOrder(payload);
    }
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

  // WebSocket related methods
  public listenForOrderFulfillment(orderID: string, callback: (message: any) => void) {
    console.log("listening for order fulfillment of order " + orderID);
    listenForOrderFulfillment(orderID, callback);
  }
}

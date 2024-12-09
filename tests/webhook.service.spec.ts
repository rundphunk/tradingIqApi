import { WebhookService } from '../src/services/webhook.service';
import { IWebhookPayload } from '../src/interfaces/IWebhookPayload';
import { PhemexService } from '../src/services/exchanges/phemex.service';
// import { BitfinexService } from '../src/services/exchanges/bitfinex.service';
import dotenv from 'dotenv';

dotenv.config();

describe('WebhookService', () => {
  let service: WebhookService;

  beforeAll(() => {
    process.env.USE_SANDBOX = 'true';
  });

  beforeEach(() => {
    service = new WebhookService();
    const exchangeService = service.getExchangeService('phemex');
    expect(exchangeService).toBeDefined();
    // const payload: IWebhookPayload = { symbol: 'ETH/USDT', };
  });

  it('should initialize exchange services based on environment variables', () => {
    // console.log(process.env);
    expect(service.getExchangeService('phemex')).toBeInstanceOf(PhemexService);
  });

  it('should throw an error for unsupported exchange', () => {
    expect(() => service.getExchangeService('unsupported')).toThrow('Exchange unsupported not supported');
  });

  // it('should handle long entry price with a limit order', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'ETH/USDT', amount: 0.1, orderType: 'limit', longLimitOrderPrice: 2500 };
  //   // prepare
  //   // await service.closeLongPositions(payload);
  //   // await service.closeShortPositions(payload);
  //   // create order
  //   const promise = service.createLongOrder(payload);
  //   expect(promise).resolves.not.toThrow();
  //   // cleanup
  //   // await service.closeLongPositions(payload);
  //   // await service.closeShortPositions(payload);
  // }, 10000); // Custom timeout of 10 seconds

  // it('should handle long entry price with a market order', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'ETH/USDT', amount: 0.1, orderType: 'market' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   await expect(service.createLongOrder(payload)).resolves.not.toThrow();
  // });

  // it('should handle set long TP price', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'ETH/USDT', longPositionTp1: 5000 };
  //   const exchangeService = service.getExchangeService('phemex');
  //   await expect(service.setLongTakeProfitPrice(payload)).resolves.not.toThrow();
  // });

  // it('should handle set long SL price', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'ETH/USDT', longPositionSl: 2300  };
  //   const exchangeService = service.getExchangeService('phemex');
  //   await expect(service.setLongStopLossPrice(payload)).resolves.not.toThrow();
  // });

  // it('should handle short entry price with a limit order', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'ETH/USDT', amount: 0.1, orderType: 'limit' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   await expect(service.createShortOrder(payload)).resolves.not.toThrow();
  //   expect(exchangeService.createShortOrder).toHaveBeenCalledWith(payload);
  // });

  // it('should handle short entry price with a market order', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'ETH/USDT', amount: 0.1, orderType: 'market' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   await expect(service.createShortOrder(payload)).resolves.not.toThrow();
  //   expect(exchangeService.createShortOrder).toHaveBeenCalledWith(payload);
  // });

  // it('should handle set short TP price', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'ETH/USDT', shortPositionTp1: 50000  };
  //   const exchangeService = service.getExchangeService('phemex');
  //   await expect(service.setShortTakeProfitPrice(payload)).resolves.not.toThrow();
  //   expect(exchangeService.setShortTakeProfitPrice).toHaveBeenCalledWith(payload);
  // });

  // it('should handle set short SL price', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'ETH/USDT', shortPositionSl: 150000  };
  //   const exchangeService = service.getExchangeService('phemex');
  //   await expect(service.setShortStopLossPrice(payload)).resolves.not.toThrow();
  //   expect(exchangeService.setShortStopLossPrice).toHaveBeenCalledWith(payload);
  // });

  // it('should close long positions and orders', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'BTCUSD' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   await expect(service.closeLongPositions(payload)).resolves.not.toThrow();
  //   expect(exchangeService.closeLongPositions).toHaveBeenCalledWith(payload);
  //   expect(exchangeService.cancelLongOrders).toHaveBeenCalledWith(payload);
  // });

  // it('should close short positions and orders', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'BTCUSD' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   await expect(service.closeShortPositions(payload)).resolves.not.toThrow();
  //   expect(exchangeService.closeShortPositions).toHaveBeenCalledWith(payload);
  //   expect(exchangeService.cancelShortOrders).toHaveBeenCalledWith(payload);
  // });

});

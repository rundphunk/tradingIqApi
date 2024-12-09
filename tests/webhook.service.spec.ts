import { WebhookService } from '../src/services/webhook.service';
import { IWebhookPayload } from '../src/interfaces/IWebhookPayload';
import { PhemexService } from '../src/services/exchanges/phemex.service';
// import { BitfinexService } from '../src/services/exchanges/bitfinex.service';

jest.mock('../src/services/exchanges/phemex.service');
jest.mock('../src/services/exchanges/bitfinex.service');

describe('WebhookService', () => {
  let service: WebhookService;

  beforeAll(() => {
    process.env.USE_SANDBOX = 'true';
  });

  beforeEach(() => {
    service = new WebhookService();
  });

  it('should initialize exchange services based on environment variables', () => {
    expect(service.getExchangeService('phemex')).toBeInstanceOf(PhemexService);
    // expect(service.getExchangeService('bitfinex')).toBeInstanceOf(BitfinexService);
  });

  it('should throw an error for unsupported exchange', () => {
    expect(() => service.getExchangeService('unsupported')).toThrow('Exchange unsupported not supported');
  });

  // it('should handle long entry price with a limit order', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'BTC/USDT', amount: 0.1, orderType: 'limit' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   // await service.handleLongOrder(payload);
  //   expect(exchangeService.createLongOrder).toHaveBeenCalledWith(payload);
  // });

  // it('should handle long entry price with a market order', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'BTC/USDT', amount: 0.1, orderType: 'market' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   // await service.handleLongOrder(payload);
  //   expect(exchangeService.createLongOrder).toHaveBeenCalledWith(payload);
  // });

  // it('should handle set long TP price', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'BTC/USDT' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   // await service.handleSetLongTpPrice(payload);
  //   expect(exchangeService.setLongTakeProfitPrice).toHaveBeenCalledWith(payload);
  // });

  // it('should handle set long SL price', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'BTC/USDT' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   // await service.handleSetLongSlPrice(payload);
  //   expect(exchangeService.setLongStopLossPrice).toHaveBeenCalledWith(payload);
  // });

  // it('should handle short entry price', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'BTC/USDT' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   // await service.handleShortOrder(payload);
  //   expect(exchangeService.createShortOrder).toHaveBeenCalledWith(payload);
  // });

  // it('should handle set short TP price', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'BTC/USDT' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   // await service.handleSetShortTpPrice(payload);
  //   expect(exchangeService.setShortTakeProfitPrice).toHaveBeenCalledWith(payload);
  // });

  // it('should handle set short SL price', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'BTC/USDT' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   // await service.handleSetShortSlPrice(payload);
  //   expect(exchangeService.setShortStopLossPrice).toHaveBeenCalledWith(payload);
  // });

  // it('should close long positions and orders', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'BTCUSD' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   // await service.handleCloseLong(payload);
  //   expect(exchangeService.closeLongPositions).toHaveBeenCalledWith(payload);
  //   expect(exchangeService.cancelLongOrders).toHaveBeenCalledWith(payload);
  // });

  // it('should close short positions and orders', async () => {
  //   const payload: IWebhookPayload = { exchange: 'phemex', symbol: 'BTCUSD' };
  //   const exchangeService = service.getExchangeService('phemex');
  //   // await service.handleCloseShort(payload);
  //   expect(exchangeService.closeShortPositions).toHaveBeenCalledWith(payload);
  //   expect(exchangeService.cancelShortOrders).toHaveBeenCalledWith(payload);
  // });

});

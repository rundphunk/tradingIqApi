import { WebhookService } from '../src/services/webhook.service';
import { IExchange } from '../src/exchanges/IExchange';
import { IPositionRepository } from '../src/repositories/IPositionRepository';
import { IWebhookPayload } from '../src/interfaces/IWebhookPayload';

describe('WebhookService', () => {
  let exchangeMock: IExchange;
  let repoMock: IPositionRepository;
  let service: WebhookService;

  beforeEach(() => {
    exchangeMock = {
      createOrder: jest.fn().mockResolvedValue('test-order-id'),
      closePosition: jest.fn().mockResolvedValue(undefined)
    };

    repoMock = {
      create: jest.fn().mockResolvedValue({ _id: 'pos1', symbol: 'BTCUSDT', side: 'long', amount: 1, status: 'open', createdAt: new Date() }),
      updateStatus: jest.fn().mockResolvedValue(null),
      findOpenPositions: jest.fn().mockResolvedValue([])
    };

    service = new WebhookService({ binance: exchangeMock }, repoMock);
  });

  it('should open a position', async () => {
    const payload: IWebhookPayload = {
      action: 'open_position',
      symbol: 'BTCUSDT',
      side: 'long',
      amount: 1
    };

    const result = await service.handleWebhook(payload);
    expect(exchangeMock.createOrder).toHaveBeenCalledWith({ symbol: 'BTCUSDT', side: 'buy', amount: 1 });
    expect(repoMock.create).toHaveBeenCalled();
    expect(result).toHaveProperty('message', 'Position opened');
  });

  it('should close a position', async () => {
    const payload: IWebhookPayload = {
      action: 'close_position',
      symbol: 'BTCUSDT',
      side: 'long',
      amount: 1
    };

    (repoMock.findOpenPositions as jest.Mock).mockResolvedValue([{ _id: 'pos1', symbol: 'BTCUSDT', side: 'long', amount: 1, status: 'open', createdAt: new Date() }]);

    const result = await service.handleWebhook(payload);
    expect(exchangeMock.closePosition).toHaveBeenCalledWith('BTCUSDT');
    expect(repoMock.updateStatus).toHaveBeenCalledWith('pos1', 'closed');
    expect(result).toHaveProperty('message', 'Position closed');
  });
});

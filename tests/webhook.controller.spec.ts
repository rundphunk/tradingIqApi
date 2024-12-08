<<<<<<< HEAD
import request from 'supertest';
import { createApp } from '../src/app';
import { WebhookService } from '../src/services/webhook.service';

jest.mock('../src/services/webhook.service');

describe('WebhookController', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    const mockService = {
      handleWebhook: jest.fn().mockResolvedValue({ message: 'Position opened' })
    };
    (WebhookService as jest.Mock).mockImplementation(() => mockService);
    app = createApp();
  });

  it('should return a response for webhook', async () => {
    const response = await request(app)
      .post('/api/webhook')
      .send({ action: 'open_position', symbol: 'BTCUSDT', side: 'long', amount: 1 });
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Position opened');
  });
});
=======
import request from 'supertest';
import { createApp } from '../src/app';
import { WebhookService } from '../src/services/webhook.service';

jest.mock('../src/services/webhook.service');

describe('WebhookController', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    const mockService = {
      handleWebhook: jest.fn().mockResolvedValue({ message: 'Position opened' })
    };
    (WebhookService as jest.Mock).mockImplementation(() => mockService);
    app = createApp();
  });

  it('should return a response for webhook', async () => {
    const response = await request(app)
      .post('/api/webhook')
      .send({ action: 'open_position', symbol: 'BTCUSDT', side: 'long', amount: 1 });
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Position opened');
  });
});
>>>>>>> a34b550ff69e15b298aff73a6573db3d2f9b064e

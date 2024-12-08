<<<<<<< HEAD
import { IWebhookPayload } from '../../interfaces/IWebhookPayload';
import ccxt, { Exchange } from 'ccxt';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export class BitfinexService {
  private exchange!: Exchange;

  constructor() {
    this.initializeExchange();
  }

  private initializeExchange() {
    const useSandbox = process.env["USE_SANDBOX"] == "true";
    const apiKey = useSandbox ? process.env["BITFINEX_API_KEY_SANDBOX"] : process.env["BITFINEX_API_KEY"];
    const secret = useSandbox ? process.env["BITFINEX_API_SECRET_SANDBOX"] : process.env["BITFINEX_API_SECRET"];
    if (apiKey && secret) {
      this.exchange = new ccxt.bitfinex({
        apiKey: apiKey,
        secret: secret
      });
      if (useSandbox) this.exchange.setSandboxMode(true);
    } else {
      throw new Error('Bitfinex API keys not set');
    }
  }

  async handleLongEntryPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();
    await this.exchange.cancelAllOrders(payload.symbol);

    // Bitfinex does not support setting leverage directly via API
    // Leverage is managed through the amount of borrowed funds

    let createdOrder = { id: '' };
    if (payload.orderType === 'market') {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'exchange market',
        'buy',
        payload.amount
      );
    } else {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'exchange limit',
        'buy',
        payload.amount,
        payload.longLimitOrderPrice
      );
    }

    return { message: 'Position opened', orderId: createdOrder.id };
  }

  async handleSetLongTpPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();
    let contracts;

    // Fetch positions and find the long position for the symbol
    const positions = await this.exchange.fetchPositions([payload.symbol]);
    const position = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'long');
    if (position) {
      contracts = position.contracts;
    } else {
      const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
      const openLongOrder = openOrders.find(order => order.side === 'buy' && order.status === 'open');
      if (openLongOrder) {
        contracts = openLongOrder.amount;
      } else {
        return { message: `No long position or open long order found for ${payload.symbol}` };
      }
    }

    const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
    const existingTpOrder = openOrders.find(order => order.type === 'exchange limit' && order.side === 'sell' && order.status === 'open');
    if (existingTpOrder) {
      await this.exchange.cancelOrder(existingTpOrder.id, payload.symbol);
    }

    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'exchange limit',
      'sell',
      contracts,
      payload.longPositionTp1
    );

    return { message: 'TakeProfit order placed', orderId: createdOrder.id };
  }

  async handleSetLongSlPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();

    const positions = await this.exchange.fetchPositions([payload.symbol]);
    const position = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'long');
    if (!position) return { message: `No long position found for ${payload.symbol}` };

    const conditionalOrders = await this.exchange.fetchOpenOrders(payload.symbol, undefined, undefined, {
      'stop': true
    });
    const existingSlOrder = conditionalOrders.find(order => order.type === 'exchange stop' && order.side === 'sell' && order.status === 'open');
    if (existingSlOrder) {
      await this.exchange.cancelOrder(existingSlOrder.id, payload.symbol);
    }

    const params = {
      stopPrice: payload.longPositionSl
    };
    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'exchange stop',
      'sell',
      position.contracts,
      payload.longPositionSl,
      params
    );

    return { message: 'StopLoss order placed', orderId: createdOrder.id };
  }

  async handleShortEntryPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();
    await this.exchange.cancelAllOrders(payload.symbol);

    // Bitfinex does not support setting leverage directly via API
    // Leverage is managed through the amount of borrowed funds

    let createdOrder = { id: '' };
    if (payload.orderType === 'market') {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'exchange market',
        'sell',
        payload.amount
      );
    } else {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'exchange limit',
        'sell',
        payload.amount,
        payload.shortLimitOrderPrice
      );
    }

    return { message: 'Position opened', orderId: createdOrder.id };
  }

  async handleSetShortTpPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();
    let contracts;

    const positions = await this.exchange.fetchPositions([payload.symbol]);
    const position = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'short');
    if (position) {
      contracts = position.contracts;
    } else {
      const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
      const openShortOrder = openOrders.find(order => order.side === 'sell' && order.status === 'open');
      if (openShortOrder) {
        contracts = openShortOrder.amount;
      } else {
        return { message: `No short position or open short order found for ${payload.symbol}` };
      }
    }

    const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
    const existingTpOrder = openOrders.find(order => order.type === 'exchange limit' && order.side === 'buy' && order.status === 'open');
    if (existingTpOrder) {
      await this.exchange.cancelOrder(existingTpOrder.id, payload.symbol);
    }

    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'exchange limit',
      'buy',
      contracts,
      payload.shortPositionTp1
    );

    return { message: 'TakeProfit order placed', orderId: createdOrder.id };
  }

  async handleSetShortSlPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();

    const positions = await this.exchange.fetchPositions([payload.symbol]);
    const position = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'short');
    if (!position) return { message: `No short position found for ${payload.symbol}` };

    const conditionalOrders = await this.exchange.fetchOpenOrders(payload.symbol, undefined, undefined, {
      'stop': true
    });
    const existingSlOrder = conditionalOrders.find(order => order.type === 'exchange stop' && order.side === 'buy' && order.status === 'open');
    if (existingSlOrder) {
      await this.exchange.cancelOrder(existingSlOrder.id, payload.symbol);
    }

    const params = {
      stopPrice: payload.shortPositionSl
    };
    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'exchange stop',
      'buy',
      position.contracts,
      payload.shortPositionSl,
      params
    );

    return { message: 'StopLoss order placed', orderId: createdOrder.id };
  }
=======
import { IWebhookPayload } from '../../interfaces/IWebhookPayload';
import ccxt, { Exchange } from 'ccxt';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export class BitfinexService {
  private exchange!: Exchange;

  constructor() {
    this.initializeExchange();
  }

  private initializeExchange() {
    const useSandbox = process.env["USE_SANDBOX"] == "true";
    const apiKey = useSandbox ? process.env["BITFINEX_API_KEY_SANDBOX"] : process.env["BITFINEX_API_KEY"];
    const secret = useSandbox ? process.env["BITFINEX_API_SECRET_SANDBOX"] : process.env["BITFINEX_API_SECRET"];
    if (apiKey && secret) {
      this.exchange = new ccxt.bitfinex({
        apiKey: apiKey,
        secret: secret
      });
      if (useSandbox) this.exchange.setSandboxMode(true);
    } else {
      throw new Error('Bitfinex API keys not set');
    }
  }

  async handleLongEntryPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();
    await this.exchange.cancelAllOrders(payload.symbol);

    // Bitfinex does not support setting leverage directly via API
    // Leverage is managed through the amount of borrowed funds

    let createdOrder = { id: '' };
    if (payload.orderType === 'market') {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'exchange market',
        'buy',
        payload.amount
      );
    } else {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'exchange limit',
        'buy',
        payload.amount,
        payload.longLimitOrderPrice
      );
    }

    return { message: 'Position opened', orderId: createdOrder.id };
  }

  async handleSetLongTpPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();
    let contracts;

    // Fetch positions and find the long position for the symbol
    const positions = await this.exchange.fetchPositions([payload.symbol]);
    const position = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'long');
    if (position) {
      contracts = position.contracts;
    } else {
      const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
      const openLongOrder = openOrders.find(order => order.side === 'buy' && order.status === 'open');
      if (openLongOrder) {
        contracts = openLongOrder.amount;
      } else {
        return { message: `No long position or open long order found for ${payload.symbol}` };
      }
    }

    const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
    const existingTpOrder = openOrders.find(order => order.type === 'exchange limit' && order.side === 'sell' && order.status === 'open');
    if (existingTpOrder) {
      await this.exchange.cancelOrder(existingTpOrder.id, payload.symbol);
    }

    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'exchange limit',
      'sell',
      contracts,
      payload.longPositionTp1
    );

    return { message: 'TakeProfit order placed', orderId: createdOrder.id };
  }

  async handleSetLongSlPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();

    const positions = await this.exchange.fetchPositions([payload.symbol]);
    const position = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'long');
    if (!position) return { message: `No long position found for ${payload.symbol}` };

    const conditionalOrders = await this.exchange.fetchOpenOrders(payload.symbol, undefined, undefined, {
      'stop': true
    });
    const existingSlOrder = conditionalOrders.find(order => order.type === 'exchange stop' && order.side === 'sell' && order.status === 'open');
    if (existingSlOrder) {
      await this.exchange.cancelOrder(existingSlOrder.id, payload.symbol);
    }

    const params = {
      stopPrice: payload.longPositionSl
    };
    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'exchange stop',
      'sell',
      position.contracts,
      payload.longPositionSl,
      params
    );

    return { message: 'StopLoss order placed', orderId: createdOrder.id };
  }

  async handleShortEntryPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();
    await this.exchange.cancelAllOrders(payload.symbol);

    // Bitfinex does not support setting leverage directly via API
    // Leverage is managed through the amount of borrowed funds

    let createdOrder = { id: '' };
    if (payload.orderType === 'market') {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'exchange market',
        'sell',
        payload.amount
      );
    } else {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'exchange limit',
        'sell',
        payload.amount,
        payload.shortLimitOrderPrice
      );
    }

    return { message: 'Position opened', orderId: createdOrder.id };
  }

  async handleSetShortTpPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();
    let contracts;

    const positions = await this.exchange.fetchPositions([payload.symbol]);
    const position = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'short');
    if (position) {
      contracts = position.contracts;
    } else {
      const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
      const openShortOrder = openOrders.find(order => order.side === 'sell' && order.status === 'open');
      if (openShortOrder) {
        contracts = openShortOrder.amount;
      } else {
        return { message: `No short position or open short order found for ${payload.symbol}` };
      }
    }

    const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
    const existingTpOrder = openOrders.find(order => order.type === 'exchange limit' && order.side === 'buy' && order.status === 'open');
    if (existingTpOrder) {
      await this.exchange.cancelOrder(existingTpOrder.id, payload.symbol);
    }

    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'exchange limit',
      'buy',
      contracts,
      payload.shortPositionTp1
    );

    return { message: 'TakeProfit order placed', orderId: createdOrder.id };
  }

  async handleSetShortSlPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();

    const positions = await this.exchange.fetchPositions([payload.symbol]);
    const position = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'short');
    if (!position) return { message: `No short position found for ${payload.symbol}` };

    const conditionalOrders = await this.exchange.fetchOpenOrders(payload.symbol, undefined, undefined, {
      'stop': true
    });
    const existingSlOrder = conditionalOrders.find(order => order.type === 'exchange stop' && order.side === 'buy' && order.status === 'open');
    if (existingSlOrder) {
      await this.exchange.cancelOrder(existingSlOrder.id, payload.symbol);
    }

    const params = {
      stopPrice: payload.shortPositionSl
    };
    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'exchange stop',
      'buy',
      position.contracts,
      payload.shortPositionSl,
      params
    );

    return { message: 'StopLoss order placed', orderId: createdOrder.id };
  }
>>>>>>> a34b550ff69e15b298aff73a6573db3d2f9b064e
}
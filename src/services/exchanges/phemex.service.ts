import { IWebhookPayload } from '../../interfaces/IWebhookPayload';
import ccxt, { Exchange } from 'ccxt';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export class PhemexService {
  private exchange!: Exchange;

  constructor() {
    this.initializeExchange();
  }

  private initializeExchange() {
    const useSandbox = process.env["USE_SANDBOX"] == "true";
    const apiKey = useSandbox ? process.env["PHEMEX_API_KEY_SANDBOX"] : process.env["PHEMEX_API_KEY"];
    const secret = useSandbox ? process.env["PHEMEX_API_SECRET_SANDBOX"] : process.env["PHEMEX_API_SECRET"];
    if (apiKey && secret) {
      this.exchange = new ccxt.phemex({
        apiKey: apiKey,
        secret: secret
      });
      if (useSandbox) this.exchange.setSandboxMode(true);
    } else {
      throw new Error('Phemex API keys not set');
    }
  }

  async handleLongEntryPrice(payload: IWebhookPayload) {
    const resultingOrders = [];
    await this.exchange.loadMarkets();    
    // await this.exchange.cancelAllOrders(payload.symbol); // cancelling all orders would lead to not being able to partly sell

    if (payload.leverage) {
      if (!this.exchange.has['setLeverage']) throw new Error('Phemex does not support setting leverage');
      await this.exchange.setLeverage(payload.leverage, payload.symbol);
      console.log(`Leverage set to ${payload.leverage} for ${payload.symbol} on Phemex`);
    }

    let createdOrder = { id: '' };
    if (payload.orderType === 'market') {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'Market',
        'buy',
        payload.amount
      );
    } else {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'Limit',
        'buy',
        payload.amount,
        payload.longLimitOrderPrice
      );
    }
    resultingOrders.push(createdOrder.id);
    // also add corresponding tp/sl orders directly
    if (payload.longPositionTp1) resultingOrders.push(await this.handleSetLongTpPrice(payload));
    if (payload.longPositionSl) resultingOrders.push(await this.handleSetLongSlPrice(payload));

    return { message: 'Position opened', orders: resultingOrders.concat(', ')};
  }

  async handleSetLongTpPrice(payload: IWebhookPayload) {
    await this.exchange.loadMarkets();
    let contracts;

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
    const existingTpOrder = openOrders.find(order => order.type === 'limit' && order.side === 'sell' && order.status === 'open');
    if (existingTpOrder) {
      await this.exchange.cancelOrder(existingTpOrder.id, payload.symbol);
    }

    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'Limit',
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
    const existingSlOrder = conditionalOrders.find(order => order.type === 'Stop' && order.side === 'sell' && order.status === 'open');
    if (existingSlOrder) {
      await this.exchange.cancelOrder(existingSlOrder.id, payload.symbol);
    }

    const params = {
      stopPrice: payload.longPositionSl
    };
    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'Stop',
      'sell',
      position.contracts,
      payload.longPositionSl,
      params
    );

    return { message: 'StopLoss order placed', orderId: createdOrder.id };
  }

  async handleShortEntryPrice(payload: IWebhookPayload) {
    const resultingOrders = [];
    await this.exchange.loadMarkets();
    // await this.exchange.cancelAllOrders(payload.symbol); // cancelling all orders would lead to not being able to partly sell

    if (payload.leverage) {
      if (!this.exchange.has['setLeverage']) throw new Error('Phemex does not support setting leverage');
      await this.exchange.setLeverage(payload.leverage, payload.symbol);
      console.log(`Leverage set to ${payload.leverage} for ${payload.symbol} on Phemex`);
    }

    let createdOrder = { id: '' };
    if (payload.orderType === 'market') {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'Market',
        'sell',
        payload.amount
      );
    } else {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'Limit',
        'sell',
        payload.amount,
        payload.shortLimitOrderPrice
      );
    }
    resultingOrders.push(createdOrder.id);
    // also add corresponding tp/sl orders directly
    if (payload.shortPositionTp1) resultingOrders.push(await this.handleSetShortTpPrice(payload));
    if (payload.shortPositionSl) resultingOrders.push(await this.handleSetShortSlPrice(payload));

    return { message: 'Position opened', orders: resultingOrders.concat(', ')};
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
    const existingTpOrder = openOrders.find(order => order.type === 'limit' && order.side === 'buy' && order.status === 'open');
    if (existingTpOrder) {
      await this.exchange.cancelOrder(existingTpOrder.id, payload.symbol);
    }

    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'Limit',
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
    const existingSlOrder = conditionalOrders.find(order => order.type === 'Stop' && order.side === 'buy' && order.status === 'open');
    if (existingSlOrder) {
      await this.exchange.cancelOrder(existingSlOrder.id, payload.symbol);
    }

    const params = {
      stopPrice: payload.shortPositionSl
    };
    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'Stop',
      'buy',
      position.contracts,
      payload.shortPositionSl,
      params
    );

    return { message: 'StopLoss order placed', orderId: createdOrder.id };
  }
}
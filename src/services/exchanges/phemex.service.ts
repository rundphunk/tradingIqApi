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
      this.exchange.loadMarkets();
    } else {
      throw new Error('Phemex API keys not set');
    }
  }

  isUsingContracts(payload: IWebhookPayload) {
    return payload.symbol.includes(':');
  }

  async createLongOrder(payload: IWebhookPayload) {
    const resultingOrders = [];
    
    await this.exchange.cancelAllOrders(payload.symbol);

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
    if (payload.longPositionTp1) resultingOrders.push(await this.setLongTakeProfitPrice(payload));
    if (payload.longPositionSl) resultingOrders.push(await this.setLongStopLossPrice(payload));

    return { message: 'Position opened', orders: resultingOrders.concat(', ')};
  }

  async setLongTakeProfitPrice(payload: IWebhookPayload) {
    let amount;
    if (payload.amount) { // if we set the amount in the payload we use that and dont look for existing orders or positions
      amount = payload.amount;
    } else {
      if (this.isUsingContracts(payload)){ // means we may have a position to look for to determine its contract size
        // search possible existing contract size
        const positions = await this.exchange.fetchPositions([payload.symbol]);
        const position = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'long');
        if (position) {
          amount = position.contracts;
        } else {
          // if we have no open position we look out for an open order
          const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
          const openLongOrder = openOrders.find(order => order.side === 'buy' && order.status === 'open');
          if (openLongOrder) {
            amount = openLongOrder.amount;
          } else {
            return { message: `No long position or open long order found for ${payload.symbol} and also no amount in request given` };
          }
        }
        // get possible old tp order and cancel it
        const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
        const existingTpOrder = openOrders.find(order => order.type === 'limit' && order.side === 'sell' && order.status === 'open');
        if (existingTpOrder && existingTpOrder.price === payload.longPositionTp1) {
          return { message: 'Existing TakeProfit order matches the new one', orderId: existingTpOrder.id };
        } else if (existingTpOrder) {
          await this.exchange.cancelOrder(existingTpOrder.id, payload.symbol);
        }
      } else {
        const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
          const openLongOrder = openOrders.find(order => order.side === 'buy' && order.status === 'open');
          if (openLongOrder) {
            amount = openLongOrder.amount;
          } else {
            return { message: `No open long order found for ${payload.symbol}` };
          }
      }
    }

    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'Limit',
      'sell',
      amount,
      payload.longPositionTp1
    );

    return { message: 'TakeProfit order placed', orderId: createdOrder.id };
  }

  async setLongStopLossPrice(payload: IWebhookPayload) {
    let amount;
    if (payload.stopLossAmount) { // if we set the amount in the payload we use that and dont look for existing orders or positions
      amount = payload.stopLossAmount;
    } else {
      if (this.isUsingContracts(payload)){ // means we may have a position to look for to determine its contract size
        // search possible existing contract size
        const positions = await this.exchange.fetchPositions([payload.symbol]);
        const position = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'long');
        if (position) {
          amount = position.contracts;
        } else {
          // if we have no open position we look out for an open order
          const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
          const openLongOrder = openOrders.find(order => order.side === 'buy' && order.status === 'open');
          if (openLongOrder) {
            amount = openLongOrder.amount;
          } else {
            return { message: `No long position or open long order found for ${payload.symbol} and also no amount in request given` };
          }
        }
        // get possible old sl order and cancel it
        const conditionalOrders = await this.exchange.fetchOpenOrders(payload.symbol, undefined, undefined, {
          'stop': true
        });
        const existingSlOrder = conditionalOrders.find(order => order.type === 'Stop' && order.side === 'sell' && order.status === 'open');
        if (existingSlOrder && existingSlOrder.stopPrice === payload.longPositionSl) {
          return { message: 'Existing StopLoss order matches the new one', orderId: existingSlOrder.id };
        } else if (existingSlOrder) {
          await this.exchange.cancelOrder(existingSlOrder.id, payload.symbol);
        }
      } else {
        const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
          const openLongOrder = openOrders.find(order => order.side === 'buy' && order.status === 'open');
          if (openLongOrder) {
            amount = openLongOrder.amount;
          } else {
            return { message: `No open long order found for ${payload.symbol}` };
          }
      }
    }

    const params = {
      stopPrice: payload.longPositionSl
    };
    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'Stop',
      'sell',
      amount,
      payload.longPositionSl,
      params
    );

    return { message: 'StopLoss order placed', orderId: createdOrder.id };
  }

  async createShortOrder(payload: IWebhookPayload) {
    const resultingOrders = [];
    await this.exchange.cancelAllOrders(payload.symbol);

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
    if (payload.shortPositionTp1) resultingOrders.push(await this.setShortTakeProfitPrice(payload));
    if (payload.shortPositionSl) resultingOrders.push(await this.setShortStopLossPrice(payload));

    return { message: 'Position opened', orders: resultingOrders.concat(', ')};
  }

  async setShortTakeProfitPrice(payload: IWebhookPayload) {
    let amount;
    if (payload.takeProfitAmount) { // if we set the amount in the payload we use that and dont look for existing orders or positions
      amount = payload.takeProfitAmount;
    } else {
      if (this.isUsingContracts(payload)){ // means we may have a position to look for to determine its contract size
        // search possible existing contract size
        const positions = await this.exchange.fetchPositions([payload.symbol]);
        const position = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'short');
        if (position) {
          amount = position.contracts;
        } else {
          // if we have no open position we look out for an open order
          const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
          const openShortOrder = openOrders.find(order => order.side === 'sell' && order.status === 'open');
          if (openShortOrder) {
            amount = openShortOrder.amount;
          } else {
            return { message: `No short position or open short order found for ${payload.symbol} and also no amount in request given` };
          }
        }
        // get possible old tp order and cancel it
        const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
        const existingTpOrder = openOrders.find(order => order.type === 'limit' && order.side === 'buy' && order.status === 'open');
        if (existingTpOrder && existingTpOrder.price === payload.shortPositionTp1) {
          return { message: 'Existing TakeProfit order matches the new one', orderId: existingTpOrder.id };
        } else if (existingTpOrder) {
          await this.exchange.cancelOrder(existingTpOrder.id, payload.symbol);
        }
      } else {
        const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
          const openShortOrder = openOrders.find(order => order.side === 'sell' && order.status === 'open');
          if (openShortOrder) {
            amount = openShortOrder.amount;
          } else {
            return { message: `No open short order found for ${payload.symbol}` };
          }
      }
    }

    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'Limit',
      'buy',
      amount,
      payload.shortPositionTp1
    );

    return { message: 'TakeProfit order placed', orderId: createdOrder.id };
  }

  async setShortStopLossPrice(payload: IWebhookPayload) {
    let amount;
    if (payload.stopLossAmount) { // if we set the amount in the payload we use that and dont look for existing orders or positions
      amount = payload.stopLossAmount;
    } else {
      if (this.isUsingContracts(payload)){ // means we may have a position to look for to determine its contract size
        // search possible existing contract size
        const positions = await this.exchange.fetchPositions([payload.symbol]);
        const position = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'short');
        if (position) {
          amount = position.contracts;
        } else {
          // if we have no open position we look out for an open order
          const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
          const openShortOrder = openOrders.find(order => order.side === 'sell' && order.status === 'open');
          if (openShortOrder) {
            amount = openShortOrder.amount;
          } else {
            return { message: `No short position or open short order found for ${payload.symbol} and also no amount in request given` };
          }
        }
        // get possible old sl order and cancel it
        const conditionalOrders = await this.exchange.fetchOpenOrders(payload.symbol, undefined, undefined, {
          'stop': true
        });
        const existingSlOrder = conditionalOrders.find(order => order.type === 'Stop' && order.side === 'buy' && order.status === 'open');
        if (existingSlOrder && existingSlOrder.stopPrice === payload.shortPositionSl) {
          return { message: 'Existing StopLoss order matches the new one', orderId: existingSlOrder.id };
        } else if (existingSlOrder) {
          await this.exchange.cancelOrder(existingSlOrder.id, payload.symbol);
        }
      } else {
        const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
          const openShortOrder = openOrders.find(order => order.side === 'sell' && order.status === 'open');
          if (openShortOrder) {
            amount = openShortOrder.amount;
          } else {
            return { message: `No open short order found for ${payload.symbol}` };
          }
      }
    }

    const params = {
      stopPrice: payload.shortPositionSl
    };
    const createdOrder = await this.exchange.createOrder(
      payload.symbol,
      'Stop',
      'buy',
      amount,
      payload.shortPositionSl,
      params
    );

    return { message: 'StopLoss order placed', orderId: createdOrder.id };
  }

  async closeLongPositions(payload: IWebhookPayload) {
    const positions = await this.exchange.fetchPositions([payload.symbol]);
    const longPosition = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'long');
    if (longPosition) {
      await this.exchange.createOrder(
        payload.symbol,
        'Market',
        'sell',
        longPosition.contracts
      );
      console.log(`Closed long position for ${payload.symbol}`);
    } else {
      console.log(`No long position found for ${payload.symbol}`);
    }
  }

  async cancelLongOrders(payload: IWebhookPayload) {
    const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
    const longOrders = openOrders.filter(order => order.side === 'buy');
    for (const order of longOrders) {
      await this.exchange.cancelOrder(order.id, payload.symbol);
      console.log(`Cancelled long order ${order.id} for ${payload.symbol}`);
    }
  }

  async closeShortPositions(payload: IWebhookPayload) {
    const positions = await this.exchange.fetchPositions([payload.symbol]);
    const shortPosition = positions.find((pos: any) => pos.symbol === payload.symbol && pos.side === 'short');
    if (shortPosition) {
      await this.exchange.createOrder(
        payload.symbol,
        'Market',
        'buy',
        shortPosition.contracts
      );
      console.log(`Closed short position for ${payload.symbol}`);
    } else {
      console.log(`No short position found for ${payload.symbol}`);
    }
  }

  async cancelShortOrders(payload: IWebhookPayload) {
    const openOrders = await this.exchange.fetchOpenOrders(payload.symbol);
    const shortOrders = openOrders.filter(order => order.side === 'sell');
    for (const order of shortOrders) {
      await this.exchange.cancelOrder(order.id, payload.symbol);
      console.log(`Cancelled short order ${order.id} for ${payload.symbol}`);
    }
  }
}
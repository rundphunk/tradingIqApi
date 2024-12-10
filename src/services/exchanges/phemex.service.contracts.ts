import { IWebhookPayload } from '../../interfaces/IWebhookPayload';
import ccxt, { Exchange } from 'ccxt';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface IOrderParams {
  longTakeProfitPrice?: number;
  longStopLossPrice?: number;
  shortTakeProfitPrice?: number;
  shortStopLossPrice?: number;
  amount?: number;
}

export class PhemexServiceContracts {
  private exchange!: Exchange;
  private openOrderCallbacks: { [symbol: string]: IOrderParams } = {};
  private listenForOrderFulfillment: (orderId: string, callback: (message: any) => void) => void;

  constructor(listenForOrderFulfillment: (orderId: string, callback: (message: any) => void) => void) {
    this.listenForOrderFulfillment = listenForOrderFulfillment;
    this.initializeExchange();
  }

  private initializeExchange() {
    const useSandbox = process.env["USE_SANDBOX"] == "true";
    const apiKey = useSandbox ? process.env["PHEMEX_API_KEY_SANDBOX"] : process.env["PHEMEX_API_KEY"];
    const secret = useSandbox ? process.env["PHEMEX_API_SECRET_SANDBOX"] : process.env["PHEMEX_API_SECRET"];
    if (apiKey && secret) {
      console.log('Attempting to connect to Phemex...');
      this.exchange = new ccxt.phemex({
        apiKey: apiKey,
        secret: secret
      });
      if (useSandbox) this.exchange.setSandboxMode(true);
      this.exchange.loadMarkets().then(() => {
        console.log('Successfully loaded markets from Phemex');
      });
    } else {
      throw new Error('Phemex API keys not set');
    }
  }

  async createLongOrder(payload: IWebhookPayload) {
    await this.exchange.cancelAllOrders(payload.symbol);

    if (payload.leverage) {
      if (!this.exchange.has['setLeverage']) throw new Error('Phemex does not support setting leverage');
      await this.exchange.setLeverage(payload.leverage, payload.symbol);
      console.log(`Leverage set to ${payload.leverage} for ${payload.symbol} on Phemex`);
    }

    let createdOrder = { id: '' };
    const orderType = payload.orderType || process.env['DEFAULT_ORDER_TYPE'] || 'Limit';
    if (orderType === 'market') {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'market',
        'buy',
        payload.amount
      );
    } else {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'limit',
        'buy',
        payload.amount,
        payload.longLimitOrderPrice
      );
    }

    if (!this.openOrderCallbacks[payload.symbol]) {
      this.openOrderCallbacks[payload.symbol] = { };
    }
    this.openOrderCallbacks[payload.symbol].amount = payload.amount;
    this.listenForOrderFulfillment(createdOrder.id, this.handleOrderFulfillment);
    return { message: 'Order has been set', order: createdOrder };
  }

  async createShortOrder(payload: IWebhookPayload) {
    await this.exchange.cancelAllOrders(payload.symbol);

    if (payload.leverage) {
      if (!this.exchange.has['setLeverage']) throw new Error('Phemex does not support setting leverage');
      await this.exchange.setLeverage(payload.leverage, payload.symbol);
      console.log(`Leverage set to ${payload.leverage} for ${payload.symbol} on Phemex`);
    }

    let createdOrder = { id: '' };
    const orderType = payload.orderType || process.env['DEFAULT_ORDER_TYPE'] || 'Limit';
    if (orderType === 'market') {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'market',
        'sell',
        payload.amount
      );
    } else {
      createdOrder = await this.exchange.createOrder(
        payload.symbol,
        'limit',
        'sell',
        payload.amount,
        payload.shortLimitOrderPrice
      );
    }

    if (!this.openOrderCallbacks[payload.symbol]) {
      this.openOrderCallbacks[payload.symbol] = { };
    }
    this.openOrderCallbacks[payload.symbol].amount = payload.amount;
    this.listenForOrderFulfillment(createdOrder.id, this.handleOrderFulfillment);
    return { message: 'Order has been set', order: createdOrder };
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

  async setLongTakeProfitPrice(payload: IWebhookPayload) {
    if (!this.openOrderCallbacks[payload.symbol]) {
      this.openOrderCallbacks[payload.symbol] = {};
    }
    this.openOrderCallbacks[payload.symbol].longTakeProfitPrice = payload.longPositionTp1;
    if (this.openOrderCallbacks[payload.symbol].amount) {
      await this.updateOcoOrder(payload.symbol, 'long');
      return { message: 'TakeProfit price remembered and order created for existing long order' };
    } else {
      return { message: 'TakeProfit price remembered for future long order' };
    }
  }

  async setLongStopLossPrice(payload: IWebhookPayload) {
    if (!this.openOrderCallbacks[payload.symbol]) {
      this.openOrderCallbacks[payload.symbol] = {};
    }
    this.openOrderCallbacks[payload.symbol].longStopLossPrice = payload.longPositionSl;
    if (this.openOrderCallbacks[payload.symbol].amount) {
      await this.updateOcoOrder(payload.symbol, 'long');
      return { message: 'StopLoss price remembered and order created for existing long order' };
    } else {
      return { message: 'StopLoss price remembered for future long order' };
    }
  }

  async setShortTakeProfitPrice(payload: IWebhookPayload) {
    if (!this.openOrderCallbacks[payload.symbol]) {
      this.openOrderCallbacks[payload.symbol] = {};
    }
    this.openOrderCallbacks[payload.symbol].shortTakeProfitPrice = payload.shortPositionTp1;
    if (this.openOrderCallbacks[payload.symbol].amount) {
      await this.updateOcoOrder(payload.symbol, 'short');
      return { message: 'TakeProfit price remembered and order created for existing short order' };
    } else {
      return { message: 'TakeProfit price remembered for future short order' };
    }
  }

  async setShortStopLossPrice(payload: IWebhookPayload) {
    if (!this.openOrderCallbacks[payload.symbol]) {
      this.openOrderCallbacks[payload.symbol] = {};
    }
    this.openOrderCallbacks[payload.symbol].shortStopLossPrice = payload.shortPositionSl;
    if (this.openOrderCallbacks[payload.symbol].amount) {
      await this.updateOcoOrder(payload.symbol, 'short');
      return { message: 'StopLoss price remembered and order created for existing short order' };
    } else {
      return { message: 'StopLoss price remembered for future short order' };
    }
  }

  private async updateOcoOrder(symbol: string, positionType: 'long' | 'short') {
    const orderParams = this.openOrderCallbacks[symbol];
    if (orderParams) {
      const takeProfitParams = [];
      const stopLossParams = [];

      if (positionType === 'long') {
        if (orderParams.longTakeProfitPrice) {
          takeProfitParams.push({
            type: 'limit',
            side: 'sell',
            price: orderParams.longTakeProfitPrice,
            amount: orderParams.amount
          });
        }

        if (orderParams.longStopLossPrice) {
          stopLossParams.push({
            type: 'stop',
            side: 'sell',
            stopPrice: orderParams.longStopLossPrice,
            amount: orderParams.amount
          });
        }
      } else {
        if (orderParams.shortTakeProfitPrice) {
          takeProfitParams.push({
            type: 'limit',
            side: 'buy',
            price: orderParams.shortTakeProfitPrice,
            amount: orderParams.amount
          });
        }

        if (orderParams.shortStopLossPrice) {
          stopLossParams.push({
            type: 'stop',
            side: 'buy',
            stopPrice: orderParams.shortStopLossPrice,
            amount: orderParams.amount
          });
        }
      }

      if (takeProfitParams.length > 0 || stopLossParams.length > 0) {
        await this.exchange.cancelAllOrders(symbol);
        for (const params of takeProfitParams) {
          this.exchange.createOrder(symbol, params.type, params.side, params.amount, params.price)
            .then(order => {
              console.log(`Take profit order created for ${symbol}`);
              this.listenForOrderFulfillment(order.id, (_message: any) => {
                console.log(`Order ${order.id} for ${symbol} has been fulfilled`);
                delete this.openOrderCallbacks[symbol];
                console.log(`Removed ${symbol} from openOrderCallbacks`);
              });
            })
            .catch((error: any) => console.error(`Failed to create take profit order for ${symbol}:`, error));
        }
        for (const params of stopLossParams) {
          this.exchange.createOrder(symbol, params.type, params.side, params.amount, undefined, { stopPrice: params.stopPrice })
            .then(order => {
              console.log(`Stop loss order created for ${symbol}`);
              this.listenForOrderFulfillment(order.id, (_message: any) => {
                console.log(`Order ${order.id} for ${symbol} has been fulfilled`);
                delete this.openOrderCallbacks[symbol];
                console.log(`Removed ${symbol} from openOrderCallbacks`);
              });
            })
            .catch((error: any) => console.error(`Failed to create stop loss order for ${symbol}:`, error));
        }
      }
    }
  }

  handleOrderFulfillment(message: any) {
    console.log(`Contract order ${message.orderID} has been fulfilled`);
    
    const symbol = message.symbol;
    const orderParams = this.openOrderCallbacks[symbol];
  
    if (orderParams) {
      const ocoOrderParams = [];
  
      if (orderParams.longTakeProfitPrice) {
        ocoOrderParams.push({
          type: 'limit',
          side: 'sell',
          price: orderParams.longTakeProfitPrice,
          amount: message.amount
        });
      }
  
      if (orderParams.longStopLossPrice) {
        ocoOrderParams.push({
          type: 'stop',
          side: 'sell',
        });
      }
  
      if (ocoOrderParams.length > 0) {
        this.exchange.createOrder(symbol, 'oco', 'sell', message.amount, undefined, { orders: ocoOrderParams })
          .then(() => console.log(`OCO order created for ${symbol}`))
          .catch((error: any) => console.error(`Failed to create OCO order for ${symbol}:`, error));
      }
    }
  }
}
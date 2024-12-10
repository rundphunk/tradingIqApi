import { IMessageEvent, w3cwebsocket as WebSocketClient } from 'websocket';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export function buildSignature(content: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(content)
    .digest('hex');
}

const useSandbox = process.env.USE_SANDBOX === 'true';
const URLS = {
  WS_URL: useSandbox ? 'wss://testnet-api.phemex.com/ws' : 'wss://ws.phemex.com',
  MARKETS: `/v1/exchange/public/products`,
  ORDERBOOK: `/md/orderbook`,
  TRADES: `/md/trade`,
  ORDER_ACTIVE_LIST: `/orders/activeList`,
  ORDER_PLACE: `/orders`,
  ORDER_CANCEL: `/orders/cancel`,
};

const OPEN = 1;

let ws: WebSocketClient | null = null;
let orderCallbacks: { 
  [key: string]: { 
    callback: (message: any) => void, 
    called: boolean,
    stopLossOrderID?: string,
    takeProfitOrderID?: string
  } 
} = {};

let counter = 1;
function nextId(): number {
  return counter++;
}

function createWebSocket() {
  ws = new WebSocketClient(URLS.WS_URL);

  ws.onopen = function() {
    console.log('WebSocket connection opened.');
  };

  ws.onclose = function() {
    console.log('WebSocket connection closed.');
  };

  ws.onerror = function(error: Error) {
    console.log(`WebSocket error: ${error.message}`);
  };
}

function send(msg: Record<string, any>, callback: ((error: unknown, data: unknown) => void) | null = null): void {
  if (ws && ws.readyState === OPEN) {
    msg.id = msg.id || nextId();
    if (callback) {
      // eslint-disable-next-line no-inner-declarations
      function handleMessage(e: IMessageEvent) {
        // const data = JSON.parse(e.data as string);
        // if (data.id === msg.id) {
        //   // eslint-disable-next-line @typescript-eslint/no-empty-function
        //   if (ws) ws.onmessage = () => {};
        //   if (callback) {
        //     callback(null, data);
        //   }
        // }

        console.log(`[RECEIVE MSG] ${e.data}`);
        const message = JSON.parse(e.data as string);
        // if (callback) {
        //   callback();
        // } else {
          if (message.type === 'order' && message.orderStatus === 'Filled') {
            const orderID = message.orderID;
            if (orderCallbacks[orderID] && !orderCallbacks[orderID].called) {
              orderCallbacks[orderID].callback(message);
              orderCallbacks[orderID].called = true;
            }
          }      
        // }
        
      }
      ws.onmessage = handleMessage;
    }
    const msgStr = JSON.stringify(msg);
    ws.send(msgStr);
    console.log(`[SEND MSG] ${msgStr}`, 'OUTGOING');
    return;
  }

  callback && callback('websocket not open', null);
}

function startHeartbeat(): void {
  let timer: NodeJS.Timeout | null = null;
  if (ws) {
    ws.onopen = function() {
      timer = setInterval(() => {
        send({ method: 'server.ping', params: [] });
      }, 3000);
    };

    ws.onclose = function() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    ws.onmessage = function(e: IMessageEvent) {
      console.log(`[RECEIVE MSG] ${e.data}`);
      const message = JSON.parse(e.data as string);
      if (message.type === 'order' && message.orderStatus === 'Filled') {
        const orderID = message.orderID;
        if (orderCallbacks[orderID] && !orderCallbacks[orderID].called) {
          orderCallbacks[orderID].callback(message);
          orderCallbacks[orderID].called = true;
        }
      }
    };
  }
}

function webSocketLogin(callback: (error: unknown, data: unknown) => void): void {
  if (ws) {
    ws.onopen = function() {
      const expiry = Math.floor(Date.now() / 1000) + 2 * 60;
      const apiKey = useSandbox ? process.env.PHEMEX_API_KEY_SANDBOX : process.env.PHEMEX_API_KEY;
      const secret = useSandbox ? process.env.PHEMEX_API_SECRET_SANDBOX : process.env.PHEMEX_API_SECRET;
      if (!apiKey || !secret) {
        callback('API key or secret is undefined', null);
        return;
      }
      const content = apiKey + expiry;
      const signature = buildSignature(content, secret);
      send({ method: 'user.auth', params: ['API', apiKey, signature, expiry] }, callback);
    };
  }
}

function listenForOrderFulfillment(orderID: string, callback: (message: any) => void) {
  send({
    method: 'aop.subscribe',
    //method: 'aop.subscribe',
    // params: [orderID],
     params: [],
    id: nextId()
  });
  orderCallbacks[orderID] = { callback, called: false };
}

export { createWebSocket, send, startHeartbeat, webSocketLogin, listenForOrderFulfillment };
# tradingIqApi

## Overview
TradingIQ API is an automation API for trading on various cryptocurrency exchanges over TradingIQ smart indicators. It supports exchanges like Bitfinex and Phemex.

Currently this is working with Phemex in one-way-mode only

## Getting Started
1. Clone the repository.
2. Copy `.env.template` to `.env` and fill in your API keys and other environment variables.
3. Install dependencies:
    ```sh
    npm install
    ```
4. Start the development server:
    ```sh
    npm run dev
    ```

## Scripts
- `dev`: Starts the development server with hot-reloading.
- `build`: Compiles the TypeScript code.
- `start`: Runs the compiled JavaScript code.
- `test`: Runs the tests using Jest.

## Endpoints
```
/api/longEntryPrice
/api/setLongTpPrice
/api/setLongSlPrice
/api/shortEntryPrice
/api/setShortTpPrice
/api/setShortSlPrice
```

## Endpoint request body
```
{
    // Position settings
    exchange?: string;  // phemex or bitfinex, phemex is default
    symbol: string;
    amount?: number;
    leverage?: number;
    orderType?: 'limit' | 'market'

    // TradingIQ parameters
    longLimitOrderPrice?: number;
    shortLimitOrderPrice?: number;
    longPositionTp1?: number;
    // longPositionTp2?: number;
    longPositionSl?: number;
    shortPositionTp1?: number;
    // shortPositionTp2?: number;
    shortPositionSl?: number;
    // panicProfitEntry?: number;
    // panicProfitTp1?: number;
    // panicProfitTp2?: number;
    // panicProfitSl?: number;
}
```

## Environment Variables
Refer to `.env.template` for the required environment variables. Make sure to set the API keys and secrets for the exchanges you want to use.

## Features
So, for now the basics of this is working:
- actually Phemex supported
- support contracts in OneWayMode
- support spot market
- triggers market or limit order
- leverage setting (only for contracts, no leveraged spot atm)
- update sl/tp depending on the size of an existing position (or alternatively an open order, if no position was already executed)
- switchable config between live api & sandbox api
- receive and compute values with names like TradingIQ automation parameters ( tp2 and panic are actually not used, because I don't know how it should be handled atm)
- splitted the exchange specific implementation parts for order creation and updating workflow in separate files (actually only phemex tested .. bitfinex is only generated code, but as soon as I have an account there I will also check that)


TODO: 
- also add sl/tp directly when making an order instead of needing a separate request afterwards
- clearify what to do with open positions when a new price is incoming (Is that even intented with TradingIQ in any case?)
- modify to use with AWS lambda functions
- support hedged account mode (only if needed there is a usecase for hedged mode)
- automated tests for each exchange in testnet mode


## License
This project is licensed under the MIT License.

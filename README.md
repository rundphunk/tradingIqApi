# tradingIqApi

## Overview
TradingIQ API is an automation API for trading on various cryptocurrency exchanges over TradingIQ smart indicators. It supports exchanges like Bitfinex and Phemex.

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

## Environment Variables
Refer to `.env.template` for the required environment variables. Make sure to set the API keys and secrets for the exchanges you want to use.

## License
This project is licensed under the MIT License.
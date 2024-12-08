<<<<<<< HEAD
export interface IWebhookPayload {
    // Position settings
    exchange?: string;
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
=======
export interface IWebhookPayload {
    // Position settings
    exchange?: string;
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
>>>>>>> a34b550ff69e15b298aff73a6573db3d2f9b064e
}
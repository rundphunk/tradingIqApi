export interface IWebhookPayload {
    // Position settings
    exchange?: string;
    symbol: string;
    // tradingIQKey?: string;
    amount?: number;
    stopLossAmount?: number;
    takeProfitAmount?: number;
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
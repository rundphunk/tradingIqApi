
import { Request, Response } from 'express';
import { PhemexService } from '../services/exchanges/phemex.service';

const phemexService = new PhemexService();

export const createLongOrder = async (req: Request, res: Response) => {
  const result = await phemexService.createLongOrder(req.body);
  res.json(result);
};

export const setLongTakeProfitPrice = async (req: Request, res: Response) => {
  const result = await phemexService.setLongTakeProfitPrice(req.body);
  res.json(result);
};

export const setLongStopLossPrice = async (req: Request, res: Response) => {
  const result = await phemexService.setLongStopLossPrice(req.body);
  res.json(result);
};

export const createShortOrder = async (req: Request, res: Response) => {
  const result = await phemexService.createShortOrder(req.body);
  res.json(result);
};

export const setShortTakeProfitPrice = async (req: Request, res: Response) => {
  const result = await phemexService.setShortTakeProfitPrice(req.body);
  res.json(result);
};

export const setShortStopLossPrice = async (req: Request, res: Response) => {
  const result = await phemexService.setShortStopLossPrice(req.body);
  res.json(result);
};

export const closeLongPositions = async (req: Request, res: Response) => {
  const result = await phemexService.closeLongPositions(req.body);
  res.json(result);
};

export const cancelLongOrders = async (req: Request, res: Response) => {
  const result = await phemexService.cancelLongOrders(req.body);
  res.json(result);
};

export const closeShortPositions = async (req: Request, res: Response) => {
  const result = await phemexService.closeShortPositions(req.body);
  res.json(result);
};

export const cancelShortOrders = async (req: Request, res: Response) => {
  const result = await phemexService.cancelShortOrders(req.body);
  res.json(result);
};
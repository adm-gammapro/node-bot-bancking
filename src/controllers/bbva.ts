import { Request, Response } from 'express';
import ResponseHelper from '../utils/responseHelper';
import { bbva } from '../automator';
import logger from '../utils/logger';
class BBVA {
  static async transactionByPeriod(req: Request, res: Response) {
    const response = new ResponseHelper(req, res);
    try {
      const botBbva = await bbva.start(req.body);
      const result = await botBbva.handleTransactionPeriod();
      return response.success(result);
    } catch (error) {
      logger.error(error);
      response.error(error);
    }
  }

  static async viewBalance(req: Request, res: Response) {
    const response = new ResponseHelper(req, res);
    try {
      const botBbva = await bbva.start(req.body);
      const result = await botBbva.handleViewBalance();
      return response.success(result);
    } catch (error) {
      logger.error(error);
      response.error(error);
    }
  }

  static async login(req: Request, res: Response) {
    const response = new ResponseHelper(req, res);
    try {
      const botBbva = await bbva.start(req.body);
      const result = await botBbva.handleLogin();
      return response.success(result);
    } catch (error) {
      logger.error(error);
      response.error(error);
    }
  }

  static async logout(req: Request, res: Response) {
    const response = new ResponseHelper(req, res);
    try {
      const botBbva = await bbva.start(req.body);
      const result = await botBbva.handleLogout();
      return response.success(result);
    } catch (error) {
      logger.error(error);
      response.error(error);
    }
  }
}

export default BBVA;

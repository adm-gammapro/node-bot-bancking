import { Request, Response } from 'express';
import ResponseHelper from '../utils/responseHelper';
import { bcp } from '../automator';
import logger from '../utils/logger';
class BCP {
  static async login(req: Request, res: Response) {
    const response = new ResponseHelper(req, res);
    try {
      const botBcp = await bcp.start(req.body);
      const result = await botBcp.handleLogin();
      return response.success(result);
    } catch (error) {
      logger.error(error);
      response.error(error);
    }
  }

  static async logout(req: Request, res: Response) {
    const response = new ResponseHelper(req, res);
    try {
      const botBcp = await bcp.start(req.body);
      const result = await botBcp.handleLogout();
      return response.success(result);
    } catch (error) {
      logger.error(error);
      response.error(error);
    }
  }

  static async viewBalance(req: Request, res: Response) {
    const response = new ResponseHelper(req, res);
    try {
      const botBbva = await bcp.start(req.body);
      const result = await botBbva.handleViewBalance();
      return response.success(result);
    } catch (error) {
      logger.error(error);
      response.error(error);
    }
  }

  static async transactionByPeriod(req: Request, res: Response) {
    const response = new ResponseHelper(req, res);
    try {
      const botBbva = await bcp.start(req.body);
      const result = await botBbva.handleTransactionPeriod();
      return response.success(result);
    } catch (error) {
      logger.error(error);
      response.error(error);
    }
  }
}

export default BCP;

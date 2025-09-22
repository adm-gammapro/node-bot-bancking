import { Request, Response, NextFunction } from 'express';
import { validateData } from './validators/transactionPeriodSchema';
import HttpStatus from 'http-status-codes';
import ResponseHelper from '../utils/responseHelper';
import logger from '../utils/logger';

function validationMiddleware(req: Request, res: Response, next: NextFunction) {
  const response = new ResponseHelper(req, res);

  const { error } = validateData(req.body);

  if (error) {
    logger.error(error);
    return response.error(
      'Datos inválidos!',
      HttpStatus.BAD_REQUEST,
      error.details.map((err: any) => err.message)[0]
    );
  }

  next();
}

export default validationMiddleware;

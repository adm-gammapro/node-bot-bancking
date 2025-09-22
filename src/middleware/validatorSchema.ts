import { Request, Response, NextFunction } from 'express';
import ResponseHelper from '../utils/responseHelper';
import HttpStatus from 'http-status-codes';
import logger from '../utils/logger';

import logoutSchema from './validators/logoutSchema';
import * as bcpSchema from './validators/bcpSchema';

const keyPathSchema: any = {
  'POST-/bbva/logout': logoutSchema,
  'POST-/bcp/login': bcpSchema.loginValidate
};

function validationMiddleware(req: Request, res: Response, next: NextFunction) {
  const keyRoute = `${req.method}-${req.originalUrl}`;

  if (!Object.prototype.hasOwnProperty.call(keyPathSchema, keyRoute)) {
    logger.warn(`Validation schema not found for route: ${req.originalUrl}`);
  } else {
    const response = new ResponseHelper(req, res);
    const { error } = keyPathSchema[keyRoute](req.body);

    if (error) {
      logger.error(error);
      return response.error(
        'Datos inválidos',
        HttpStatus.BAD_REQUEST,
        error.details.map((err: any) => err.message).join(',')
      );
    }
  }

  next();
}

export default validationMiddleware;

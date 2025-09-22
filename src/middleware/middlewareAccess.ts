import { NextFunction, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

import ResponseHelper from '../utils/responseHelper';
import config from '../config/index';

const middlewareAccess = (req: Request, res: Response, next: NextFunction) => {
  const response = new ResponseHelper(req, res);
  const bearerToken = req.headers.authorization;

  if (bearerToken && bearerToken.startsWith('Bearer ')) {
    // Extrae el token de Bearer del encabezado
    const key_access = bearerToken.split(' ')[1];

    try {
      if (key_access !== config.server.key_access) {
        throw new Error('Llave de acceso no valido.');
      }
      req.transaction_id = uuidv4();
      return next();
    } catch (error) {
      return response.error(error, HttpStatus.UNAUTHORIZED);
    }
  }
  return response.error('Acceso denegado, llave de acceso no encontrado.');
};

export default middlewareAccess;

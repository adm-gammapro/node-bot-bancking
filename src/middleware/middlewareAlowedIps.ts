import { NextFunction, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';

import ResponseHelper from '../utils/responseHelper';
import config from '../config/index';

const middlewareAccess = (req: Request, res: Response, next: NextFunction) => {
  const response = new ResponseHelper(req, res);
  const clientIP = req.ip; // Obtiene la dirección IP del cliente

  // Verifica si la IP del cliente está en la lista de IPs permitidas
  if (config.server.allowed_ips.includes(clientIP)) {
    return next(); // IP válida, permite el acceso a la ruta siguiente
  }

  // Si la IP del cliente no está en la lista, devuelve un error 403 (Prohibido)
  return response.error(
    'Ip no permitida para el uso de esta aplicacion.',
    HttpStatus.FORBIDDEN
  );
};

export default middlewareAccess;

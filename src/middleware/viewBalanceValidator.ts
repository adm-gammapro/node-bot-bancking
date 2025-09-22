import { Request, Response, NextFunction } from 'express';
import { validateData } from './validators/viewBalanceSchema';

function validationMiddleware(req: Request, res: Response, next: NextFunction) {
  const { error } = validateData(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: error.details.map((err: any) => err.message)
    });
  }

  next();
}

export default validationMiddleware;

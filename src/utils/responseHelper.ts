import { Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import moment from 'moment';
class ResponseHelper {
  private _req: Request;
  private _res: Response;

  constructor(req: Request, res: Response) {
    this._req = req;
    this._res = res;
  }

  error(
    error: any,
    code: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errorDetails: any = null
  ): Response {
    if (error instanceof Error) {
      return this._res.status(code).json({
        error: {
          code: 0,
          message: error.message || error,
          errorDetails
        }
      });
    }

    if (typeof error === 'string') {
      return this._res.status(code).json({
        error: {
          code: 0,
          message: error,
          errorDetails
        }
      });
    }

    return this._res.status(code).json({
      error: {
        code: 0,
        message: 'Ocurrio un error inesperado',
        errorDetails
      }
    });
  }

  success(data: any): Response {
    return this._res.status(HttpStatus.OK).json({
      data,
      datetime: moment().format('YYYY-MM-DD HH:mm:ss')
    });
  }
}

export default ResponseHelper;

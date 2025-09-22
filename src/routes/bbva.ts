import { Router } from 'express';
import BBVA from '../controllers/bbva';
import transactionPeriodValidator from '../middleware/transactionPeriodValidator';
import viewBalanceValidator from '../middleware/viewBalanceValidator';
import loginValidator from '../middleware/loginValidator';
import validatorSchema from '../middleware/validatorSchema';

const router = Router();

router.post('/login', [loginValidator, BBVA.login]);
router.post('/logout', [validatorSchema, BBVA.logout]);

router.post('/transaction-period', [
  transactionPeriodValidator,
  BBVA.transactionByPeriod
]);
router.post('/view-balance', [viewBalanceValidator, BBVA.viewBalance]);

export { router };

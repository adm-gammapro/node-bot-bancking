import { Router } from 'express';
import BCP from '../controllers/bcp';
import validatorSchema from '../middleware/validatorSchema';

const router = Router();

router.post('/login', [validatorSchema, BCP.login]);
router.post('/logout', [validatorSchema, BCP.logout]);
router.post('/view-balance', [validatorSchema, BCP.viewBalance]);
router.post('/transaction-period', [validatorSchema, BCP.transactionByPeriod]);

export { router };

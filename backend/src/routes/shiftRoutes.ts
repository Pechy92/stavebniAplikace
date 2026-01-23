import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getAllShifts, createShift, updateShift, deleteShift } from '../controllers/shiftController';

const router = Router();

router.use(authenticate);

router.get('/', getAllShifts);
router.post('/', createShift);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);

export default router;

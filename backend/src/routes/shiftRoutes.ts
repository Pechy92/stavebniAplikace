import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiters';
import { 
  getAllShifts, 
  createShift, 
  updateShift, 
  deleteShift,
  getShiftById,
  uploadShiftPhotos,
  getShiftPhotos,
  deleteShiftPhoto,
  getShiftTasks,
  createShiftTask,
  updateShiftTask,
  deleteShiftTask,
  completeShiftTask
} from '../controllers/shiftController';

const router = Router();

router.use(authenticate);

router.get('/', getAllShifts);
router.get('/:id', getShiftById);
router.post('/', createShift);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);

// Photo endpoints
router.post('/:id/photos', uploadLimiter, upload.array('photos', 10), uploadShiftPhotos);
router.get('/:id/photos', getShiftPhotos);
router.delete('/:id/photos/:photoId', deleteShiftPhoto);

// Task endpoints
router.get('/:id/tasks', getShiftTasks);
router.post('/:id/tasks', createShiftTask);
router.put('/:id/tasks/:taskId', updateShiftTask);
router.delete('/:id/tasks/:taskId', deleteShiftTask);
router.post('/:id/tasks/:taskId/complete', completeShiftTask);

export default router;

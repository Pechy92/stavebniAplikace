import express from 'express';
import { 
  createExtraWork, 
  submitExtraWorkToForeman, 
  addMaterialsToExtraWork,
  submitExtraWorkToManager,
  approveExtraWork,
  getExtraWorkById,
  getAllExtraWorks,
  returnExtraWorkToWorker,
  returnExtraWorkToForeman,
  uploadExtraWorkPhotos
} from '../controllers/extraWorkController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiters';

const router = express.Router();

router.post('/', authenticate, authorize('worker'), uploadLimiter, upload.array('photos', 10), createExtraWork);
router.post('/:id/submit-to-foreman', authenticate, authorize('worker'), submitExtraWorkToForeman);
router.post('/:id/materials', authenticate, authorize('foreman'), addMaterialsToExtraWork);
router.post('/:id/submit-to-manager', authenticate, authorize('foreman'), submitExtraWorkToManager);
router.post('/:id/approve', authenticate, authorize('manager'), approveExtraWork);
router.post('/:id/return-to-worker', authenticate, authorize('foreman'), returnExtraWorkToWorker);
router.post('/:id/return-to-foreman', authenticate, authorize('manager'), returnExtraWorkToForeman);
router.post('/:id/photos', authenticate, authorize('worker'), uploadLimiter, upload.array('photos', 10), uploadExtraWorkPhotos);
router.get('/:id', authenticate, getExtraWorkById);
router.get('/', authenticate, getAllExtraWorks);

export default router;

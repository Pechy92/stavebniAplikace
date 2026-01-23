import express from 'express';
import { 
  createExtraWork, 
  submitExtraWorkToForeman, 
  addMaterialsToExtraWork,
  submitExtraWorkToManager,
  approveExtraWork,
  getExtraWorkById,
  getAllExtraWorks
} from '../controllers/extraWorkController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/', authenticate, authorize('worker'), upload.array('photos', 10), createExtraWork);
router.post('/:id/submit-to-foreman', authenticate, authorize('worker'), submitExtraWorkToForeman);
router.post('/:id/materials', authenticate, authorize('foreman'), addMaterialsToExtraWork);
router.post('/:id/submit-to-manager', authenticate, authorize('foreman'), submitExtraWorkToManager);
router.post('/:id/approve', authenticate, authorize('manager'), approveExtraWork);
router.get('/:id', authenticate, getExtraWorkById);
router.get('/', authenticate, getAllExtraWorks);

export default router;

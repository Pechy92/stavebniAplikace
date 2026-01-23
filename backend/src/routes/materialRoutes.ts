import express from 'express';
import { getAllMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial } from '../controllers/materialController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getAllMaterials);
router.get('/:id', authenticate, getMaterialById);
router.post('/', authenticate, authorize('admin'), createMaterial);
router.put('/:id', authenticate, authorize('admin'), updateMaterial);
router.delete('/:id', authenticate, authorize('admin'), deleteMaterial);

export default router;

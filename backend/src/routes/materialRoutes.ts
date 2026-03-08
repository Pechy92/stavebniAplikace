import express from 'express';
import { getAllMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial } from '../controllers/materialController';
import { authenticate, authorize } from '../middleware/auth';
import { createMaterialValidation } from '../middleware/validators';
import { validate } from '../middleware/validate';

const router = express.Router();

router.get('/', authenticate, getAllMaterials);
router.get('/:id', authenticate, getMaterialById);
router.post('/', authenticate, authorize('admin'), createMaterialValidation, validate, createMaterial);
router.put('/:id', authenticate, authorize('admin'), createMaterialValidation, validate, updateMaterial);
router.delete('/:id', authenticate, authorize('admin'), deleteMaterial);

export default router;

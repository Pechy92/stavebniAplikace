import express from 'express';
import { getAllProjects, getProjectById, createProject, updateProject, deleteProject, getProjectManagers, getProjectForemen } from '../controllers/projectController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getAllProjects);
router.get('/:id', authenticate, getProjectById);
router.get('/:id/managers', authenticate, getProjectManagers);
router.get('/:id/foremen', authenticate, getProjectForemen);
router.post('/', authenticate, authorize('admin', 'manager'), createProject);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateProject);
router.delete('/:id', authenticate, authorize('admin'), deleteProject);

export default router;

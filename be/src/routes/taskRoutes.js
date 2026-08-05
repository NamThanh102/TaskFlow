import express from 'express';
import {
  createTask,
  getTasksByProject,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTrashTasks,
  restoreTask,
  deleteTaskPermanently,
  emptyTrash,
} from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All task routes require authentication
router.use(protect);

// Trash management routes (MUST be defined before /:id)
router.get('/trash', getTrashTasks);
router.delete('/trash/empty', emptyTrash);

router.post('/', createTask);
router.get('/project/:projectId', getTasksByProject);

router.patch('/:id/restore', restoreTask);
router.delete('/:id/permanent', deleteTaskPermanently);
router.patch('/:id/status', updateTaskStatus);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;

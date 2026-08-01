const express = require('express');
const {
  createTask,
  getTasksByProject,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTrashTasks,
  restoreTask,
  deleteTaskPermanently,
  emptyTrash,
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

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

module.exports = router;

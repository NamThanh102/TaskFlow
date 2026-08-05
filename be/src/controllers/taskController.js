import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Create a new task
// @route   POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, dueTime, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Title and project ID are required',
      });
    }

    // Ensure project exists and belongs to this user
    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      dueTime: dueTime || '',
      project: projectId,
      user: req.user._id,
      isDeleted: false,
      deletedAt: null,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks of a project (excluding trash)
// @route   GET /api/tasks/project/:projectId
export const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, search } = req.query;

    const filter = {
      project: projectId,
      user: req.user._id,
      isDeleted: { $ne: true },
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, dueTime } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: { $ne: true },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (dueTime !== undefined) task.dueTime = dueTime;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (drag-and-drop between columns)
// @route   PATCH /api/tasks/:id/status
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['todo', 'in_progress', 'done'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status (accepted: todo, in_progress, done)',
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: { $ne: true },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.status = status;
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete task (move to trash, retained for 30 days)
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.isDeleted = true;
    task.deletedAt = new Date();
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task moved to trash',
      data: { taskId: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all trashed tasks (retained for up to 30 days)
// @route   GET /api/tasks/trash
export const getTrashTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
      isDeleted: true,
    })
      .populate('project', 'name color')
      .sort({ deletedAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore task from trash
// @route   PATCH /api/tasks/:id/restore
export const restoreTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: true,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in trash',
      });
    }

    task.isDeleted = false;
    task.deletedAt = null;
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task restored successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete a task from trash
// @route   DELETE /api/tasks/:id/permanent
export const deleteTaskPermanently = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: true,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in trash',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task permanently deleted',
      data: { taskId: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Empty trash (permanently remove all trashed tasks)
// @route   DELETE /api/tasks/trash/empty
export const emptyTrash = async (req, res, next) => {
  try {
    const result = await Task.deleteMany({
      user: req.user._id,
      isDeleted: true,
    });

    res.status(200).json({
      success: true,
      message: 'Trash emptied successfully',
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    next(error);
  }
};

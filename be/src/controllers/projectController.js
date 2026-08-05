import Project from '../models/Project.js';
import Task from '../models/Task.js';

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required',
      });
    }

    const project = await Project.create({
      name,
      description: description || '',
      color: color || '#4f46e5',
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for the current user
// @route   GET /api/projects
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });

    const projectsWithTaskCounts = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({
          project: project._id,
          isDeleted: { $ne: true },
        });
        const completedTasks = await Task.countDocuments({
          project: project._id,
          status: 'done',
          isDeleted: { $ne: true },
        });
        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithTaskCounts.length,
      data: projectsWithTaskCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details and non-deleted tasks
// @route   GET /api/projects/:id
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied',
      });
    }

    const tasks = await Task.find({
      project: project._id,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        project,
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
export const updateProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project (cascades delete on tasks)
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project and associated tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

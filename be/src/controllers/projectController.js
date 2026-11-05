import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { getCache, setCache, delCache } from '../config/redis.js';

// Create a new project
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

    // Invalidate user projects cache
    await delCache(`projects:user:${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Get all projects for current user (Optimized aggregation: eliminates N+1 query problem)
export const getProjects = async (req, res, next) => {
  try {
    const cacheKey = `projects:user:${req.user._id}`;

    // 1. Kiểm tra cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // 2. Cache miss -> Thực thi song song 2 queries tối ưu (thay vì 1 + 2N queries)
    const [projects, taskStats] = await Promise.all([
      Project.find({ user: req.user._id }).sort({ createdAt: -1 }).lean(),
      Task.aggregate([
        {
          $match: {
            user: req.user._id,
            isDeleted: { $ne: true },
          },
        },
        {
          $group: {
            _id: '$project',
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    // Gom số liệu đếm bằng Map để map với độ phức tạp O(1)
    const statsMap = new Map();
    taskStats.forEach((stat) => {
      statsMap.set(stat._id.toString(), {
        totalTasks: stat.totalTasks,
        completedTasks: stat.completedTasks,
      });
    });

    const projectsWithTaskCounts = projects.map((p) => {
      const stat = statsMap.get(p._id.toString()) || { totalTasks: 0, completedTasks: 0 };
      return {
        ...p,
        totalTasks: stat.totalTasks,
        completedTasks: stat.completedTasks,
      };
    });

    const responsePayload = {
      success: true,
      count: projectsWithTaskCounts.length,
      data: projectsWithTaskCounts,
    };

    // Cache trong 5 phút (300s)
    await setCache(cacheKey, 300, responsePayload);

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// Get single project details and non-deleted tasks (with Isolated User Redis Cache)
export const getProjectById = async (req, res, next) => {
  try {
    // Cô lập cache theo user ID để tránh lỗ hổng rò rỉ dữ liệu (IDOR)
    const cacheKey = `project:detail:${req.user._id}:${req.params.id}`;

    // 1. Kiểm tra cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // 2. Cache miss -> Quét MongoDB
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

    const responsePayload = {
      success: true,
      data: {
        project,
        tasks,
      },
    };

    // Cache trong 5 phút (300s)
    await setCache(cacheKey, 300, responsePayload);

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// Update project
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

    // Xóa cả cache danh sách dự án và cache chi tiết dự án (cô lập theo user)
    await delCache(
      `projects:user:${req.user._id}`,
      `project:detail:${req.user._id}:${project._id}`
    );

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Delete project (Atomic cascade deletion on tasks and project)
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

    // Xóa toàn bộ task liên kết trước, sau đó xóa project
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    // Xóa cache danh sách dự án và chi tiết dự án đã xóa
    await delCache(
      `projects:user:${req.user._id}`,
      `project:detail:${req.user._id}:${project._id}`
    );

    res.status(200).json({
      success: true,
      message: 'Project and associated tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

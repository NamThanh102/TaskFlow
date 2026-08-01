import api from './api';

export const taskService = {
  // Create new task
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Get tasks by project (excluding trash)
  getTasksByProject: async (projectId, params = {}) => {
    const response = await api.get(`/tasks/project/${projectId}`, { params });
    return response.data;
  },

  // Update task details
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Quick status update (drag between columns: todo, in_progress, done)
  updateTaskStatus: async (id, status) => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Move task to trash (soft delete, retained for up to 30 days)
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Get all trashed tasks
  getTrashTasks: async () => {
    const response = await api.get('/tasks/trash');
    return response.data;
  },

  // Restore task from trash back to its project
  restoreTask: async (id) => {
    const response = await api.patch(`/tasks/${id}/restore`);
    return response.data;
  },

  // Permanently delete a task from trash
  deleteTaskPermanently: async (id) => {
    const response = await api.delete(`/tasks/${id}/permanent`);
    return response.data;
  },

  // Empty entire trash
  emptyTrash: async () => {
    const response = await api.delete('/tasks/trash/empty');
    return response.data;
  },
};

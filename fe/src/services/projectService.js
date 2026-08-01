import api from './api';

export const projectService = {
  // Lấy tất cả dự án của user hiện tại
  getProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  // Lấy chi tiết 1 dự án kèm danh sách tasks
  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Tạo dự án mới
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Cập nhật dự án
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Xóa dự án
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

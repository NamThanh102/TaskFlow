import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import Navbar from '../components/common/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Trash2,
  ArrowUpDown,
  Loader2,
  Info,
} from 'lucide-react';

const priorityScore = { high: 3, medium: 2, low: 1 };

const ProjectDetailPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Independent column sorting
  const [columnSorts, setColumnSorts] = useState({
    todo: 'default',
    in_progress: 'default',
    done: 'default',
  });

  // Drag and Drop States
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null); // 'todo' | 'in_progress' | 'done'

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Load project details and tasks
  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjectById(projectId);
      setProject(res.data.project);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Failed to load project details', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  // Create or Update Task
  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      const res = await taskService.updateTask(editingTask._id, taskData);
      setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data : t)));
    } else {
      const res = await taskService.createTask(taskData);
      setTasks([res.data, ...tasks]);
    }
    setEditingTask(null);
  };

  // Move task between columns (HTML5 Drag & Drop)
  const handleStatusChange = async (taskId, newStatus) => {
    const currentTask = tasks.find((t) => t._id === taskId);
    if (!currentTask || currentTask.status === newStatus) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await taskService.updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error('Failed to update task status', err);
      loadProjectData(); // Rollback on error
    }
  };

  // Move task to Trash when dropped outside the 3 columns (No confirmation required)
  const handleMoveToTrash = async (taskId) => {
    const targetTask = tasks.find((t) => t._id === taskId);
    if (!targetTask) return;

    // Optimistically remove from board
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    setToastMessage(`"${targetTask.title}" moved to Trash (retained for 30 days)`);
    setTimeout(() => setToastMessage(''), 4500);

    try {
      await taskService.deleteTask(taskId);
    } catch (err) {
      console.error('Failed to move task to trash', err);
      loadProjectData(); // Rollback on error
    }
  };

  // Column Drag Handlers (Stop propagation so board drop handler doesn't catch it)
  const handleDragOverColumn = (e, columnStatus) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus);
    }
  };

  const handleDragLeaveColumn = (e, columnStatus) => {
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverColumn === columnStatus) {
      setDragOverColumn(null);
    }
  };

  const handleDropOnColumn = (e, columnStatus) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumn(null);
    setDraggingTaskId(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      handleStatusChange(taskId, columnStatus);
    }
  };

  // Outer Board Drag Handlers (Catches drops OUTSIDE the 3 columns)
  const handleDragOverBoard = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOutsideColumns = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      handleMoveToTrash(taskId);
    }
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  // Per-column sorting function
  const sortColumnTasks = (taskList, sortType) => {
    return [...taskList].sort((a, b) => {
      if (sortType === 'priority_desc') {
        return (priorityScore[b.priority] || 2) - (priorityScore[a.priority] || 2);
      }
      if (sortType === 'priority_asc') {
        return (priorityScore[a.priority] || 2) - (priorityScore[b.priority] || 2);
      }
      if (sortType === 'due_asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortType === 'due_desc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      }
      if (sortType === 'created_desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortType === 'created_asc') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });
  };

  // Filter tasks by Search query & Priority
  const filteredTasks = tasks.filter((task) => {
    const matchSearch =
      !searchQuery ||
      (task?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task?.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchPriority =
      priorityFilter === 'all' || task.priority === priorityFilter;

    return matchSearch && matchPriority;
  });

  const todoTasks = sortColumnTasks(
    filteredTasks.filter((t) => t.status === 'todo'),
    columnSorts.todo
  );

  const inProgressTasks = sortColumnTasks(
    filteredTasks.filter((t) => t.status === 'in_progress'),
    columnSorts.in_progress
  );

  const doneTasks = sortColumnTasks(
    filteredTasks.filter((t) => t.status === 'done'),
    columnSorts.done
  );

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 text-slate-500 animate-spin mb-2" />
        <p className="text-xs text-slate-500">Loading project...</p>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOverBoard}
      onDrop={handleDropOutsideColumns}
      className="min-h-screen bg-slate-50 flex flex-col pb-16"
    >
      <Navbar />

      {/* Project Subheader */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          {/* Top navigation row */}
          <div className="flex items-center justify-between mb-3">
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Projects</span>
            </Link>

            <div className="flex items-center space-x-2">
              <Link
                to="/trash"
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="View deleted tasks"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Trash</span>
              </Link>

              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Project
              </span>
            </div>
          </div>

          {/* Project Details row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: project.color || '#4f46e5' }}
                />
                <h1 className="text-lg font-bold text-slate-900">{project.name}</h1>
              </div>
              {project.description && (
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Filters & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
            {/* Search & Priority Filter */}
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
                />
              </div>

              <div className="flex items-center space-x-1 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
                <Filter className="w-3 h-3 text-slate-400" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-600 focus:outline-none cursor-pointer border-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Add Task Button */}
            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dragging hint & Toast notification */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full pt-4">
        {toastMessage && (
          <div className="mb-3 p-2.5 bg-slate-900 text-white text-xs rounded-lg flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{toastMessage}</span>
            </div>
            <Link to="/trash" className="underline text-slate-300 hover:text-white font-medium ml-3">
              Open Trash
            </Link>
          </div>
        )}

        {draggingTaskId && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center space-x-2 animate-in fade-in duration-150">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Tip:</strong> Drag into another column to update status, or drop anywhere outside columns to move to Trash.
            </span>
          </div>
        )}
      </div>

      {/* Main Kanban Board (3 Columns) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Column 1: TO DO */}
          <div
            onDragOver={(e) => handleDragOverColumn(e, 'todo')}
            onDragLeave={(e) => handleDragLeaveColumn(e, 'todo')}
            onDrop={(e) => handleDropOnColumn(e, 'todo')}
            className={`rounded-xl p-3.5 border transition-all min-h-[360px] flex flex-col ${
              dragOverColumn === 'todo'
                ? 'bg-slate-200/90 border-slate-400 ring-2 ring-slate-300'
                : 'bg-slate-100/80 border-slate-200'
            }`}
          >
            {/* Column Header with individual Sort */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-semibold text-slate-800 tracking-wide uppercase">
                  To Do
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                  {todoTasks.length}
                </span>
              </div>

              {/* Individual Sort Select */}
              <div className="flex items-center space-x-1 text-slate-500">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <select
                  value={columnSorts.todo}
                  onChange={(e) =>
                    setColumnSorts({ ...columnSorts, todo: e.target.value })
                  }
                  className="text-[11px] bg-transparent text-slate-600 focus:outline-none cursor-pointer border-none py-0.5"
                  title="Sort To Do tasks"
                >
                  <option value="default">Default order</option>
                  <option value="priority_desc">Priority: High to Low</option>
                  <option value="priority_asc">Priority: Low to High</option>
                  <option value="due_asc">Due Date: Earliest</option>
                  <option value="due_desc">Due Date: Latest</option>
                  <option value="created_desc">Created: Newest</option>
                  <option value="created_asc">Created: Oldest</option>
                </select>
              </div>
            </div>

            {/* Tasks Container */}
            <div className="space-y-2.5 flex-1">
              {todoTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={() => {
                    setEditingTask(task);
                    setIsTaskModalOpen(true);
                  }}
                  onDragStart={(id) => setDraggingTaskId(id)}
                  onDragEnd={() => setDraggingTaskId(null)}
                  isDragging={draggingTaskId === task._id}
                />
              ))}

              {todoTasks.length === 0 && (
                <div className="h-28 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                  No tasks in To Do
                </div>
              )}
            </div>
          </div>

          {/* Column 2: IN PROGRESS */}
          <div
            onDragOver={(e) => handleDragOverColumn(e, 'in_progress')}
            onDragLeave={(e) => handleDragLeaveColumn(e, 'in_progress')}
            onDrop={(e) => handleDropOnColumn(e, 'in_progress')}
            className={`rounded-xl p-3.5 border transition-all min-h-[360px] flex flex-col ${
              dragOverColumn === 'in_progress'
                ? 'bg-slate-200/90 border-slate-400 ring-2 ring-slate-300'
                : 'bg-slate-100/80 border-slate-200'
            }`}
          >
            {/* Column Header with individual Sort */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-semibold text-slate-800 tracking-wide uppercase">
                  In Progress
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                  {inProgressTasks.length}
                </span>
              </div>

              {/* Individual Sort Select */}
              <div className="flex items-center space-x-1 text-slate-500">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <select
                  value={columnSorts.in_progress}
                  onChange={(e) =>
                    setColumnSorts({ ...columnSorts, in_progress: e.target.value })
                  }
                  className="text-[11px] bg-transparent text-slate-600 focus:outline-none cursor-pointer border-none py-0.5"
                  title="Sort In Progress tasks"
                >
                  <option value="default">Default order</option>
                  <option value="priority_desc">Priority: High to Low</option>
                  <option value="priority_asc">Priority: Low to High</option>
                  <option value="due_asc">Due Date: Earliest</option>
                  <option value="due_desc">Due Date: Latest</option>
                  <option value="created_desc">Created: Newest</option>
                  <option value="created_asc">Created: Oldest</option>
                </select>
              </div>
            </div>

            {/* Tasks Container */}
            <div className="space-y-2.5 flex-1">
              {inProgressTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={() => {
                    setEditingTask(task);
                    setIsTaskModalOpen(true);
                  }}
                  onDragStart={(id) => setDraggingTaskId(id)}
                  onDragEnd={() => setDraggingTaskId(null)}
                  isDragging={draggingTaskId === task._id}
                />
              ))}

              {inProgressTasks.length === 0 && (
                <div className="h-28 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                  No tasks in Progress
                </div>
              )}
            </div>
          </div>

          {/* Column 3: DONE */}
          <div
            onDragOver={(e) => handleDragOverColumn(e, 'done')}
            onDragLeave={(e) => handleDragLeaveColumn(e, 'done')}
            onDrop={(e) => handleDropOnColumn(e, 'done')}
            className={`rounded-xl p-3.5 border transition-all min-h-[360px] flex flex-col ${
              dragOverColumn === 'done'
                ? 'bg-slate-200/90 border-slate-400 ring-2 ring-slate-300'
                : 'bg-slate-100/80 border-slate-200'
            }`}
          >
            {/* Column Header with individual Sort */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-semibold text-slate-800 tracking-wide uppercase">
                  Done
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                  {doneTasks.length}
                </span>
              </div>

              {/* Individual Sort Select */}
              <div className="flex items-center space-x-1 text-slate-500">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <select
                  value={columnSorts.done}
                  onChange={(e) =>
                    setColumnSorts({ ...columnSorts, done: e.target.value })
                  }
                  className="text-[11px] bg-transparent text-slate-600 focus:outline-none cursor-pointer border-none py-0.5"
                  title="Sort Done tasks"
                >
                  <option value="default">Default order</option>
                  <option value="priority_desc">Priority: High to Low</option>
                  <option value="priority_asc">Priority: Low to High</option>
                  <option value="due_asc">Due Date: Earliest</option>
                  <option value="due_desc">Due Date: Latest</option>
                  <option value="created_desc">Created: Newest</option>
                  <option value="created_asc">Created: Oldest</option>
                </select>
              </div>
            </div>

            {/* Tasks Container */}
            <div className="space-y-2.5 flex-1">
              {doneTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={() => {
                    setEditingTask(task);
                    setIsTaskModalOpen(true);
                  }}
                  onDragStart={(id) => setDraggingTaskId(id)}
                  onDragEnd={() => setDraggingTaskId(null)}
                  isDragging={draggingTaskId === task._id}
                />
              ))}

              {doneTasks.length === 0 && (
                <div className="h-28 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                  No completed tasks yet
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Task Modal (Create & Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialData={editingTask}
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectDetailPage;

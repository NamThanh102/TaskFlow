import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import Navbar from '../components/common/Navbar';
import TaskModal from '../components/TaskModal';
import KanbanHeader from '../components/kanban/KanbanHeader';
import KanbanColumn from '../components/kanban/KanbanColumn';
import { Trash2, Loader2, Info } from 'lucide-react';

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

      {/* Project Subheader & Action Bar */}
      <KanbanHeader
        project={project}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        onAddTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
      />

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
          <KanbanColumn
            status="todo"
            title="To Do"
            tasks={todoTasks}
            sortValue={columnSorts.todo}
            onSortChange={(val) => setColumnSorts({ ...columnSorts, todo: val })}
            onDragOver={handleDragOverColumn}
            onDragLeave={handleDragLeaveColumn}
            onDrop={handleDropOnColumn}
            isDragOver={dragOverColumn === 'todo'}
            draggingTaskId={draggingTaskId}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDragStartTask={(id) => setDraggingTaskId(id)}
            onDragEndTask={() => setDraggingTaskId(null)}
            emptyMessage="No tasks in To Do"
          />

          <KanbanColumn
            status="in_progress"
            title="In Progress"
            tasks={inProgressTasks}
            sortValue={columnSorts.in_progress}
            onSortChange={(val) => setColumnSorts({ ...columnSorts, in_progress: val })}
            onDragOver={handleDragOverColumn}
            onDragLeave={handleDragLeaveColumn}
            onDrop={handleDropOnColumn}
            isDragOver={dragOverColumn === 'in_progress'}
            draggingTaskId={draggingTaskId}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDragStartTask={(id) => setDraggingTaskId(id)}
            onDragEndTask={() => setDraggingTaskId(null)}
            emptyMessage="No tasks in Progress"
          />

          <KanbanColumn
            status="done"
            title="Done"
            tasks={doneTasks}
            sortValue={columnSorts.done}
            onSortChange={(val) => setColumnSorts({ ...columnSorts, done: val })}
            onDragOver={handleDragOverColumn}
            onDragLeave={handleDragLeaveColumn}
            onDrop={handleDropOnColumn}
            isDragOver={dragOverColumn === 'done'}
            draggingTaskId={draggingTaskId}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDragStartTask={(id) => setDraggingTaskId(id)}
            onDragEndTask={() => setDraggingTaskId(null)}
            emptyMessage="No completed tasks yet"
          />
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

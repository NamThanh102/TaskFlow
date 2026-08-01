import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { taskService } from '../services/taskService';
import {
  Trash2,
  RotateCcw,
  Clock,
  ArrowLeft,
  Loader2,
  Calendar,
} from 'lucide-react';

const priorityConfig = {
  high: { label: 'High', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  medium: { label: 'Medium', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  low: { label: 'Low', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const getDaysRemaining = (deletedAt) => {
  if (!deletedAt) return 30;
  const deletedTime = new Date(deletedAt).getTime();
  const elapsedDays = Math.floor((Date.now() - deletedTime) / (1000 * 60 * 60 * 24));
  return Math.max(0, 30 - elapsedDays);
};

const TrashPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState('');

  const fetchTrashTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getTrashTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to load trash tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashTasks();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleRestore = async (taskId) => {
    try {
      setActionLoadingId(taskId);
      await taskService.restoreTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      showNotification('Task restored to its original project.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore task');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePermanentDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoadingId(taskId);
      await taskService.deleteTaskPermanently(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      showNotification('Task permanently deleted.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task permanently');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEmptyTrash = async () => {
    if (tasks.length === 0) return;
    if (
      !window.confirm(
        'Empty Trash? All items in trash will be permanently deleted and cannot be recovered.'
      )
    ) {
      return;
    }

    try {
      await taskService.emptyTrash();
      setTasks([]);
      showNotification('Trash has been completely emptied.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to empty trash');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 w-full pt-6">
        {/* Breadcrumb & Navigation */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-bold text-slate-900">Trash</h1>
              <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                {tasks.length} {tasks.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tasks moved to trash are automatically retained for up to 30 days before permanent deletion.
            </p>
          </div>

          {tasks.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Trash</span>
            </button>
          )}
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2 animate-in fade-in duration-200">
            <span className="font-semibold text-emerald-700">[OK]</span>
            <span>{notification}</span>
          </div>
        )}

        {/* Trashed Items List */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading trash items...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Trash is empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              When you drag tasks outside the board columns, they will be stored safely here for 30 days.
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 mt-4 px-3.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <span>Back to Projects</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const daysLeft = getDaysRemaining(task.deletedAt);
              const isActionLoading = actionLoadingId === task._id;

              return (
                <div
                  key={task._id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  {/* Task details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Original Project */}
                      {task.project && (
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded border"
                          style={{
                            borderColor: `${task.project.color || '#64748b'}33`,
                            backgroundColor: `${task.project.color || '#64748b'}11`,
                            color: task.project.color || '#334155',
                          }}
                        >
                          {task.project.name}
                        </span>
                      )}

                      {/* Original Status */}
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {statusLabels[task.status] || 'To Do'}
                      </span>

                      {/* Priority */}
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                          priorityConfig[task.priority]?.badge || priorityConfig.medium.badge
                        }`}
                      >
                        {priorityConfig[task.priority]?.label || 'Medium'}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 line-through text-slate-500">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata & 30-day Countdown */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      {task.deletedAt && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Deleted on {formatDate(task.deletedAt)}</span>
                        </div>
                      )}

                      <div
                        className={`flex items-center space-x-1 font-medium ${
                          daysLeft <= 5 ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {daysLeft} {daysLeft === 1 ? 'day' : 'days'} remaining
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleRestore(task._id)}
                      disabled={isActionLoading}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Restore task to project"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>

                    <button
                      onClick={() => handlePermanentDelete(task._id)}
                      disabled={isActionLoading}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Permanently delete from database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default TrashPage;

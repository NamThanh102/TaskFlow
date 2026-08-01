import React from 'react';
import { Calendar, Edit2, Clock } from 'lucide-react';

const priorityConfig = {
  high: { label: 'High', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  medium: { label: 'Medium', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  low: { label: 'Low', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
};

// Format date (DD/MM/YYYY) and optional time
const formatDeadline = (dueDate, dueTime) => {
  if (!dueDate) return null;

  const dateObj = new Date(dueDate);
  if (isNaN(dateObj.getTime())) return null;

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const dateStr = `${day}/${month}/${year}`;

  if (dueTime && typeof dueTime === 'string' && dueTime.trim()) {
    return `${dueTime.trim()} - ${dateStr}`;
  }
  return dateStr;
};

const TaskCard = ({ task, onEdit, onDragStart, onDragEnd, isDragging }) => {
  if (!task) return null;

  const isDone = task.status === 'done';
  const deadlineStr = formatDeadline(task.dueDate, task.dueTime);

  // Check if overdue safely
  const isOverdue = (() => {
    if (!task.dueDate || isDone) return false;
    const taskDate = new Date(task.dueDate);
    if (isNaN(taskDate.getTime())) return false;
    if (task.dueTime && typeof task.dueTime === 'string' && task.dueTime.includes(':')) {
      const [hours, minutes] = task.dueTime.split(':');
      taskDate.setHours(parseInt(hours || '0', 10), parseInt(minutes || '0', 10), 0);
    } else {
      taskDate.setHours(23, 59, 59);
    }
    return taskDate < new Date();
  })();

  const handleNativeDragStart = (e) => {
    e.dataTransfer.setData('taskId', task._id);
    e.dataTransfer.setData('sourceStatus', task.status);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(task._id);
  };

  const handleNativeDragEnd = () => {
    if (onDragEnd) onDragEnd();
  };

  return (
    <div
      draggable
      onDragStart={handleNativeDragStart}
      onDragEnd={handleNativeDragEnd}
      className={`bg-white rounded-lg p-3.5 border border-slate-200 hover:border-slate-300 shadow-xs transition-all cursor-grab active:cursor-grabbing select-none group ${
        isDragging ? 'opacity-40 scale-95 border-dashed border-slate-400' : ''
      }`}
    >
      {/* Priority & Quick Edit */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
            priorityConfig[task.priority]?.badge || priorityConfig.medium.badge
          }`}
        >
          {priorityConfig[task.priority]?.label || 'Medium'}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Edit task"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>

      {/* Task Title */}
      <h4
        className={`text-xs font-semibold text-slate-900 leading-snug ${
          isDone ? 'line-through text-slate-400' : ''
        }`}
      >
        {task.title}
      </h4>

      {/* Task Description */}
      {task.description && (
        <p
          className={`text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed ${
            isDone ? 'line-through text-slate-400/80' : ''
          }`}
        >
          {task.description}
        </p>
      )}

      {/* Footer: Due date with day/month/year & optional time */}
      {deadlineStr && (
        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 text-[11px]">
          <div
            className={`flex items-center space-x-1 ${
              isOverdue ? 'text-rose-600 font-medium' : 'text-slate-500'
            }`}
            title={isOverdue ? 'Overdue!' : 'Due date'}
          >
            {task.dueTime ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
            <span>{deadlineStr}</span>
          </div>

          {isOverdue && (
            <span className="text-[10px] bg-rose-50 text-rose-600 font-medium px-1.5 py-0.2 rounded border border-rose-200">
              Overdue
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;

import React from 'react';
import TaskCard from '../TaskCard';
import { ArrowUpDown } from 'lucide-react';

const KanbanColumn = ({
  status,
  title,
  tasks = [],
  sortValue = 'default',
  onSortChange,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver = false,
  draggingTaskId,
  onEditTask,
  onDragStartTask,
  onDragEndTask,
  emptyMessage = 'No tasks in this column',
}) => {
  return (
    <div
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={(e) => onDragLeave(e, status)}
      onDrop={(e) => onDrop(e, status)}
      className={`rounded-xl p-3.5 border transition-all min-h-[360px] flex flex-col ${
        isDragOver
          ? 'bg-slate-200/90 border-slate-400 ring-2 ring-slate-300'
          : 'bg-slate-100/80 border-slate-200'
      }`}
    >
      {/* Column Header with individual Sort */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center space-x-2">
          <h3 className="text-xs font-semibold text-slate-800 tracking-wide uppercase">
            {title}
          </h3>
          <span className="text-[11px] font-semibold px-2 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
            {tasks.length}
          </span>
        </div>

        {/* Individual Sort Select */}
        <div className="flex items-center space-x-1 text-slate-500">
          <ArrowUpDown className="w-3 h-3 text-slate-400" />
          <select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-[11px] bg-transparent text-slate-600 focus:outline-none cursor-pointer border-none py-0.5"
            title={`Sort ${title} tasks`}
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
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={() => onEditTask(task)}
            onDragStart={onDragStartTask}
            onDragEnd={onDragEndTask}
            isDragging={draggingTaskId === task._id}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-28 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Search, Filter, Plus } from 'lucide-react';

const KanbanHeader = ({
  project,
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  onAddTask,
}) => {
  if (!project) return null;

  return (
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
            onClick={onAddTask}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KanbanHeader;

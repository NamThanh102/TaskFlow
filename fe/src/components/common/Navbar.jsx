import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EditProfileModal from '../EditProfileModal';
import ChangePasswordModal from '../ChangePasswordModal';
import {
  LogOut,
  User,
  KeyRound,
  Minus,
  Plus,
  ChevronDown,
  RotateCcw,
  Trash2,
  FolderKanban,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dropdown & Modals State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Interface Scale State (Default 100%)
  const [scale, setScale] = useState(() => {
    const savedScale = localStorage.getItem('taskflow_scale');
    return savedScale ? parseInt(savedScale, 10) : 100;
  });

  // Apply scale to document root font-size
  useEffect(() => {
    const baseFontSize = 16;
    const computedSize = (baseFontSize * scale) / 100;
    document.documentElement.style.fontSize = `${computedSize}px`;
    localStorage.setItem('taskflow_scale', scale.toString());
  }, [scale]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDecreaseScale = () => {
    setScale((prev) => Math.max(prev - 5, 85)); // Min 85%
  };

  const handleIncreaseScale = () => {
    setScale((prev) => Math.min(prev + 5, 125)); // Max 125%
  };

  const handleResetScale = () => {
    setScale(100);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand & Main Nav */}
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className="flex items-center space-x-2 text-slate-900 font-semibold text-base hover:opacity-85 transition-opacity"
          >
            <span className="w-6 h-6 bg-slate-900 text-white rounded flex items-center justify-center text-xs font-bold">
              T
            </span>
            <span>TaskFlow</span>
          </Link>

          <nav className="flex items-center space-x-2">
            <Link
              to="/"
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Projects</span>
            </Link>

            <Link
              to="/trash"
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                location.pathname === '/trash'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Trash</span>
            </Link>
          </nav>
        </div>

        {/* User Profile Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          {user && (
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 py-1 px-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer select-none"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold uppercase">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <span className="text-xs font-medium text-slate-800 hidden sm:inline-block">
                {user.name}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                  isDropdownOpen ? 'rotate-180 text-slate-700' : ''
                }`}
              />
            </button>
          )}

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              {/* User summary header */}
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900 text-xs truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
              </div>

              {/* Interface Scale controller */}
              <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <span className="text-[11px] font-medium text-slate-700">UI & Font Scale</span>
                  {scale !== 100 && (
                    <button
                      onClick={handleResetScale}
                      className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center space-x-0.5"
                      title="Reset to 100%"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-1">
                  <button
                    type="button"
                    onClick={handleDecreaseScale}
                    disabled={scale <= 85}
                    className="p-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Decrease font scale"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-xs font-semibold text-slate-800">
                    {scale}%
                  </span>

                  <button
                    type="button"
                    onClick={handleIncreaseScale}
                    disabled={scale >= 125}
                    className="p-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Increase font scale"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Trash Link in Dropdown */}
              <Link
                to="/trash"
                onClick={() => setIsDropdownOpen(false)}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Trash (30-day retention)</span>
              </Link>

              {/* Edit Profile */}
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsEditProfileOpen(true);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit Profile</span>
              </button>

              {/* Change Password */}
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsChangePasswordOpen(true);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Change Password</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              {/* Logout */}
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </header>
  );
};

export default Navbar;

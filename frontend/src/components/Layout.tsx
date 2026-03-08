import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const { unreadCount } = await notificationService.getUnreadCount();
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-light transition-all duration-500">
      {/* Glassmorphism Navigation */}
      <nav className="sticky top-0 z-50 glass-bg border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo with Animation */}
              <Link to="/dashboard" className="flex items-center gap-3 group">
                <div className="relative">
                  <img 
                    src="/cmpe_logo.jpg" 
                    alt="CMPE" 
                    className="h-12 w-12 rounded-xl object-cover shadow-lg transition-transform duration-300 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  CMPE STAVBY
                </span>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden sm:ml-8 sm:flex sm:gap-2">
                <Link to="/dashboard" className="nav-item">
                  {t('nav.dashboard')}
                </Link>
                <Link to="/extra-work" className="nav-item">
                  {t('nav.extraWork')}
                </Link>
                <Link to="/shifts" className="nav-item">
                  {t('nav.shifts')}
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-item">
                    {t('nav.admin')}
                  </Link>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <ThemeSwitcher />
              </div>
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              
              {/* Notifications with Glass Effect */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) loadUnreadCount();
                  }}
                  className="relative p-2.5 rounded-xl glass-card hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-300 hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-glow animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 glass-card animate-scale-in border border-white/20 dark:border-gray-700/50 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-primary-500/10 to-transparent border-b border-white/20 dark:border-gray-700/50 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('notifications.title')}</h3>
                      <Link
                        to="/notifications"
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                        onClick={() => setShowNotifications(false)}
                      >
                        {t('common.back')} →
                      </Link>
                    </div>
                    <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      <p>{unreadCount} {t('notifications.noNotifications')}</p>
                    </div>
                    <div className="p-4 border-t border-white/20 dark:border-gray-700/50 bg-gradient-to-b from-transparent to-primary-50/50 dark:to-primary-900/10">
                      <Link
                        to="/notifications"
                        className="text-center block text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                        onClick={() => setShowNotifications(false)}
                      >
                        {t('notifications.title')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Info with Glass Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 glass-card">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl glass-card text-sm font-medium text-primary-600 hover:text-white hover:bg-gradient-to-r hover:from-primary-500 hover:to-primary-600 transition-all duration-300 hover:scale-105 whitespace-nowrap"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with Padding */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

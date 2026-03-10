import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore, useAuthStore } from '../../store';
import { ThemeName } from '../../store/themeStore';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { theme, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: '/', label: 'Kanban' },
    { path: '/projects', label: 'Projects' },
    { path: '/todos', label: 'Todos' },
    { path: '/documents', label: 'Documents' },
  ];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const themeOptions: { id: ThemeName; label: string; colors: string[] }[] = [
    { id: 'dark', label: 'Dark', colors: ['#0f172a', '#8b5cf6'] },
    { id: 'light', label: 'Light', colors: ['#f8fafc', '#7c3aed'] },
    { id: 'midnight', label: 'Midnight', colors: ['#0a0e27', '#6366f1'] },
    { id: 'sunset', label: 'Sunset', colors: ['#1a0f0a', '#f97316'] },
    { id: 'forest', label: 'Forest', colors: ['#0a1a0f', '#22c55e'] },
    { id: 'ocean', label: 'Ocean', colors: ['#0a1520', '#06b6d4'] },
  ];

  return (
    <nav className="glass-card" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold gradient-text">
              Dashboard
            </Link>
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path === '/documents' && location.pathname.startsWith('/documents'));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg -z-10"
                        style={{ background: 'rgba(139, 92, 246, 0.1)' }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme selector */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                style={{ background: 'var(--color-bg-tertiary)' }}
                title="Change theme"
              >
                <div className="w-4 h-4 rounded-full" style={{ background: 'var(--color-accent)' }} />
              </button>

              {showThemeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-11 z-50 glass-card p-2 min-w-40"
                >
                  {themeOptions.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setShowThemeMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        color: theme === t.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        background: theme === t.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                      }}
                      onMouseOver={(e) => {
                        if (theme !== t.id) e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                      }}
                      onMouseOut={(e) => {
                        if (theme !== t.id) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div className="flex gap-0.5">
                        {t.colors.map((c, i) => (
                          <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
                        ))}
                      </div>
                      {t.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Settings */}
            <Link
              to="/settings"
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
              style={{ background: 'var(--color-bg-tertiary)' }}
              title="Settings"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-text-secondary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            {/* User info & logout */}
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {user.username}
                </span>
                <button
                  onClick={logout}
                  className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--color-text-secondary)', background: 'var(--color-bg-tertiary)' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = '#f87171';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

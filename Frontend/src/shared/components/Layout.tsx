import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  PlusSquare,
  Workflow,
  BarChart3,
  LogOut,
  Layers,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getSocket } from '../lib/socket';
import styles from './Layout.module.css';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    // Initialize Socket.io connection on app layout mount
    getSocket();
  }, []);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobs', label: 'All Jobs', icon: ListTodo },
    { to: '/create-job', label: 'Create Job', icon: PlusSquare },
    { to: '/batches', label: 'Batch Flows', icon: Workflow },
    { to: '/analytics', label: 'Analytics & Load Tests', icon: BarChart3 },
  ];

  return (
    <div className={styles.layoutWrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <Layers size={22} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>QueueForge</span>
            <span className={styles.brandTagline}>Distributed Queues</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                end={item.to === '/'}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Socket Status Indicator */}
        <div className={styles.socketStatus}>
          <span className={styles.statusDot} />
          <Activity size={14} />
          <span>Real-time Sync Active</span>
        </div>

        {/* User Footer */}
        <div className={styles.userFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{user?.fullname || 'User'}</span>
              <span className={styles.userEmail}>{user?.email || 'user@queueforge'}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

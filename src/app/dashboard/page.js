'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import styles from './page.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container mt-8"><div className="loader"></div></div>;
  if (!stats) return <div className="container mt-8">Failed to load dashboard.</div>;

  const total = stats.totalTasks || 1; // Prevent division by zero for progress bars

  return (
    <div className={`container ${styles.dashboard}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome, {user?.name}</h1>
        <p className={styles.subtitle}>Here is an overview of your team's tasks.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Tasks</span>
          <span className={`${styles.statValue} ${styles.primary}`}>{stats.totalTasks}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>My Assigned Tasks</span>
          <span className={`${styles.statValue} ${styles.warning}`}>{stats.myTasksCount}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completed Tasks</span>
          <span className={`${styles.statValue} ${styles.success}`}>{stats.tasksByStatus?.DONE || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Overdue Tasks</span>
          <span className={`${styles.statValue} ${styles.danger}`}>{stats.overdueTasks}</span>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Tasks by Status</h2>
          <div className={styles.statusBars}>
            <div className={styles.statusBar}>
              <span className={styles.statusLabel}>To Do</span>
              <div className={styles.barTrack}>
                <div className={`${styles.barFill} ${styles.todo}`} style={{ width: `${((stats.tasksByStatus?.TODO || 0) / total) * 100}%` }}></div>
              </div>
              <span className={styles.statusCount}>{stats.tasksByStatus?.TODO || 0}</span>
            </div>
            <div className={styles.statusBar}>
              <span className={styles.statusLabel}>In Progress</span>
              <div className={styles.barTrack}>
                <div className={`${styles.barFill} ${styles.progress}`} style={{ width: `${((stats.tasksByStatus?.IN_PROGRESS || 0) / total) * 100}%` }}></div>
              </div>
              <span className={styles.statusCount}>{stats.tasksByStatus?.IN_PROGRESS || 0}</span>
            </div>
            <div className={styles.statusBar}>
              <span className={styles.statusLabel}>Done</span>
              <div className={styles.barTrack}>
                <div className={`${styles.barFill} ${styles.done}`} style={{ width: `${((stats.tasksByStatus?.DONE || 0) / total) * 100}%` }}></div>
              </div>
              <span className={styles.statusCount}>{stats.tasksByStatus?.DONE || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import styles from './Navigation.module.css';

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav className={styles.nav}>
      <div className={styles.links}>
        <Link href="/dashboard" className={styles.brand}>
          TeamTask
        </Link>
        <Link href="/dashboard" className={`${styles.link} ${pathname === '/dashboard' ? styles.active : ''}`}>
          Dashboard
        </Link>
        <Link href="/projects" className={`${styles.link} ${pathname.startsWith('/projects') ? styles.active : ''}`}>
          Projects
        </Link>
      </div>
      <div className={styles.userInfo}>
        <span className={styles.userName}>{user.name}</span>
        <button onClick={logout} className={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

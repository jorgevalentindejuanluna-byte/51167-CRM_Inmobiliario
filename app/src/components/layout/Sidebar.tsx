'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NAV_ITEMS, NAV_BOTTOM_ITEMS } from '@/lib/constants';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} id="sidebar-nav">
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <span className="material-symbols-outlined">apartment</span>
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoName}>Real Top State</span>
          <span className={styles.logoSub}>CRM Inmobiliario</span>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <li key={item.key}>
                <Link
                  href={item.path}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  id={`nav-${item.key}`}
                >
                  {isActive && <div className={styles.activeIndicator} />}
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Navegación inferior */}
      <div className={styles.navBottom}>
        {NAV_BOTTOM_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.key}
              href={item.path}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              id={`nav-${item.key}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

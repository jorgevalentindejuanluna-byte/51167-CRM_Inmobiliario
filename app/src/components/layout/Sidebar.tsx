'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NAV_ITEMS, NAV_BOTTOM_ITEMS } from '@/lib/constants';
import styles from './Sidebar.module.css';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  children?: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(
    pathname.startsWith('/settings') ? 'settings' : null
  );

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
        {(NAV_BOTTOM_ITEMS as unknown as NavItem[]).map((item) => {
          const isActive = pathname.startsWith(item.path);
          const isExpanded = expanded === item.key;

          return (
            <div key={item.key}>
              <button
                onClick={() => {
                  setExpanded(isExpanded ? null : item.key);
                }}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                id={`nav-${item.key}`}
                style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none', fontSize: 'inherit', fontFamily: 'inherit', textAlign: 'left' }}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.children && (
                  <span className={`material-symbols-outlined ${styles.chevron}`}
                    style={{ marginLeft: 'auto', fontSize: 18, transition: 'transform var(--transition-fast)' }}
                  >
                    expand_more
                  </span>
                )}
              </button>
              {item.children && isExpanded && (
                <div className={styles.submenu}>
                  {item.children.map(child => {
                    const isChildActive = pathname === child.path || pathname.startsWith(child.path + '/');
                    return (
                      <Link
                        key={child.key}
                        href={child.path}
                        className={`${styles.subItem} ${isChildActive ? styles.subItemActive : ''}`}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{child.icon}</span>
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

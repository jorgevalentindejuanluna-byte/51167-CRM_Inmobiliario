'use client';

import Link from 'next/link';
import { TOP_QUICK_LINKS } from '@/lib/constants';
import { useDashboardKpis } from '@/lib/use-data';
import { useAuth } from '@/lib/auth-context';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { user, logout } = useAuth();
  const { data: kpis } = useDashboardKpis();
  
  if (!user) return null;
  
  const initials = `${user.nombre[0]}${user.apellidos[0]}`;

  return (
    <header className={styles.topbar} id="topbar">
      {/* Quick links */}
      <nav className={styles.quickLinks}>
        {TOP_QUICK_LINKS.map((link) => (
          <Link key={link.key} href={link.path} className={styles.quickLink}>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Spacer */}
      <div className={styles.spacer} />

      {/* Búsqueda */}
      <div className={styles.search} id="global-search">
        <span className="material-symbols-outlined">search</span>
        <input
          type="text"
          placeholder="Buscar leads, inmuebles, operaciones..."
          className={styles.searchInput}
        />
        <kbd className={styles.searchKbd}>⌘K</kbd>
      </div>

      {/* Acciones */}
      <div className={styles.actions}>
        {/* Notificaciones */}
        <button className={styles.iconBtn} id="btn-notifications" title="Notificaciones">
          <span className="material-symbols-outlined">notifications</span>
          {(kpis.leads_sin_contactar + kpis.documentos_pendientes) > 0 && (
            <span className={styles.notifBadge}>
              {kpis.leads_sin_contactar + kpis.documentos_pendientes}
            </span>
          )}
        </button>

        {/* Avatar usuario */}
        <button className={styles.userBtn} id="btn-user-menu" onClick={logout} title="Cerrar sesión">
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.nombre} {user.apellidos.split(' ')[0]}</span>
            <span className={styles.userRole} style={{textTransform: 'capitalize'}}>{user.rol.replace('_', ' ')}</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
        </button>
      </div>
    </header>
  );
}

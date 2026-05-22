'use client';

import React, { useState } from 'react';
import { useLeads, useDashboardKpis } from '@/lib/use-data';
import { formatRelativeTime } from '@/lib/constants';
import styles from './page.module.css';

export default function MobileDashboard() {
  const { data: leads } = useLeads();
  const { data: kpis } = useDashboardKpis();
  const [activeTab, setActiveTab] = useState('home');

  const hotLeads = leads.filter(l => l.temperatura === 'caliente').slice(0, 5);

  return (
    <div className={styles.mobileContainer}>
      {/* Top Bar Movil */}
      <header className={styles.header}>
        <div className={styles.avatar}>CM</div>
        <div className={styles.brand}>Real Top State</div>
        <button className={styles.notifBtn}>
          <span className="material-symbols-outlined">notifications</span>
          <span className={styles.notifBadge}>3</span>
        </button>
      </header>

      {/* Contenido Principal */}
      <main className={styles.content}>
        {activeTab === 'home' && (
          <div className={styles.homeView}>
            <h1 className={styles.welcome}>¡Buen día, Carlos!</h1>
            
            {/* Quick Actions (Regla 12) */}
            <div className={styles.quickActions}>
              <button className={styles.actionBtn}>
                <div className={styles.actionIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
                  <span className="material-symbols-outlined">add_circle</span>
                </div>
                <span>Nuevo Lead</span>
              </button>
              <button className={styles.actionBtn}>
                <div className={styles.actionIcon} style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <span className="material-symbols-outlined">photo_camera</span>
                </div>
                <span>Subir Fotos</span>
              </button>
              <button className={styles.actionBtn}>
                <div className={styles.actionIcon} style={{ background: '#fef2f2', color: '#dc2626' }}>
                  <span className="material-symbols-outlined">document_scanner</span>
                </div>
                <span>Escanear DNI</span>
              </button>
              <button className={styles.actionBtn}>
                <div className={styles.actionIcon} style={{ background: '#fff7ed', color: '#ea580c' }}>
                  <span className="material-symbols-outlined">draw</span>
                </div>
                <span>Firma Presencial</span>
              </button>
            </div>

            {/* Alertas Prioritarias (Regla 14.2) */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Alertas Prioritarias</h2>
              <div className={styles.alertsGrid}>
                <div className={`${styles.alertCard} ${styles.alertCritical}`}>
                  <span className={styles.alertValue}>{kpis.leads_sin_contactar}</span>
                  <span className={styles.alertLabel}>Sin contactar</span>
                </div>
                <div className={`${styles.alertCard} ${styles.alertWarning}`}>
                  <span className={styles.alertValue}>{kpis.firmas_pendientes}</span>
                  <span className={styles.alertLabel}>Firmas urgentes</span>
                </div>
              </div>
            </section>

            {/* Leads Calientes */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Leads Calientes</h2>
                <button className={styles.viewAll}>Ver todos</button>
              </div>
              <div className={styles.leadList}>
                {hotLeads.map(lead => (
                  <div key={lead.id} className={styles.leadCard}>
                    <div className={styles.leadInfo}>
                      <strong>{lead.nombre} {lead.apellidos}</strong>
                      <p>{lead.zona_interes} • {lead.tipo_operacion}</p>
                    </div>
                    <div className={styles.leadActions}>
                      <button className={styles.phoneBtn}><span className="material-symbols-outlined">call</span></button>
                      <button className={styles.waBtn}><span className="material-symbols-outlined">chat</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'visitas' && (
          <div className={styles.visitasView}>
            <h2 className={styles.sectionTitle}>Visitas de Hoy</h2>
            {/* Lista de visitas programadas */}
          </div>
        )}
      </main>

      {/* Tab Bar Inferior (Estilo App Nativa) */}
      <nav className={styles.tabBar}>
        <button 
          className={`${styles.tabItem} ${activeTab === 'home' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="material-symbols-outlined">home</span>
          <span>Inicio</span>
        </button>
        <button 
          className={`${styles.tabItem} ${activeTab === 'visitas' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('visitas')}
        >
          <span className="material-symbols-outlined">calendar_today</span>
          <span>Visitas</span>
        </button>
        <button 
          className={`${styles.tabItem} ${activeTab === 'leads' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          <span className="material-symbols-outlined">group</span>
          <span>Leads</span>
        </button>
        <button 
          className={`${styles.tabItem} ${activeTab === 'profile' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="material-symbols-outlined">person</span>
          <span>Perfil</span>
        </button>
      </nav>
    </div>
  );
}

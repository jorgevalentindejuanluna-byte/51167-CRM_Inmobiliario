'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAgents } from '@/lib/use-data';
import {
  AGENT_TYPE_LABELS,
  AGENT_STATUS_LABELS,
  AGENT_STATUS_COLORS,
  AGENT_RELACION_LABELS,
  formatCurrency,
  formatDate,
} from '@/lib/constants';
import styles from './page.module.css';

type Tab = 'resumen' | 'actividad' | 'inmuebles' | 'clientes' | 'comisiones' | 'documentos';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'resumen', label: 'Resumen', icon: 'person' },
  { key: 'actividad', label: 'Actividad', icon: 'timeline' },
  { key: 'inmuebles', label: 'Inmuebles', icon: 'domain' },
  { key: 'clientes', label: 'Clientes', icon: 'group' },
  { key: 'comisiones', label: 'Comisiones', icon: 'payments' },
  { key: 'documentos', label: 'Documentos', icon: 'description' },
];

export default function AgentDetailClient({ id }: { id: string }) {
  const { data: agents } = useAgents();
  const agent = agents.find(a => a.id === id);
  const [activeTab, setActiveTab] = useState<Tab>('resumen');

  if (!agent) {
    return (
      <div className="empty-state">
        <span className="material-symbols-outlined">badge</span>
        <p>Agente no encontrado.</p>
        <Link href="/agents" className="btn btn--outline" style={{ marginTop: '1rem' }}>
          Volver a Agentes
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Cabecera */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/agents" className={styles.backBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          </Link>
          <div className={`avatar ${styles.avatarLarge}`}>{agent.nombre[0]}{agent.apellidos[0]}</div>
          <div>
            <div className={styles.nameRow}>
              <h1 className="text-headline">{agent.nombre} {agent.apellidos}</h1>
              <span className={`badge badge--${AGENT_STATUS_COLORS[agent.estado]}`}>{AGENT_STATUS_LABELS[agent.estado]}</span>
            </div>
            <p className="text-helper text-muted">
              {AGENT_TYPE_LABELS[agent.tipo_agente]} · {agent.oficina || 'Sin oficina'} · Código: {agent.codigo_interno || '—'}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn--outline btn--sm">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span> Editar
          </button>
          <button className="btn btn--outline btn--sm">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>phone</span> Llamar
          </button>
        </div>
      </header>

      {/* Mini KPIs */}
      <div className={styles.miniKpiRow}>
        <div className={styles.miniKpi}>
          <span className={styles.miniKpiValue}>{agent.inmuebles_asignados}</span>
          <span className={styles.miniKpiLabel}>Inmuebles</span>
        </div>
        <div className={styles.miniKpi}>
          <span className={styles.miniKpiValue}>{agent.clientes_asignados}</span>
          <span className={styles.miniKpiLabel}>Clientes</span>
        </div>
        <div className={styles.miniKpi}>
          <span className={styles.miniKpiValue}>{agent.operaciones_abiertas}</span>
          <span className={styles.miniKpiLabel}>Ops. abiertas</span>
        </div>
        <div className={styles.miniKpi}>
          <span className={styles.miniKpiValue}>{agent.ventas_cerradas}</span>
          <span className={styles.miniKpiLabel}>Ventas</span>
        </div>
        <div className={styles.miniKpi}>
          <span className={styles.miniKpiValue}>{formatCurrency(agent.comision_generada)}</span>
          <span className={styles.miniKpiLabel}>Comisiones</span>
        </div>
        <div className={styles.miniKpi}>
          <span className={styles.miniKpiValue}>{(agent.cumplimiento_objetivo || 0)}%</span>
          <span className={styles.miniKpiLabel}>Objetivo</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button key={tab.key} className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab.key)}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido según tab */}
      <div className={styles.tabContent}>
        {activeTab === 'resumen' && (
          <div className={styles.grid2col}>
            <div className="card">
              <h3 className="text-title" style={{ marginBottom: '1rem' }}>Datos Personales</h3>
              <dl className={styles.dl}>
                <dt>DNI/NIE</dt><dd>{agent.documento_identidad || '—'}</dd>
                <dt>Teléfono</dt><dd>{agent.telefono}</dd>
                <dt>Email</dt><dd>{agent.email}</dd>
                <dt>Dirección</dt><dd>{agent.direccion || '—'}</dd>
                <dt>Idiomas</dt><dd>{agent.idiomas?.join(', ') || '—'}</dd>
              </dl>
            </div>
            <div className="card">
              <h3 className="text-title" style={{ marginBottom: '1rem' }}>Datos Profesionales</h3>
              <dl className={styles.dl}>
                <dt>Tipo</dt><dd>{AGENT_TYPE_LABELS[agent.tipo_agente]}</dd>
                <dt>Oficina</dt><dd>{agent.oficina || '—'}</dd>
                <dt>Equipo</dt><dd>{agent.equipo || '—'}</dd>
                <dt>Zona</dt><dd>{agent.zona_principal || '—'}</dd>
                <dt>Especialización</dt><dd>{agent.especializacion?.join(', ') || '—'}</dd>
                <dt>Experiencia</dt><dd>{agent.experiencia_anios ? `${agent.experiencia_anios} años` : '—'}</dd>
              </dl>
            </div>
            <div className="card">
              <h3 className="text-title" style={{ marginBottom: '1rem' }}>Datos Económicos</h3>
              <dl className={styles.dl}>
                <dt>Relación</dt><dd>{AGENT_RELACION_LABELS[agent.tipo_relacion || ''] || '—'}</dd>
                <dt>Comisión venta</dt><dd>{agent.comision_venta ? `${agent.comision_venta}%` : '—'}</dd>
                <dt>Comisión captación</dt><dd>{agent.comision_captacion ? `${agent.comision_captacion}%` : '—'}</dd>
                <dt>Comisión alquiler</dt><dd>{agent.comision_alquiler ? `${agent.comision_alquiler}%` : '—'}</dd>
                <dt>Porcentaje global</dt><dd>{agent.porcentaje_comision ? `${agent.porcentaje_comision}%` : '—'}</dd>
              </dl>
            </div>
            <div className="card">
              <h3 className="text-title" style={{ marginBottom: '1rem' }}>Detalles</h3>
              <dl className={styles.dl}>
                <dt>Fecha alta</dt><dd>{formatDate(agent.fecha_alta)}</dd>
                <dt>Último acceso</dt><dd>{agent.ultimo_acceso ? formatDate(agent.ultimo_acceso ?? '') : '—'}</dd>
                <dt>2FA</dt><dd>{agent.autenticacion_2fa ? 'Activado' : 'No'}</dd>
                <dt>Nivel comercial</dt><dd>{'⭐'.repeat(agent.nivel_comercial || 0)}</dd>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'actividad' && (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '1rem', opacity: 0.5 }}>timeline</span>
            <p>Registro de actividad del agente — Próximamente</p>
            <p className="text-helper text-muted">Llamadas, visitas, reuniones y seguimientos.</p>
          </div>
        )}

        {activeTab === 'inmuebles' && (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '1rem', opacity: 0.5 }}>domain</span>
            <p>Inmuebles asignados — Próximamente</p>
            <p className="text-helper text-muted">Gestión de inmuebles en captación, venta y alquiler.</p>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '1rem', opacity: 0.5 }}>group</span>
            <p>Clientes asignados — Próximamente</p>
            <p className="text-helper text-muted">Propietarios, compradores, inquilinos e inversores.</p>
          </div>
        )}

        {activeTab === 'comisiones' && (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '1rem', opacity: 0.5 }}>payments</span>
            <p>Comisiones — Próximamente</p>
            <p className="text-helper text-muted">Historial de comisiones generadas, pendientes y liquidadas.</p>
          </div>
        )}

        {activeTab === 'documentos' && (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '1rem', opacity: 0.5 }}>description</span>
            <p>Documentos — Próximamente</p>
            <p className="text-helper text-muted">DNI, contratos, certificados y documentación del agente.</p>
          </div>
        )}
      </div>
    </div>
  );
}

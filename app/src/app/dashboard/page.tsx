'use client';

import {
  useLeads,
  useUsers,
  useDashboardKpis,
  useActivity,
} from '@/lib/use-data';
import {
  formatCurrency,
  formatRelativeTime,
  LEAD_ORIGEN_LABELS,
} from '@/lib/constants';
import styles from './page.module.css';

export default function DashboardPage() {
  const { data: leads } = useLeads();
  const { data: users } = useUsers();
  const { data: kpis } = useDashboardKpis();
  const { data: activity } = useActivity();

  const hotLeads = leads.filter((l) => l.temperatura === 'caliente' && l.score >= 80).slice(0, 3);

  // Contar leads por origen
  const leadsByOrigin = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.origen] = (acc[lead.origen] || 0) + 1;
    return acc;
  }, {});

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className="text-headline">Vista General</h1>
          <p className="text-helper text-muted" style={{ textTransform: 'capitalize' }}>
            {today} · Pulso del mercado en tiempo real
          </p>
        </div>
        <button className="btn btn--primary" id="btn-new-lead">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Nuevo Lead
        </button>
      </header>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={`card ${styles.kpiCard}`}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(242, 190, 140, 0.12)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>person_search</span>
          </div>
          <div>
            <span className="text-label text-muted">Leads Totales</span>
            <p className={styles.kpiValue}>{kpis.leads_totales}</p>
            <span className={styles.kpiTrend}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-secondary)' }}>trending_up</span>
              +{kpis.leads_nuevos_mes} este mes
            </span>
          </div>
        </div>

        <div className={`card ${styles.kpiCard}`}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(64, 239, 183, 0.12)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>domain</span>
          </div>
          <div>
            <span className="text-label text-muted">Inmuebles Activos</span>
            <p className={styles.kpiValue}>{kpis.propiedades_activas}</p>
            <span className={styles.kpiTrend}>
              {kpis.encargos_proximos_caducar > 0 && (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-error)' }}>warning</span>
                  {kpis.encargos_proximos_caducar} encargo por caducar
                </>
              )}
            </span>
          </div>
        </div>

        <div className={`card ${styles.kpiCard}`}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(167, 204, 234, 0.12)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)' }}>account_tree</span>
          </div>
          <div>
            <span className="text-label text-muted">Operaciones en Curso</span>
            <p className={styles.kpiValue}>{kpis.operaciones_en_curso}</p>
            <span className={styles.kpiTrend}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-secondary)' }}>event</span>
              {kpis.visitas_semana} visitas esta semana
            </span>
          </div>
        </div>

        <div className={`card ${styles.kpiCard}`}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(242, 190, 140, 0.12)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>euro</span>
          </div>
          <div>
            <span className="text-label text-muted">Facturación YTD</span>
            <p className={styles.kpiValue}>{formatCurrency(kpis.facturacion_ytd)}</p>
            <span className={styles.kpiTrend}>
              Conversión: {kpis.tasa_conversion}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className={styles.mainGrid}>
        {/* Columna izquierda */}
        <div className={styles.leftColumn}>

          {/* Recomendaciones IA */}
          <div className={`card ${styles.aiCard}`}>
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>psychology</span>
              <h2 className="text-title">Recomendaciones IA</h2>
              <span className="badge badge--primary">IA</span>
            </div>
            <div className={styles.aiList}>
              {hotLeads.map((lead) => (
                <div key={lead.id} className={styles.aiItem}>
                  <div className="avatar">{lead.nombre[0]}{lead.apellidos[0]}</div>
                  <div className={styles.aiItemInfo}>
                    <span className={styles.aiItemName}>{lead.nombre} {lead.apellidos}</span>
                    <span className="text-helper text-muted">{lead.zona_interes} · Score: {lead.score}</span>
                  </div>
                  <div className={styles.aiItemAction}>
                    <button className="btn btn--ghost btn--sm" title="WhatsApp">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chat</span>
                    </button>
                    <button className="btn btn--ghost btn--sm" title="Llamar">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>phone</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas Prioritarias (regla 14.2) */}
          <div className={`card`}>
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-error)' }}>priority_high</span>
              <h2 className="text-title">Alertas Prioritarias</h2>
            </div>
            <div className={styles.alertList}>
              {kpis.leads_sin_contactar > 0 && (
                <div className={styles.alertItem}>
                  <div className={`${styles.alertDot} ${styles.alertDotError}`} />
                  <div>
                    <span className={styles.alertTitle}>Leads sin contactar</span>
                    <span className="text-helper text-muted">{kpis.leads_sin_contactar} leads esperan primer contacto.</span>
                  </div>
                </div>
              )}
              {kpis.documentos_pendientes > 0 && (
                <div className={styles.alertItem}>
                  <div className={`${styles.alertDot} ${styles.alertDotWarning}`} />
                  <div>
                    <span className={styles.alertTitle}>Documentos pendientes</span>
                    <span className="text-helper text-muted">{kpis.documentos_pendientes} documentos requieren revisión.</span>
                  </div>
                </div>
              )}
              {kpis.firmas_pendientes > 0 && (
                <div className={styles.alertItem}>
                  <div className={`${styles.alertDot} ${styles.alertDotWarning}`} />
                  <div>
                    <span className={styles.alertTitle}>Firmas pendientes</span>
                    <span className="text-helper text-muted">{kpis.firmas_pendientes} documentos esperan firma digital.</span>
                  </div>
                </div>
              )}
              {kpis.facturas_vencidas > 0 && (
                <div className={styles.alertItem}>
                  <div className={`${styles.alertDot} ${styles.alertDotError}`} />
                  <div>
                    <span className={styles.alertTitle}>Facturas vencidas</span>
                    <span className="text-helper text-muted">{kpis.facturas_vencidas} facturas han superado fecha de cobro.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Orígenes de leads */}
          <div className="card">
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)' }}>pie_chart</span>
              <h2 className="text-title">Origen de Leads</h2>
            </div>
            <div className={styles.originList}>
              {Object.entries(leadsByOrigin)
                .sort((a, b) => b[1] - a[1])
                .map(([origen, count]) => (
                  <div key={origen} className={styles.originItem}>
                    <span className={styles.originLabel}>
                      {LEAD_ORIGEN_LABELS[origen] || origen}
                    </span>
                    <div className={styles.originBar}>
                      <div
                        className={styles.originBarFill}
                        style={{ width: `${(count / leads.length) * 100}%` }}
                      />
                    </div>
                    <span className={styles.originCount}>{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className={styles.rightColumn}>

          {/* Rendimiento de agentes */}
          <div className="card">
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>group</span>
              <h2 className="text-title">Rendimiento Agentes</h2>
            </div>
            <div className={styles.agentList}>
              {users.filter((u) => ['agente', 'captador'].includes(u.rol)).map((agent) => {
                const agentLeads = leads.filter((l) => l.agente_asignado === agent.id);
                const hotCount = agentLeads.filter((l) => l.temperatura === 'caliente').length;
                return (
                  <div key={agent.id} className={styles.agentItem}>
                    <div className="avatar">{agent.nombre[0]}{agent.apellidos[0]}</div>
                    <div className={styles.agentInfo}>
                      <span className={styles.agentName}>{agent.nombre} {agent.apellidos.split(' ')[0]}</span>
                      <span className="text-helper text-muted">
                        {agentLeads.length} leads · {hotCount} calientes
                      </span>
                    </div>
                    <div className={styles.agentScore}>
                      <div className="score-bar" style={{ width: '80px' }}>
                        <div
                          className={`score-bar__fill ${hotCount > 1 ? 'score-bar__fill--high' : 'score-bar__fill--medium'}`}
                          style={{ width: `${Math.min((agentLeads.length / 5) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="card">
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)' }}>history</span>
              <h2 className="text-title">Actividad Reciente</h2>
            </div>
            <div className={styles.activityList}>
              {activity.map((item) => (
                <div key={item.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{item.icon}</span>
                  </div>
                  <div className={styles.activityContent}>
                    <p>
                      <strong>{item.user_name}</strong> {item.action}{' '}
                      {item.target && <strong className="text-primary">{item.target}</strong>}
                    </p>
                    <span className="text-helper text-muted">{formatRelativeTime(item.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { use } from 'react';
import Link from 'next/link';
import { useLeads, useUsers, useProperties } from '@/lib/use-data';
import DocumentManager from '@/components/documents/DocumentManager';
import {
  LEAD_ESTADO_LABELS,
  LEAD_ESTADO_COLORS,
  LEAD_TEMP_LABELS,
  LEAD_ORIGEN_LABELS,
  LEAD_TIPO_LABELS,
  formatDate,
  formatCurrency,
} from '@/lib/constants';
import styles from './page.module.css';

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: leads } = useLeads();
  const { data: users } = useUsers();
  const { data: properties } = useProperties();

  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="empty-state">
        <span className="material-symbols-outlined">error</span>
        <p>Lead no encontrado.</p>
        <Link href="/leads" className="btn btn--secondary" style={{ marginTop: '16px' }}>
          Volver a Leads
        </Link>
      </div>
    );
  }

  const agent = users.find((u) => u.id === lead.agente_asignado);

  // Matching de propiedades sugeridas (regla 9.1)
  const suggestedProperties = properties.filter((prop) => {
    if (lead.tipo_lead !== 'comprador') return false;
    if (lead.presupuesto_max && prop.precio > lead.presupuesto_max) return false;
    if (lead.presupuesto_min && prop.precio < lead.presupuesto_min) return false;
    if (lead.zona_interes && !prop.zona?.toLowerCase().includes(lead.zona_interes.split(',')[0].toLowerCase())) return false;
    return prop.estado === 'disponible';
  });

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/leads" className={styles.breadcrumbLink}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Leads
        </Link>
        <span className="text-muted">/</span>
        <span>{lead.nombre} {lead.apellidos}</span>
      </nav>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={`avatar avatar--lg`}>{lead.nombre[0]}{lead.apellidos[0]}</div>
          <div>
            <h1 className="text-headline">{lead.nombre} {lead.apellidos}</h1>
            <div className={styles.headerMeta}>
              <span className={`badge badge--${LEAD_ESTADO_COLORS[lead.estado]}`}>
                {LEAD_ESTADO_LABELS[lead.estado]}
              </span>
              <span className="badge badge--neutral">{LEAD_TIPO_LABELS[lead.tipo_lead]}</span>
              <span className={styles.tempIndicator}>
                <span className={`temp-dot temp-dot--${lead.temperatura}`} />
                {LEAD_TEMP_LABELS[lead.temperatura]}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn--ghost" title="WhatsApp" id="btn-whatsapp">
            <span className="material-symbols-outlined">chat</span>
            WhatsApp
          </button>
          <button className="btn btn--ghost" title="Llamar" id="btn-call">
            <span className="material-symbols-outlined">phone</span>
            Llamar
          </button>
          <button className="btn btn--ghost" title="Email" id="btn-email">
            <span className="material-symbols-outlined">mail</span>
            Email
          </button>
          <Link href="/portal" className="btn btn--secondary" title="Ver como cliente">
            <span className="material-symbols-outlined">open_in_new</span>
            Portal Cliente
          </Link>
          <button className="btn btn--primary" id="btn-edit-lead">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
            Editar
          </button>
        </div>
      </header>

      {/* Content grid */}
      <div className={styles.contentGrid}>

        {/* Columna izquierda: datos + score */}
        <div className={styles.leftCol}>

          {/* Score IA */}
          <div className={`card ${styles.scoreCard}`}>
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>psychology</span>
              <h2 className="text-title">Score IA</h2>
            </div>
            <div className={styles.scoreDisplay}>
              <div className={styles.scoreBig} data-score={lead.score >= 80 ? 'high' : lead.score >= 50 ? 'medium' : 'low'}>
                {lead.score}
              </div>
              <div className={styles.scoreDetails}>
                <p className="text-helper">
                  {lead.score >= 80 ? 'Alta probabilidad de conversión' :
                   lead.score >= 50 ? 'Probabilidad moderada' :
                   'Necesita más calificación'}
                </p>
                <div className="score-bar" style={{ height: '8px' }}>
                  <div
                    className={`score-bar__fill ${lead.score >= 80 ? 'score-bar__fill--high' : lead.score >= 50 ? 'score-bar__fill--medium' : 'score-bar__fill--low'}`}
                    style={{ width: `${lead.score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Datos de contacto */}
          <div className="card">
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)' }}>contact_phone</span>
              <h2 className="text-title">Datos de Contacto</h2>
            </div>
            <div className={styles.dataGrid}>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Email</span>
                <span>{lead.email || '—'}</span>
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Teléfono</span>
                <span>{lead.telefono || '—'}</span>
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">WhatsApp</span>
                <span>{lead.whatsapp || '—'}</span>
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Origen</span>
                <span>{LEAD_ORIGEN_LABELS[lead.origen]}</span>
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Agente</span>
                <span>{agent ? `${agent.nombre} ${agent.apellidos.split(' ')[0]}` : 'Sin asignar'}</span>
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Creado</span>
                <span>{formatDate(lead.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Preferencias de búsqueda */}
          {lead.tipo_lead === 'comprador' && (
            <div className="card">
              <div className={styles.cardHeader}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>search</span>
                <h2 className="text-title">Preferencias de Búsqueda</h2>
              </div>
              <div className={styles.dataGrid}>
                <div className={styles.dataItem}>
                  <span className="text-label text-muted">Zona de interés</span>
                  <span>{lead.zona_interes || '—'}</span>
                </div>
                <div className={styles.dataItem}>
                  <span className="text-label text-muted">Presupuesto</span>
                  <span>
                    {lead.presupuesto_min && lead.presupuesto_max
                      ? `${formatCurrency(lead.presupuesto_min)} - ${formatCurrency(lead.presupuesto_max)}`
                      : '—'}
                  </span>
                </div>
                <div className={styles.dataItem}>
                  <span className="text-label text-muted">Urgencia</span>
                  <span style={{ textTransform: 'capitalize' }}>{lead.urgencia || '—'}</span>
                </div>
                <div className={styles.dataItem}>
                  <span className="text-label text-muted">Operación</span>
                  <span style={{ textTransform: 'capitalize' }}>{lead.tipo_operacion || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* RGPD (regla 5.2) — siempre visible en ficha de lead */}
          <div className="card">
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)' }}>shield</span>
              <h2 className="text-title">RGPD y Consentimiento</h2>
            </div>
            <div className={styles.dataGrid}>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Consentimiento</span>
                <span className={lead.consentimiento_rgpd ? 'text-secondary' : 'text-error'}>
                  {lead.consentimiento_rgpd ? '✓ Otorgado' : '✗ Pendiente'}
                </span>
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Canal</span>
                <span style={{ textTransform: 'capitalize' }}>{lead.canal_consentimiento?.replace('_', ' ') || '—'}</span>
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Fecha</span>
                <span>{lead.fecha_consentimiento ? formatDate(lead.fecha_consentimiento) : '—'}</span>
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Origen dato</span>
                <span>{lead.origen_dato || '—'}</span>
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Finalidad</span>
                <span>{lead.finalidad_tratamiento || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: timeline + propiedades sugeridas */}
        <div className={styles.rightCol}>

          {/* Próxima acción */}
          {lead.proxima_accion && (
            <div className={`card ${styles.nextActionCard}`}>
              <div className={styles.cardHeader}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>task_alt</span>
                <h2 className="text-title">Próxima Acción</h2>
              </div>
              <p style={{ fontWeight: 500 }}>{lead.proxima_accion}</p>
              {lead.fecha_proxima_accion && (
                <p className="text-helper text-muted" style={{ marginTop: '4px' }}>
                  Programada: {formatDate(lead.fecha_proxima_accion)}
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="btn btn--primary btn--sm">Completar</button>
                <button className="btn btn--secondary btn--sm">Reprogramar</button>
              </div>
            </div>
          )}

          {/* Propiedades sugeridas (matching IA — regla 9.1) */}
          {suggestedProperties.length > 0 && (
            <div className="card">
              <div className={styles.cardHeader}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>auto_awesome</span>
                <h2 className="text-title">Inmuebles Sugeridos</h2>
                <span className="badge badge--primary">IA</span>
              </div>
              <div className={styles.propertyList}>
                {suggestedProperties.map((prop) => (
                  <div key={prop.id} className={styles.propertyItem}>
                    <div className={styles.propertyThumb}>
                      <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-outline)' }}>home</span>
                    </div>
                    <div className={styles.propertyInfo}>
                      <strong>{prop.titulo}</strong>
                      <span className="text-helper text-muted">{prop.zona}, {prop.ciudad}</span>
                      <span className="text-primary" style={{ fontWeight: 600, fontSize: '14px' }}>
                        {formatCurrency(prop.precio)}
                      </span>
                    </div>
                    <button className="btn btn--ghost btn--sm" title="Enviar al lead">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gestor Documental (Regla 6) */}
          <DocumentManager leadId={lead.id} agencyId={lead.agency_id} />

          {/* Notas */}
          {lead.notas && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div className={styles.cardHeader}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)' }}>notes</span>
                <h2 className="text-title">Notas</h2>
              </div>
              <p className="text-body text-muted">{lead.notas}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

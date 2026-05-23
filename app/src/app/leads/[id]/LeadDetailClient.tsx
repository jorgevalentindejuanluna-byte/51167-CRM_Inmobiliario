'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLeads, useUsers, useProperties, saveLocalMock } from '@/lib/use-data';
import { useAuth } from '@/lib/auth-context';
import LeadDocumentChecklist from '@/components/leads/LeadDocumentChecklist';
import { updateLead } from '@/app/actions/leads';
import { showToast } from '@/lib/toast';
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

export function LeadDetailClient({ id }: { id: string }) {
  const { token } = useAuth();
  const { data: leads } = useLeads();
  const { data: users } = useUsers();
  const { data: properties } = useProperties();

  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<any>(null);

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

  const handleEditClick = () => {
    setEditedLead({ ...lead });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedLead(null);
  };

  const handleSave = async () => {
    // Optimistic Update local
    Object.assign(lead, editedLead);
    setIsEditing(false);
    
    // Si estamos usando mocks (fallo de supabase), guardar en localstorage para persistir tras F5
    saveLocalMock('leads', leads);

    // Call server action for persistence
    const res = await updateLead(lead.id, editedLead, token);
    if (!res.success) {
      showToast('Error al guardar los cambios: ' + res.error, 'error');
    } else {
      showToast('Cambios guardados correctamente', 'success');
    }
  };

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
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  value={editedLead.nombre} 
                  onChange={(e) => setEditedLead({...editedLead, nombre: e.target.value})}
                  style={{ fontSize: '1.2rem', padding: '4px', borderRadius: '4px', border: '1px solid var(--color-outline)' }}
                />
                <input 
                  type="text" 
                  value={editedLead.apellidos} 
                  onChange={(e) => setEditedLead({...editedLead, apellidos: e.target.value})}
                  style={{ fontSize: '1.2rem', padding: '4px', borderRadius: '4px', border: '1px solid var(--color-outline)' }}
                />
              </div>
            ) : (
              <>
                <h1 className="text-headline">{lead.nombre} {lead.apellidos}</h1>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge`} style={{ backgroundColor: LEAD_ESTADO_COLORS[lead.estado], color: 'white' }}>
                    {LEAD_ESTADO_LABELS[lead.estado]}
                  </span>
                  <span className="badge badge--outline" style={{ background: 'var(--color-surface-variant)' }}>
                    {LEAD_TIPO_LABELS[lead.tipo_lead] || lead.tipo_lead}
                  </span>
                  <span className="badge badge--outline">{LEAD_TEMP_LABELS[lead.temperatura]}</span>
                </div>
              </>
            )}
            <div className={styles.headerMeta}>
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
          {isEditing ? (
            <>
              <button className="btn btn--secondary" onClick={handleCancel}>
                Cancelar
              </button>
              <button className="btn btn--primary" onClick={handleSave}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                Guardar
              </button>
            </>
          ) : (
            <button className="btn btn--primary" id="btn-edit-lead" onClick={handleEditClick}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
              Editar
            </button>
          )}
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
                {isEditing ? (
                  <input type="email" value={editedLead.email || ''} onChange={(e) => setEditedLead({...editedLead, email: e.target.value})} style={{ padding: '4px', width: '100%', borderRadius: '4px', border: '1px solid var(--color-outline)' }} />
                ) : (
                  <span>{lead.email || '—'}</span>
                )}
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Teléfono</span>
                {isEditing ? (
                  <input type="tel" value={editedLead.telefono || ''} onChange={(e) => setEditedLead({...editedLead, telefono: e.target.value})} style={{ padding: '4px', width: '100%', borderRadius: '4px', border: '1px solid var(--color-outline)' }} />
                ) : (
                  <span>{lead.telefono || '—'}</span>
                )}
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">WhatsApp</span>
                {isEditing ? (
                  <input type="tel" value={editedLead.whatsapp || ''} onChange={(e) => setEditedLead({...editedLead, whatsapp: e.target.value})} style={{ padding: '4px', width: '100%', borderRadius: '4px', border: '1px solid var(--color-outline)' }} />
                ) : (
                  <span>{lead.whatsapp || '—'}</span>
                )}
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Origen</span>
                {isEditing ? (
                  <select value={editedLead.origen} onChange={(e) => setEditedLead({...editedLead, origen: e.target.value as any})} style={{ padding: '4px', width: '100%', borderRadius: '4px', border: '1px solid var(--color-outline)' }}>
                    {Object.entries(LEAD_ORIGEN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                ) : (
                  <span>{LEAD_ORIGEN_LABELS[lead.origen]}</span>
                )}
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Clasificación</span>
                {isEditing ? (
                  <select value={editedLead.tipo_lead} onChange={(e) => setEditedLead({...editedLead, tipo_lead: e.target.value as any})} style={{ padding: '4px', width: '100%', borderRadius: '4px', border: '1px solid var(--color-outline)' }}>
                    {Object.entries(LEAD_TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                ) : (
                  <span style={{ textTransform: 'capitalize' }}>{LEAD_TIPO_LABELS[lead.tipo_lead] || lead.tipo_lead}</span>
                )}
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Agente</span>
                {isEditing ? (
                  <select value={editedLead.agente_asignado || ''} onChange={(e) => setEditedLead({...editedLead, agente_asignado: e.target.value})} style={{ padding: '4px', width: '100%', borderRadius: '4px', border: '1px solid var(--color-outline)' }}>
                    <option value="">Sin asignar</option>
                    {users.filter(u => u.rol === 'agente' || u.rol === 'admin').map(u => (
                      <option key={u.id} value={u.id}>{u.nombre} {u.apellidos}</option>
                    ))}
                  </select>
                ) : (
                  <span>{agent ? `${agent.nombre} ${agent.apellidos.split(' ')[0]}` : 'Sin asignar'}</span>
                )}
              </div>
              <div className={styles.dataItem}>
                <span className="text-label text-muted">Creado</span>
                <span>{formatDate(lead.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Checklist Documental SaaS Unificado */}
          <LeadDocumentChecklist lead={lead} />

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
                  {isEditing ? (
                    <input type="text" value={editedLead.zona_interes || ''} onChange={(e) => setEditedLead({...editedLead, zona_interes: e.target.value})} style={{ padding: '4px', width: '100%', borderRadius: '4px', border: '1px solid var(--color-outline)' }} />
                  ) : (
                    <span>{lead.zona_interes || '—'}</span>
                  )}
                </div>
                <div className={styles.dataItem}>
                  <span className="text-label text-muted">Presupuesto</span>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input type="number" placeholder="Min" value={editedLead.presupuesto_min || ''} onChange={(e) => setEditedLead({...editedLead, presupuesto_min: Number(e.target.value)})} style={{ padding: '4px', width: '48%', borderRadius: '4px', border: '1px solid var(--color-outline)' }} />
                      <input type="number" placeholder="Max" value={editedLead.presupuesto_max || ''} onChange={(e) => setEditedLead({...editedLead, presupuesto_max: Number(e.target.value)})} style={{ padding: '4px', width: '48%', borderRadius: '4px', border: '1px solid var(--color-outline)' }} />
                    </div>
                  ) : (
                    <span>
                      {lead.presupuesto_min && lead.presupuesto_max
                        ? `${formatCurrency(lead.presupuesto_min)} - ${formatCurrency(lead.presupuesto_max)}`
                        : '—'}
                    </span>
                  )}
                </div>
                <div className={styles.dataItem}>
                  <span className="text-label text-muted">Urgencia</span>
                  {isEditing ? (
                    <select value={editedLead.urgencia || 'media'} onChange={(e) => setEditedLead({...editedLead, urgencia: e.target.value})} style={{ padding: '4px', width: '100%', borderRadius: '4px', border: '1px solid var(--color-outline)' }}>
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  ) : (
                    <span style={{ textTransform: 'capitalize' }}>{lead.urgencia || '—'}</span>
                  )}
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

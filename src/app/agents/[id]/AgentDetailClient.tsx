'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAgents, useAgentActivities, useAgentProperties, useAgentClients, useAgentCommissions, useProperties } from '@/lib/use-data';
import { toUUID } from '@/lib/mock-data';
import {
  AGENT_TYPE_LABELS, AGENT_STATUS_LABELS, AGENT_STATUS_COLORS, AGENT_RELACION_LABELS,
  ACTIVITY_TIPO_LABELS, ACTIVITY_TIPO_ICONS, ACTIVITY_PRIORIDAD_LABELS,
  COMMISSION_TIPO_LABELS, COMMISSION_ESTADO_LABELS, COMMISSION_ESTADO_COLORS,
  ASIGNACION_TIPO_LABELS, CLIENTE_TIPO_LABELS, ACTIVITY_RESULTADO_LABELS,
  formatCurrency, formatDate, formatDateTime,
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

function SortHeader({ label, field, sortField, sortDir, onSort }: {
  label: string; field: string; sortField: string; sortDir: 'asc' | 'desc';
  onSort: (f: string) => void;
}) {
  const active = sortField === field;
  return (
    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => onSort(field)}>
      {label} {active ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </th>
  );
}

export default function AgentDetailClient({ id }: { id: string }) {
  const { data: agents } = useAgents();
  const { data: activities } = useAgentActivities(id);
  const { data: properties } = useAgentProperties(id);
  const { data: clients } = useAgentClients(id);
  const { data: commissions } = useAgentCommissions(id);
  const { data: allProperties } = useProperties();

  const agent = agents.find(a => a.id === id);
  const [activeTab, setActiveTab] = useState<Tab>('resumen');

  // ── Filters: Actividad ──
  const [actSearch, setActSearch] = useState('');
  const [actTipoFilter, setActTipoFilter] = useState('');
  const [actPriFilter, setActPriFilter] = useState('');
  const [actSortField, setActSortField] = useState('fecha');
  const [actSortDir, setActSortDir] = useState<'asc'|'desc'>('desc');

  // ── Filters: Inmuebles ──
  const [propSearch, setPropSearch] = useState('');
  const [propTipoFilter, setPropTipoFilter] = useState('');
  const [propOpFilter, setPropOpFilter] = useState('');
  const [propSortField, setPropSortField] = useState('fecha_asignacion');
  const [propSortDir, setPropSortDir] = useState<'asc'|'desc'>('desc');
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const selectedProperty = selectedPropId ? allProperties.find(p => p.id === selectedPropId || toUUID(p.id) === selectedPropId) : undefined;

  // ── Filters: Clientes ──
  const [cliSearch, setCliSearch] = useState('');
  const [cliTipoFilter, setCliTipoFilter] = useState('');
  const [cliAsignFilter, setCliAsignFilter] = useState('');
  const [cliSortField, setCliSortField] = useState('fecha_asignacion');
  const [cliSortDir, setCliSortDir] = useState<'asc'|'desc'>('desc');

  // ── Filters: Comisiones ──
  const [comSearch, setComSearch] = useState('');
  const [comTipoFilter, setComTipoFilter] = useState('');
  const [comEstadoFilter, setComEstadoFilter] = useState('');
  const [comSortField, setComSortField] = useState('fecha_generacion');
  const [comSortDir, setComSortDir] = useState<'asc'|'desc'>('desc');

  const filteredActivities = useMemo(() => {
    let items = [...activities];
    if (actSearch) {
      const q = actSearch.toLowerCase();
      items = items.filter(a =>
        (a.cliente_nombre || '').toLowerCase().includes(q) ||
        (a.propiedad_titulo || '').toLowerCase().includes(q) ||
        (a.observaciones || '').toLowerCase().includes(q) ||
        (a.proximo_paso || '').toLowerCase().includes(q)
      );
    }
    if (actTipoFilter) items = items.filter(a => a.tipo === actTipoFilter);
    if (actPriFilter) items = items.filter(a => a.prioridad === actPriFilter);
    items.sort((a, b) => {
      const va = actSortField === 'fecha' ? new Date(a.fecha).getTime() : (a.duracion_minutos || 0);
      const vb = actSortField === 'fecha' ? new Date(b.fecha).getTime() : (b.duracion_minutos || 0);
      return actSortDir === 'asc' ? va - vb : vb - va;
    });
    return items;
  }, [activities, actSearch, actTipoFilter, actPriFilter, actSortField, actSortDir]);

  const filteredProperties = useMemo(() => {
    let items = [...properties];
    if (propSearch) {
      const q = propSearch.toLowerCase();
      items = items.filter(p =>
        (p.property_titulo || '').toLowerCase().includes(q) ||
        (p.property_zona || '').toLowerCase().includes(q)
      );
    }
    if (propTipoFilter) items = items.filter(p => p.tipo_asignacion === propTipoFilter);
    if (propOpFilter) items = items.filter(p => p.property_operacion === propOpFilter);
    items.sort((a, b) => {
      const dir = propSortDir === 'asc' ? 1 : -1;
      switch (propSortField) {
        case 'property_precio': return dir * ((a.property_precio || 0) - (b.property_precio || 0));
        case 'fecha_asignacion': return dir * (new Date(a.fecha_asignacion).getTime() - new Date(b.fecha_asignacion).getTime());
        case 'property_zona': return dir * ((a.property_zona || '').localeCompare(b.property_zona || ''));
        case 'property_operacion': return dir * ((a.property_operacion || '').localeCompare(b.property_operacion || ''));
        case 'tipo_asignacion': return dir * ((a.tipo_asignacion || '').localeCompare(b.tipo_asignacion || ''));
        case 'porcentaje_comision': return dir * ((a.porcentaje_comision || 0) - (b.porcentaje_comision || 0));
        default: return dir * (a.property_titulo || '').localeCompare(b.property_titulo || '');
      }
    });
    return items;
  }, [properties, propSearch, propTipoFilter, propOpFilter, propSortField, propSortDir]);

  const filteredClients = useMemo(() => {
    let items = [...clients];
    if (cliSearch) {
      const q = cliSearch.toLowerCase();
      items = items.filter(c =>
        (c.cliente_nombre || '').toLowerCase().includes(q) ||
        (c.cliente_apellidos || '').toLowerCase().includes(q) ||
        (c.cliente_email || '').toLowerCase().includes(q)
      );
    }
    if (cliTipoFilter) items = items.filter(c => c.tipo_cliente === cliTipoFilter);
    if (cliAsignFilter) items = items.filter(c => c.tipo_asignacion === cliAsignFilter);
    items.sort((a, b) => {
      const va = cliSortField === 'cliente_nombre'
        ? `${a.cliente_nombre} ${a.cliente_apellidos}`.toLowerCase()
        : new Date(a.fecha_asignacion).getTime();
      const vb = cliSortField === 'cliente_nombre'
        ? `${b.cliente_nombre} ${b.cliente_apellidos}`.toLowerCase()
        : new Date(b.fecha_asignacion).getTime();
      if (typeof va === 'string') return cliSortDir === 'asc' ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return cliSortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return items;
  }, [clients, cliSearch, cliTipoFilter, cliAsignFilter, cliSortField, cliSortDir]);

  const filteredCommissions = useMemo(() => {
    let items = [...commissions];
    if (comSearch) {
      const q = comSearch.toLowerCase();
      items = items.filter(c => c.concepto.toLowerCase().includes(q));
    }
    if (comTipoFilter) items = items.filter(c => c.tipo_comision === comTipoFilter);
    if (comEstadoFilter) items = items.filter(c => c.estado === comEstadoFilter);
    items.sort((a, b) => {
      const va = comSortField === 'importe' ? a.importe : new Date(a.fecha_generacion).getTime();
      const vb = comSortField === 'importe' ? b.importe : new Date(b.fecha_generacion).getTime();
      return comSortDir === 'asc' ? va - vb : vb - va;
    });
    return items;
  }, [commissions, comSearch, comTipoFilter, comEstadoFilter, comSortField, comSortDir]);

  function toggleSort(field: string, curField: string, curDir: 'asc'|'desc', setter: (f: string) => void, dirSetter: (d: 'asc'|'desc') => void) {
    if (curField === field) {
      dirSetter(curDir === 'asc' ? 'desc' : 'asc');
    } else {
      setter(field);
      dirSetter('desc');
    }
  }

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
          <Link href={`/agents/${id}/edit`} className="btn btn--outline btn--sm">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span> Editar
          </Link>
          <a href={`tel:${agent.telefono}`} className="btn btn--outline btn--sm">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>phone</span> Llamar
          </a>
        </div>
      </header>

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

      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button key={tab.key} className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab.key)}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

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
                <dt>Último acceso</dt><dd>{agent.ultimo_acceso ? formatDate(agent.ultimo_acceso) : '—'}</dd>
                <dt>2FA</dt><dd>{agent.autenticacion_2fa ? 'Activado' : 'No'}</dd>
                <dt>Nivel comercial</dt><dd>{'⭐'.repeat(agent.nivel_comercial || 0)}</dd>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'actividad' && (
          <div className="card">
            <div className={styles.filterBar}>
              <input className={styles.searchInput} placeholder="Buscar por cliente, inmueble, nota..." value={actSearch} onChange={e => setActSearch(e.target.value)} />
              <select className={styles.filterSelect} value={actTipoFilter} onChange={e => setActTipoFilter(e.target.value)}>
                <option value="">Todos los tipos</option>
                {Object.entries(ACTIVITY_TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select className={styles.filterSelect} value={actPriFilter} onChange={e => setActPriFilter(e.target.value)}>
                <option value="">Todas prioridades</option>
                {Object.entries(ACTIVITY_PRIORIDAD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button className={styles.sortBtn} onClick={() => toggleSort('fecha', actSortField, actSortDir, setActSortField, setActSortDir)}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                {actSortField === 'fecha' ? (actSortDir === 'desc' ? 'Más reciente' : 'Más antiguo') : 'Fecha'}
              </button>
              <span className={styles.resultsCount}>{filteredActivities.length} resultados</span>
            </div>

            {filteredActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '1rem', opacity: 0.5 }}>timeline</span>
                <p>Sin actividad registrada</p>
              </div>
            ) : (
              <div className={styles.activityList}>
                {filteredActivities.map(act => (
                  <div key={act.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <span className="material-symbols-outlined">{ACTIVITY_TIPO_ICONS[act.tipo] || 'circle'}</span>
                    </div>
                    <div className={styles.activityBody}>
                      <div className={styles.activityHeader}>
                        <span className={`badge badge--${act.prioridad === 'urgente' ? 'error' : act.prioridad === 'alta' ? 'warning' : 'info'}`}>
                          {ACTIVITY_TIPO_LABELS[act.tipo]}
                        </span>
                        <span className="text-helper text-muted">{formatDateTime(act.fecha)}</span>
                        {act.duracion_minutos && <span className="text-helper text-muted">{act.duracion_minutos} min</span>}
                      </div>
                      {act.cliente_nombre && <p className={styles.activityText}><strong>Cliente:</strong> {act.cliente_nombre}</p>}
                      {act.propiedad_titulo && <p className={styles.activityText}><strong>Inmueble:</strong> {act.propiedad_titulo}</p>}
                      {act.observaciones && <p className={styles.activityText}>{act.observaciones}</p>}
                      {act.resultado && (
                        <span className="badge badge--neutral">{ACTIVITY_RESULTADO_LABELS[act.resultado] || act.resultado}</span>
                      )}
                      {act.proximo_paso && (
                        <div className={styles.activityNextStep}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                          {act.proximo_paso}
                          {act.fecha_proximo_seguimiento && <span className="text-helper text-muted"> ({formatDate(act.fecha_proximo_seguimiento)})</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'inmuebles' && (
          <div className="card">
            <div className={styles.filterBar}>
              <input className={styles.searchInput} placeholder="Buscar por título o zona..." value={propSearch} onChange={e => setPropSearch(e.target.value)} />
              <select className={styles.filterSelect} value={propTipoFilter} onChange={e => setPropTipoFilter(e.target.value)}>
                <option value="">Todos los roles</option>
                {Object.entries(ASIGNACION_TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select className={styles.filterSelect} value={propOpFilter} onChange={e => setPropOpFilter(e.target.value)}>
                <option value="">Todas ops.</option>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
              <span className={styles.resultsCount}>{filteredProperties.length} resultados</span>
            </div>
            {filteredProperties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '1rem', opacity: 0.5 }}>domain</span>
                <p>Sin inmuebles asignados</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                <div className="table-wrap" style={{ flex: selectedPropId ? '0 0 60%' : '1', minWidth: 0, transition: 'flex 0.2s' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ width: '32px' }}></th>
                        <SortHeader label="Inmueble" field="property_titulo" sortField={propSortField} sortDir={propSortDir} onSort={(f) => toggleSort(f, propSortField, propSortDir, setPropSortField, setPropSortDir)} />
                        <SortHeader label="Zona" field="property_zona" sortField={propSortField} sortDir={propSortDir} onSort={(f) => toggleSort(f, propSortField, propSortDir, setPropSortField, setPropSortDir)} />
                        <SortHeader label="Precio" field="property_precio" sortField={propSortField} sortDir={propSortDir} onSort={(f) => toggleSort(f, propSortField, propSortDir, setPropSortField, setPropSortDir)} />
                        <SortHeader label="Operación" field="property_operacion" sortField={propSortField} sortDir={propSortDir} onSort={(f) => toggleSort(f, propSortField, propSortDir, setPropSortField, setPropSortDir)} />
                        <SortHeader label="Rol" field="tipo_asignacion" sortField={propSortField} sortDir={propSortDir} onSort={(f) => toggleSort(f, propSortField, propSortDir, setPropSortField, setPropSortDir)} />
                        <SortHeader label="Comisión" field="porcentaje_comision" sortField={propSortField} sortDir={propSortDir} onSort={(f) => toggleSort(f, propSortField, propSortDir, setPropSortField, setPropSortDir)} />
                        <SortHeader label="Asignado" field="fecha_asignacion" sortField={propSortField} sortDir={propSortDir} onSort={(f) => toggleSort(f, propSortField, propSortDir, setPropSortField, setPropSortDir)} />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProperties.map(p => {
                        const isSelected = selectedPropId === p.property_id;
                        return (
                          <tr key={p.id} onClick={() => setSelectedPropId(isSelected ? null : p.property_id)} style={{ cursor: 'pointer' }}>
                            <td style={{ textAlign: 'center' }}>
                              {isSelected && <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#22c55e', verticalAlign: 'middle' }}>check_circle</span>}
                            </td>
                            <td className="link">{p.property_titulo}</td>
                            <td>{p.property_zona || '—'}</td>
                            <td>{p.property_precio ? formatCurrency(p.property_precio) : '—'}</td>
                            <td><span className="capitalize">{p.property_operacion || '—'}</span></td>
                            <td><span className="badge badge--info">{ASIGNACION_TIPO_LABELS[p.tipo_asignacion]}</span></td>
                            <td>{p.porcentaje_comision ? `${p.porcentaje_comision}%` : '—'}</td>
                            <td className="text-helper text-muted">{formatDate(p.fecha_asignacion)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {selectedPropId && selectedProperty && (
                  <div style={{ flex: '0 0 calc(40% - var(--space-md))', minWidth: 0, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'sticky', top: 'var(--space-md)' }}>
                    <div style={{ height: '160px', background: 'linear-gradient(135deg, var(--color-surface-hover) 0%, var(--color-bg-base) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {selectedProperty.fotos && selectedProperty.fotos.length > 0 ? (
                        <img src={selectedProperty.fotos[0]} alt={selectedProperty.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-text-tertiary)', opacity: 0.5 }}>real_estate_agent</span>
                      )}
                      <button onClick={() => setSelectedPropId(null)} style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✕</button>
                      <div style={{ position: 'absolute', bottom: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>{selectedProperty.operacion}</span>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: selectedProperty.estado === 'disponible' ? 'rgba(64, 239, 183, 0.2)' : 'rgba(255,255,255,0.1)', color: selectedProperty.estado === 'disponible' ? 'var(--color-secondary)' : 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)' }}>{selectedProperty.estado.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(selectedProperty.precio)}{selectedProperty.operacion === 'alquiler' && <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>/mes</span>}</div>
                      <h3 style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>{selectedProperty.titulo}</h3>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                        {selectedProperty.zona}, {selectedProperty.ciudad}
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--color-border)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>straighten</span>{selectedProperty.superficie} m²</span>
                        {selectedProperty.habitaciones && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bed</span>{selectedProperty.habitaciones}</span>}
                        {selectedProperty.banos && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>shower</span>{selectedProperty.banos}</span>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-tertiary)', paddingTop: 'var(--space-xs)' }}>
                        <span>Ref: {selectedProperty.referencia}</span>
                        <span>Alta: {formatDate(selectedProperty.fecha_alta)}</span>
                      </div>
                      <Link href={`/properties/${toUUID(selectedProperty.id) || selectedProperty.id}`} className="btn btn--primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-sm)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
                        Ver ficha completa
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="card">
            <div className={styles.filterBar}>
              <input className={styles.searchInput} placeholder="Buscar por nombre, email..." value={cliSearch} onChange={e => setCliSearch(e.target.value)} />
              <select className={styles.filterSelect} value={cliTipoFilter} onChange={e => setCliTipoFilter(e.target.value)}>
                <option value="">Todos los tipos</option>
                {Object.entries(CLIENTE_TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select className={styles.filterSelect} value={cliAsignFilter} onChange={e => setCliAsignFilter(e.target.value)}>
                <option value="">Todas asignaciones</option>
                <option value="principal">Principal</option>
                <option value="colaborador">Colaborador</option>
              </select>
              <span className={styles.resultsCount}>{filteredClients.length} resultados</span>
            </div>
            {filteredClients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '1rem', opacity: 0.5 }}>group</span>
                <p>Sin clientes asignados</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <SortHeader label="Cliente" field="cliente_nombre" sortField={cliSortField} sortDir={cliSortDir} onSort={(f) => toggleSort(f, cliSortField, cliSortDir, setCliSortField, setCliSortDir)} />
                      <th>Tipo</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <SortHeader label="Desde" field="fecha_asignacion" sortField={cliSortField} sortDir={cliSortDir} onSort={(f) => toggleSort(f, cliSortField, cliSortDir, setCliSortField, setCliSortDir)} />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.cliente_nombre} {c.cliente_apellidos || ''}</strong></td>
                        <td><span className={`badge badge--${c.tipo_cliente === 'comprador' ? 'warning' : c.tipo_cliente === 'vendedor' ? 'success' : c.tipo_cliente === 'inversor' ? 'primary' : 'neutral'}`}>
                          {CLIENTE_TIPO_LABELS[c.tipo_cliente] || c.tipo_cliente}
                        </span></td>
                        <td>{c.cliente_telefono || '—'}</td>
                        <td>{c.cliente_email || '—'}</td>
                        <td><span className="badge badge--info">{c.tipo_asignacion === 'principal' ? 'Principal' : 'Colaborador'}</span></td>
                        <td className="text-helper text-muted">{formatDate(c.fecha_asignacion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comisiones' && (
          <div>
            {filteredCommissions.length > 0 && (
              <div className={styles.miniKpiRow} style={{ marginBottom: 'var(--space-md)' }}>
                <div className={styles.miniKpi}>
                  <span className={styles.miniKpiValue}>{formatCurrency(filteredCommissions.reduce((s, c) => s + c.importe, 0))}</span>
                  <span className={styles.miniKpiLabel}>Total</span>
                </div>
                <div className={styles.miniKpi}>
                  <span className={styles.miniKpiValue}>{formatCurrency(filteredCommissions.filter(c => c.estado === 'liquidada' || c.estado === 'aprobada').reduce((s, c) => s + c.importe, 0))}</span>
                  <span className={styles.miniKpiLabel}>Liquidado/Aprobado</span>
                </div>
                <div className={styles.miniKpi}>
                  <span className={styles.miniKpiValue}>{formatCurrency(filteredCommissions.filter(c => c.estado === 'pendiente' || c.estado === 'calculada' || c.estado === 'validada').reduce((s, c) => s + c.importe, 0))}</span>
                  <span className={styles.miniKpiLabel}>Pendiente</span>
                </div>
              </div>
            )}
            <div className="card">
              <div className={styles.filterBar}>
                <input className={styles.searchInput} placeholder="Buscar por concepto..." value={comSearch} onChange={e => setComSearch(e.target.value)} />
                <select className={styles.filterSelect} value={comTipoFilter} onChange={e => setComTipoFilter(e.target.value)}>
                  <option value="">Todos los tipos</option>
                  {Object.entries(COMMISSION_TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select className={styles.filterSelect} value={comEstadoFilter} onChange={e => setComEstadoFilter(e.target.value)}>
                  <option value="">Todos los estados</option>
                  {Object.entries(COMMISSION_ESTADO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button className={styles.sortBtn} onClick={() => toggleSort('importe', comSortField, comSortDir, setComSortField, setComSortDir)}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>euro</span>
                  Importe
                </button>
                <span className={styles.resultsCount}>{filteredCommissions.length} resultados</span>
              </div>
              {filteredCommissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '1rem', opacity: 0.5 }}>payments</span>
                  <p>Sin comisiones registradas</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Concepto</th>
                        <th>Tipo</th>
                        <th>Base</th>
                        <th>%</th>
                        <SortHeader label="Importe" field="importe" sortField={comSortField} sortDir={comSortDir} onSort={(f) => toggleSort(f, comSortField, comSortDir, setComSortField, setComSortDir)} />
                        <th>Estado</th>
                        <SortHeader label="Fecha" field="fecha_generacion" sortField={comSortField} sortDir={comSortDir} onSort={(f) => toggleSort(f, comSortField, comSortDir, setComSortField, setComSortDir)} />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCommissions.map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.concepto}</strong></td>
                          <td><span className="badge badge--neutral">{COMMISSION_TIPO_LABELS[c.tipo_comision]}</span></td>
                          <td>{formatCurrency(c.base_calculo)}</td>
                          <td>{c.porcentaje}%</td>
                          <td><strong style={{ color: 'var(--color-primary)' }}>{formatCurrency(c.importe)}</strong></td>
                          <td><span className={`badge badge--${COMMISSION_ESTADO_COLORS[c.estado]}`}>{COMMISSION_ESTADO_LABELS[c.estado]}</span></td>
                          <td className="text-helper text-muted">{formatDate(c.fecha_generacion)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documentos' && (
          <div className="card">
            <div className={styles.filterBar}>
              <input className={styles.searchInput} placeholder="Buscar documentos..." />
              <span className={styles.resultsCount}>Próximamente</span>
            </div>
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-tertiary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '64px', marginBottom: '1rem', opacity: 0.3 }}>folder_open</span>
              <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Gestión documental del agente</p>
              <p className="text-helper text-muted">
                Sube y gestiona DNI, contratos, certificados, formación y documentación del agente.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                {['DNI/NIE', 'Contrato', 'Seguro RC', 'Certificados', 'Formación', 'API'].map(t => (
                  <span key={t} className="badge badge--neutral" style={{ cursor: 'pointer' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

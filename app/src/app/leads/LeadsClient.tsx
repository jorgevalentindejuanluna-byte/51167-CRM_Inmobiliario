'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLeads, useUsers } from '@/lib/use-data';
import { useAuth } from '@/lib/auth-context';
import { updateLead } from '@/app/actions/leads';
import { logAudit } from '@/app/actions/audit';

import {
  LEAD_ESTADO_LABELS,
  LEAD_ESTADO_COLORS,
  LEAD_TEMP_LABELS,
  LEAD_TIPO_LABELS,
  LEAD_TIPO_COLORS,
} from '@/lib/constants';
import type { Lead, LeadEstado, LeadTemperatura, LeadTipo } from '@/lib/models/types';
import styles from './page.module.css';

function scoreBgStyle(score: number): React.CSSProperties {
  const intensity = Math.min(score / 100, 1);
  const r = Math.round(242 - (242 - 64) * intensity);
  const g = Math.round(190 - (190 - 239) * intensity);
  const b = Math.round(140 - (140 - 183) * intensity);
  return {
    background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.12), rgba(${r}, ${g}, ${b}, 0.04))`,
    borderColor: `rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.2})`,
  };
}

function scoreLabel(score: number): string {
  if (score >= 90) return 'scoreExtreme';
  if (score >= 80) return 'scoreHigh';
  if (score >= 70) return 'scoreMedium';
  return 'scoreLow';
}

export function LeadsClient() {
  const { data: leads, source } = useLeads();
  const { data: users } = useUsers();
  const { user } = useAuth();

  const [filterEstado, setFilterEstado] = useState<LeadEstado | ''>('');
  const [filterTemp, setFilterTemp] = useState<LeadTemperatura | ''>('');
  const [filterTipo, setFilterTipo] = useState<LeadTipo | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  const [localLeads, setLocalLeads] = useState<Lead[]>([]);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);

  useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return localLeads.filter((lead) => {
      if (filterEstado && lead.estado !== filterEstado) return false;
      if (filterTemp && lead.temperatura !== filterTemp) return false;
      if (filterTipo && lead.tipo_lead !== filterTipo) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const fullName = `${lead.nombre} ${lead.apellidos}`.toLowerCase();
        return (
          fullName.includes(q) ||
          lead.email?.toLowerCase().includes(q) ||
          lead.telefono?.includes(q)
        );
      }
      return true;
    }).sort((a, b) => b.score - a.score);
  }, [localLeads, filterEstado, filterTemp, filterTipo, searchQuery]);

  const aiPriorityLeads = localLeads.filter(
    (l) => l.temperatura === 'caliente' && l.score >= 75
  ).slice(0, 3);

  const stats = useMemo(() => {
    const total = localLeads.length;
    const calientes = localLeads.filter(l => l.temperatura === 'caliente').length;
    const tibios = localLeads.filter(l => l.temperatura === 'tibio').length;
    const frios = localLeads.filter(l => l.temperatura === 'frio').length;
    const nuevos = localLeads.filter(l => l.estado === 'nuevo').length;
    return { total, calientes, tibios, frios, nuevos };
  }, [localLeads]);

  const getAgentName = (agentId?: string) => {
    if (!agentId) return '—';
    const agent = users.find((u) => u.id === agentId);
    return agent ? `${agent.nombre} ${agent.apellidos.split(' ')[0]}` : '—';
  };

  const setFilter = (temp: LeadTemperatura) => {
    setFilterTemp(prev => prev === temp ? '' : temp);
  };

  const changeStatus = useCallback(async (leadId: string, newStatus: LeadEstado, leadName: string) => {
    const previous = localLeads.find(l => l.id === leadId);
    setLocalLeads(prev => prev.map(l => l.id === leadId ? { ...l, estado: newStatus } : l));
    setStatusDropdown(null);

    await updateLead(leadId, { estado: newStatus });

    if (user) {
      logAudit({
        agency_id: user.agency_id,
        user_id: user.id,
        user_name: `${user.nombre} ${user.apellidos}`,
        accion: 'cambio_estado',
        entidad: 'lead',
        entidad_id: leadId,
        detalle: {
          campo: 'estado',
          valor_anterior: previous?.estado || '',
          valor_nuevo: newStatus,
          lead_nombre: leadName,
        },
      });
    }
  }, [localLeads, user]);

  const logAction = useCallback((leadId: string, accion: string, leadName: string) => {
    if (!user) return;
    logAudit({
      agency_id: user.agency_id,
      user_id: user.id,
      user_name: `${user.nombre} ${user.apellidos}`,
      accion,
      entidad: 'lead',
      entidad_id: leadId,
      detalle: { lead_nombre: leadName },
    });
  }, [user]);

  useEffect(() => {
    const handleClickOutside = () => setStatusDropdown(null);
    if (statusDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [statusDropdown]);

  const STATUS_OPTIONS: LeadEstado[] = ['nuevo', 'contactado', 'calificado', 'no_cualificado', 'busqueda_activa', 'perdido'];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className="text-headline">Portfolio de Leads</h1>
          <p className="text-helper text-muted">
            Gestiona y prioriza tus prospectos de alto valor.
            {source === 'supabase' && <span className="badge badge--success" style={{marginLeft:'8px',fontSize:'10px'}}>LIVE</span>}
          </p>
        </div>
        <Link href="/leads/new" className="btn btn--primary" id="btn-new-lead">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
          Nuevo Lead
        </Link>
      </header>

      <div className={styles.statsRow}>
        <button className={styles.statCard} onClick={() => setFilter('caliente')} data-accent="caliente" data-active={filterTemp === 'caliente' ? '' : undefined}>
          <span className={styles.statValue}>{stats.calientes}</span>
          <span className={styles.statLabel}>Calientes</span>
        </button>
        <button className={styles.statCard} onClick={() => setFilter('tibio')} data-accent="tibio" data-active={filterTemp === 'tibio' ? '' : undefined}>
          <span className={styles.statValue}>{stats.tibios}</span>
          <span className={styles.statLabel}>Tibios</span>
        </button>
        <button className={styles.statCard} onClick={() => setFilter('frio')} data-accent="frio" data-active={filterTemp === 'frio' ? '' : undefined}>
          <span className={styles.statValue}>{stats.frios}</span>
          <span className={styles.statLabel}>Fr&iacute;os</span>
        </button>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.nuevos}</span>
          <span className={styles.statLabel}>Nuevos</span>
        </div>
        <div className={`${styles.statCard} ${filterTemp ? styles.statCardTotalActive : ''}`}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>
            {filterTemp ? (
              <>
                Filtro: {LEAD_TEMP_LABELS[filterTemp]}
                <button className={styles.clearFilterBtn} onClick={() => setFilterTemp('')} title="Eliminar filtro">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                </button>
              </>
            ) : 'Total'}
          </span>
        </div>
      </div>

      {aiPriorityLeads.length > 0 && (
        <section className={styles.aiSection}>
          <header className={styles.aiHeader}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '20px' }}>psychology</span>
            <div>
              <span className={styles.aiTitle}>Prioridad IA</span>
              <span className={styles.aiSubtitle}>&middot; {aiPriorityLeads.length} para contacto inmediato</span>
            </div>
          </header>
          <div className={styles.aiCards}>
            {aiPriorityLeads.map((lead) => (
              <article key={lead.id} className={styles.aiCard} style={scoreBgStyle(lead.score)} data-score={scoreLabel(lead.score)}>
                <Link href={`/leads/${lead.id}`} className={styles.aiCardBody}>
                  <div className="avatar avatar--sm">{lead.nombre[0]}{lead.apellidos[0]}</div>
                  <div className={styles.aiCardInfo}>
                    <strong>{lead.nombre} {lead.apellidos}</strong>
                    <span className="text-helper text-muted">{lead.zona_interes} &middot; {lead.proxima_accion}</span>
                  </div>
                  <div className={styles.scorePill} data-score={lead.score >= 80 ? 'high' : 'medium'}>
                    {lead.score}
                  </div>
                </Link>
                <div className={styles.aiCardActions}>
                  <button className="btn btn--icon btn--ghost" title="WhatsApp" onClick={(e) => { e.preventDefault(); logAction(lead.id, 'click_whatsapp', `${lead.nombre} ${lead.apellidos}`); }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chat</span>
                  </button>
                  <button className="btn btn--icon btn--ghost" title="Llamar" onClick={(e) => { e.preventDefault(); logAction(lead.id, 'click_llamada', `${lead.nombre} ${lead.apellidos}`); }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>phone</span>
                  </button>
                  <button className="btn btn--icon btn--ghost" title="Email" onClick={(e) => { e.preventDefault(); logAction(lead.id, 'click_email', `${lead.nombre} ${lead.apellidos}`); }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mail</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-outline)' }}>search</span>
          <input
            type="text"
            placeholder="Buscar por nombre, email o tel&eacute;fono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            id="leads-search"
          />
          {searchQuery && (
            <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
          )}
        </div>
        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as LeadEstado | '')}
            id="filter-estado"
          >
            <option value="">Estado</option>
            {Object.entries(LEAD_ESTADO_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value as LeadTipo | '')}
            id="filter-tipo"
          >
            <option value="">Tipo</option>
            {Object.entries(LEAD_TIPO_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          {(filterEstado || filterTemp || filterTipo || searchQuery) && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setFilterEstado('');
                setFilterTemp('');
                setFilterTipo('');
                setSearchQuery('');
              }}
              id="btn-clear-filters"
              title="Limpiar filtros"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Tipo</th>
                <th>Temp.</th>
                <th>Score</th>
                <th>Estado</th>
                <th>Agente</th>
                <th>Pr&oacute;xima acci&oacute;n</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => {
                const isPriority = lead.temperatura === 'caliente' && lead.score >= 75;
                return (
                  <tr key={lead.id} className={`animate-fade-in ${isPriority ? styles.priorityRow : ''}`} style={{ animationDelay: `${index * 30}ms` }}>
                    <td>
                      <Link href={`/leads/${lead.id}`} className={styles.leadCell}>
                        <div className={`avatar ${styles.leadAvatar}`}>
                          {isPriority && <span className={styles.priorityDot} />}
                          {lead.nombre[0]}{lead.apellidos[0]}
                        </div>
                        <div>
                          <strong className={styles.leadName}>{lead.nombre} {lead.apellidos}</strong>
                          <span className="text-helper text-muted">{lead.email || lead.telefono}</span>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <span className={styles.tipoBadge} style={{ background: LEAD_TIPO_COLORS[lead.tipo_lead] || '#95a5a6' }}>
                        {LEAD_TIPO_LABELS[lead.tipo_lead]}
                      </span>
                    </td>
                    <td>
                      <span className={styles.tempCell}>
                        {lead.temperatura === 'caliente' && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#e74c3c' }}>local_fire_department</span>}
                        {lead.temperatura === 'tibio' && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#f39c12' }}>wb_cloudy</span>}
                        {lead.temperatura === 'frio' && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3498db' }}>ac_unit</span>}
                        <span>{LEAD_TEMP_LABELS[lead.temperatura]}</span>
                      </span>
                    </td>
                    <td>
                      <div className={styles.scoreCell}>
                        <span className={styles.scoreValue} data-score={lead.score >= 80 ? 'high' : lead.score >= 50 ? 'medium' : 'low'}>
                          {lead.score}
                        </span>
                        <div className="score-bar" style={{ width: '44px' }}>
                          <div
                            className={`score-bar__fill ${lead.score >= 80 ? 'score-bar__fill--high' : lead.score >= 50 ? 'score-bar__fill--medium' : 'score-bar__fill--low'}`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ position: 'relative' }}>
                      <button
                        className={`badge badge--${LEAD_ESTADO_COLORS[lead.estado]}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        onClick={(e) => { e.stopPropagation(); setStatusDropdown(statusDropdown === lead.id ? null : lead.id); }}
                        title="Cambiar estado"
                      >
                        {LEAD_ESTADO_LABELS[lead.estado]}
                        <span className="material-symbols-outlined" style={{ fontSize: '12px', marginLeft: '4px' }}>unfold_more</span>
                      </button>
                      {statusDropdown === lead.id && (
                        <div className={styles.statusDropdown} onClick={(e) => e.stopPropagation()}>
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s}
                              className={`${styles.statusOption} ${s === lead.estado ? styles.statusOptionActive : ''}`}
                              onClick={() => changeStatus(lead.id, s, `${lead.nombre} ${lead.apellidos}`)}
                            >
                              <span className={`badge badge--${LEAD_ESTADO_COLORS[s]}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                {LEAD_ESTADO_LABELS[s]}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="text-helper">{getAgentName(lead.agente_asignado)}</span>
                    </td>
                    <td>
                      <span className={styles.nextAction}>{lead.proxima_accion || '—'}</span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className="btn btn--icon btn--ghost" title="WhatsApp" onClick={() => logAction(lead.id, 'click_whatsapp', `${lead.nombre} ${lead.apellidos}`)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chat</span>
                        </button>
                        <button className="btn btn--icon btn--ghost" title="Llamar" onClick={() => logAction(lead.id, 'click_llamada', `${lead.nombre} ${lead.apellidos}`)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>phone</span>
                        </button>
                        <button className="btn btn--icon btn--ghost" title="Email" onClick={() => logAction(lead.id, 'click_email', `${lead.nombre} ${lead.apellidos}`)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mail</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="empty-state">
            <span className="material-symbols-outlined">person_search</span>
            <p>No se encontraron leads con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useLeads, saveLocalMock } from '@/lib/use-data';
import { useAuth } from '@/lib/auth-context';
import LeadsKanban from '@/components/leads/LeadsKanban';
import { updateLead } from '@/app/actions/leads';
import {
  LEAD_ESTADO_LABELS,
  LEAD_TEMP_LABELS,
  LEAD_TIPO_LABELS,
} from '@/lib/constants';
import type { LeadEstado, LeadTemperatura, LeadTipo } from '@/lib/models/types';
import styles from './page.module.css';

export function LeadsClient() {
  const { token } = useAuth();
  const { data: leads, source } = useLeads();

  const [filterEstado, setFilterEstado] = useState<LeadEstado | ''>('');
  const [filterTemp, setFilterTemp] = useState<LeadTemperatura | ''>('');
  const [filterTipo, setFilterTipo] = useState<LeadTipo | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);

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
    }).sort((a, b) => b.score - a.score); // Ordenar por score IA
  }, [localLeads, filterEstado, filterTemp, filterTipo, searchQuery]);

  // Leads que la IA recomienda contactar inmediatamente
  const aiPriorityLeads = localLeads.filter(
    (l) => l.temperatura === 'caliente' && l.score >= 75
  ).slice(0, 3);

  const handleLeadMoved = async (leadId: string, newEstado: LeadEstado) => {
    // Optimistic Update
    const updated = localLeads.map(l => l.id === leadId ? { ...l, estado: newEstado } : l);
    setLocalLeads(updated);
    saveLocalMock('leads', updated);
    
    // Server Call
    const result = await updateLead(leadId, { estado: newEstado }, token);
    if (!result.success) {
      console.error('Error moviendo lead:', result.error);
      // Revert if error
      setLocalLeads(prev => prev.map(l => l.id === leadId ? { ...l, estado: leads.find(ol => ol.id === leadId)?.estado || newEstado } : l));
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className="text-headline">Portfolio de Leads</h1>
          <p className="text-helper text-muted">
            <span className={styles.totalBadge}>{leads.length} TOTAL</span>
            {source === 'supabase' && <span className="badge badge--success" style={{marginLeft:'8px',fontSize:'10px'}}>LIVE</span>}
            Gestiona y prioriza tus prospectos de alto valor.
          </p>
        </div>
        <Link href="/leads/new" className="btn btn--primary" id="btn-new-lead">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
          Nuevo Lead
        </Link>
      </header>

      {/* Acciones prioritarias IA */}
      <div className={`card ${styles.aiSection}`}>
        <div className={styles.aiHeader}>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>psychology</span>
          <h2 className="text-title">Acciones Prioritarias IA</h2>
          <span className="badge badge--primary">Recomendado para contacto inmediato</span>
        </div>
        <div className={styles.aiCards}>
          {aiPriorityLeads.map((lead) => (
            <div key={lead.id} className={styles.aiCard}>
              <div className={styles.aiCardTop}>
                <div className="avatar">{lead.nombre[0]}{lead.apellidos[0]}</div>
                <div>
                  <strong>{lead.nombre} {lead.apellidos}</strong>
                  <p className="text-helper text-muted">{lead.zona_interes}</p>
                </div>
                <div className={styles.scoreCircle} data-score={lead.score >= 80 ? 'high' : 'medium'}>
                  {lead.score}
                </div>
              </div>
              <p className="text-helper text-muted" style={{ marginTop: '8px' }}>
                {lead.proxima_accion}
              </p>
              <div className={styles.aiCardActions}>
                <button className="btn btn--ghost btn--sm" title="WhatsApp">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chat</span>
                  WhatsApp
                </button>
                <button className="btn btn--ghost btn--sm" title="Llamar">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>phone</span>
                  Llamar
                </button>
                <button className="btn btn--ghost btn--sm" title="Email">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mail</span>
                  Email
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-outline)' }}>search</span>
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            id="leads-search"
          />
        </div>
        <div className={styles.filterChips}>
          <select
            className="input"
            style={{ padding: '6px 12px', fontSize: '13px', minWidth: '140px', background: 'var(--color-surface-high)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)' }}
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as LeadEstado | '')}
            id="filter-estado"
          >
            <option value="">Todos los estados</option>
            {Object.entries(LEAD_ESTADO_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            className="input"
            style={{ padding: '6px 12px', fontSize: '13px', minWidth: '130px', background: 'var(--color-surface-high)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)' }}
            value={filterTemp}
            onChange={(e) => setFilterTemp(e.target.value as LeadTemperatura | '')}
            id="filter-temperatura"
          >
            <option value="">Temperatura</option>
            {Object.entries(LEAD_TEMP_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            className="input"
            style={{ padding: '6px 12px', fontSize: '13px', minWidth: '120px', background: 'var(--color-surface-high)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)' }}
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
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              Limpiar
            </button>
          )}
        </div>

      </div>

      <div style={{ marginTop: '1rem' }}>
        <LeadsKanban leads={filteredLeads} onLeadMoved={handleLeadMoved} />
      </div>

      {filteredLeads.length === 0 && (
        <div className="empty-state">
          <span className="material-symbols-outlined">person_search</span>
          <p>No se encontraron leads con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}

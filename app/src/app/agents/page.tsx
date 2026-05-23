'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAgents } from '@/lib/use-data';
import {
  AGENT_TYPE_LABELS,
  AGENT_STATUS_LABELS,
  AGENT_STATUS_COLORS,
  AGENT_RELACION_LABELS,
  formatCurrency,
} from '@/lib/constants';
import type { AgentType, AgentStatus } from '@/lib/models/types';
import styles from './page.module.css';

export default function AgentsPage() {
  const { data: agents, loading } = useAgents();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState<AgentType | ''>('');
  const [filterEstado, setFilterEstado] = useState<AgentStatus | ''>('');
  const [filterOficina, setFilterOficina] = useState<string>('');

  const oficinas = useMemo(() => {
    const set = new Set<string>();
    agents.forEach(a => { if (a.oficina) set.add(a.oficina); });
    return Array.from(set).sort();
  }, [agents]);

  const filteredAgents = useMemo(() => {
    return agents.filter(a => {
      if (filterTipo && a.tipo_agente !== filterTipo) return false;
      if (filterEstado && a.estado !== filterEstado) return false;
      if (filterOficina && a.oficina !== filterOficina) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const fullName = `${a.nombre} ${a.apellidos}`.toLowerCase();
        return fullName.includes(q) || a.email.toLowerCase().includes(q) || a.telefono.includes(q);
      }
      return true;
    });
  }, [agents, filterTipo, filterEstado, filterOficina, searchQuery]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className="text-headline">Gestión de Agentes</h1>
          <p className="text-helper text-muted">
            <span className={styles.totalBadge}>{agents.length} AGENTES</span>
            Administra tu equipo comercial inmobiliario.
          </p>
        </div>
        <Link href="/agents/new" className="btn btn--primary" id="btn-new-agent">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
          Nuevo Agente
        </Link>
      </header>

      {/* KPIs */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>{agents.filter(a => a.estado === 'activo').length}</span>
          <span className={styles.kpiLabel}>Activos</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>{agents.filter(a => a.estado === 'en_formacion').length}</span>
          <span className={styles.kpiLabel}>En Formación</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>{agents.reduce((s, a) => s + a.operaciones_abiertas, 0)}</span>
          <span className={styles.kpiLabel}>Ops. Abiertas</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>{formatCurrency(agents.reduce((s, a) => s + a.comision_generada, 0))}</span>
          <span className={styles.kpiLabel}>Comisiones Generadas</span>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-outline)' }}>search</span>
          <input type="text" placeholder="Buscar agente..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={styles.searchInput} />
        </div>
        <select className={styles.filterSelect} value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as AgentType | '')}>
          <option value="">Todos los tipos</option>
          {Object.entries(AGENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className={styles.filterSelect} value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as AgentStatus | '')}>
          <option value="">Todos los estados</option>
          {Object.entries(AGENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className={styles.filterSelect} value={filterOficina} onChange={(e) => setFilterOficina(e.target.value)}>
          <option value="">Todas las oficinas</option>
          {oficinas.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {(filterTipo || filterEstado || filterOficina || searchQuery) && (
          <button className="btn btn--ghost btn--sm" onClick={() => { setFilterTipo(''); setFilterEstado(''); setFilterOficina(''); setSearchQuery(''); }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span> Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Agente</th>
              <th>Tipo</th>
              <th>Oficina</th>
              <th>Estado</th>
              <th>Asignados</th>
              <th>Ops.</th>
              <th>Comisiones</th>
              <th>Objetivo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.map((agent) => (
              <tr key={agent.id} className="animate-fade-in">
                <td>
                  <Link href={`/agents/${agent.id}`} className={styles.agentCell}>
                    <div className="avatar">{agent.nombre[0]}{agent.apellidos[0]}</div>
                    <div>
                      <strong>{agent.nombre} {agent.apellidos}</strong>
                      <span className="text-helper text-muted">{agent.email}</span>
                    </div>
                  </Link>
                </td>
                <td><span className="badge badge--neutral">{AGENT_TYPE_LABELS[agent.tipo_agente]}</span></td>
                <td><span className="text-helper">{agent.oficina || '—'}</span></td>
                <td><span className={`badge badge--${AGENT_STATUS_COLORS[agent.estado]}`}>{AGENT_STATUS_LABELS[agent.estado]}</span></td>
                <td><span className="text-helper">{agent.inmuebles_asignados} / {agent.clientes_asignados}</span></td>
                <td><span className="text-helper">{agent.operaciones_abiertas}</span></td>
                <td><span className="text-helper" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{formatCurrency(agent.comision_generada)}</span></td>
                <td>
                  <div className={styles.objCell}>
                    <span>{(agent.cumplimiento_objetivo || 0)}%</span>
                    <div className="score-bar" style={{ width: '50px' }}>
                      <div className={`score-bar__fill ${(agent.cumplimiento_objetivo || 0) >= 70 ? 'score-bar__fill--high' : (agent.cumplimiento_objetivo || 0) >= 40 ? 'score-bar__fill--medium' : 'score-bar__fill--low'}`}
                        style={{ width: `${(agent.cumplimiento_objetivo || 0)}%` }} />
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <Link href={`/agents/${agent.id}`} className="btn btn--icon btn--ghost" title="Ver ficha">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
                    </Link>
                    <button className="btn btn--icon btn--ghost" title="Llamar">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>phone</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAgents.length === 0 && (
        <div className="empty-state">
          <span className="material-symbols-outlined">badge</span>
          <p>No se encontraron agentes con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}

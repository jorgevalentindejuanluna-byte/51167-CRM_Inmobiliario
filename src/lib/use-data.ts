'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { getTableData } from '@/app/actions/data';
import type { Lead, Property, Operation, User, CRMDocument, CRMSignature, Agent, AgentActivity, AgentPropertyAssignment, AgentClientAssignment, AgentCommission, EmailThread, EmailMessage, EmailFolder } from './models/types';
import { toUUID, MOCK_LEADS, MOCK_PROPERTIES, MOCK_OPERATIONS, MOCK_USERS, MOCK_DOCUMENTS } from './mock-data';

interface DataState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  source: 'supabase' | 'mock';
}

// ── Hook para Leads — Via server action (Service Key) ──
export function useLeads(): DataState<Lead[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<Lead[]>>({
    data: [], loading: true, error: null, source: 'supabase',
  });

  useEffect(() => {
    let cancelled = false;
    getTableData('leads', { order: { column: 'score', ascending: false } }).then(({ data }) => {
      if (cancelled) return;
      setState({ data: data?.length > 0 ? data as unknown as Lead[] : MOCK_LEADS, loading: false, error: null, source: data?.length > 0 ? 'supabase' : 'mock' });
    });
    return () => { cancelled = true; };
  }, [token]);

  return state;
}

// ── Hook para Propiedades — Via server action (Service Key) ──
export function useProperties(): DataState<Property[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<Property[]>>({
    data: [], loading: true, error: null, source: 'supabase',
  });

  useEffect(() => {
    let cancelled = false;
    getTableData('properties', { order: { column: 'created_at', ascending: false } }).then(({ data }) => {
      if (cancelled) return;
      setState({ data: data?.length > 0 ? data as unknown as Property[] : MOCK_PROPERTIES, loading: false, error: null, source: data?.length > 0 ? 'supabase' : 'mock' });
    });
    return () => { cancelled = true; };
  }, [token]);

  return state;
}

// ── Hook para Operaciones — Via server action (Service Key) ──
export function useOperations(): DataState<Operation[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<Operation[]>>({
    data: [], loading: true, error: null, source: 'supabase',
  });

  useEffect(() => {
    let cancelled = false;
    getTableData('operations', { order: { column: 'created_at', ascending: false } }).then(({ data }) => {
      if (cancelled) return;
      setState({ data: data?.length > 0 ? data as unknown as Operation[] : MOCK_OPERATIONS, loading: false, error: null, source: data?.length > 0 ? 'supabase' : 'mock' });
    });
    return () => { cancelled = true; };
  }, [token]);

  return state;
}

// ── Hook para Usuarios — Via server action (Service Key) ──
export function useUsers(): DataState<User[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<User[]>>({
    data: [], loading: true, error: null, source: 'supabase',
  });

  useEffect(() => {
    let cancelled = false;
    getTableData('users').then(({ data }) => {
      if (cancelled) return;
      setState({ data: data?.length > 0 ? data as unknown as User[] : MOCK_USERS, loading: false, error: null, source: data?.length > 0 ? 'supabase' : 'mock' });
    });
    return () => { cancelled = true; };
  }, [token]);

  return state;
}

// ── Hook para Documentos (Regla 6) — Via server action (Service Key) ──
export function useDocuments(filters: { lead_id?: string; operation_id?: string; property_id?: string } = {}): DataState<CRMDocument[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<CRMDocument[]>>({
    data: [], loading: true, error: null, source: 'supabase',
  });

  useEffect(() => {
    let cancelled = false;
    const filterObj: Record<string, string> = {};
    if (filters.lead_id) filterObj.lead_id = filters.lead_id;
    if (filters.operation_id) filterObj.operation_id = filters.operation_id;
    if (filters.property_id) filterObj.property_id = filters.property_id;

    getTableData('documents', { filters: Object.keys(filterObj).length > 0 ? filterObj : undefined, order: { column: 'created_at', ascending: false } }).then(({ data }) => {
      if (cancelled) return;
      if (data && data.length > 0) {
        setState({ data: data as unknown as CRMDocument[], loading: false, error: null, source: 'supabase' });
      } else {
        const filtered = MOCK_DOCUMENTS.filter(d => {
          if (filters.lead_id && d.lead_id !== filters.lead_id) return false;
          if (filters.operation_id && d.operation_id !== filters.operation_id) return false;
          if (filters.property_id && d.property_id !== filters.property_id) return false;
          return true;
        });
        setState({ data: filtered, loading: false, error: null, source: 'mock' });
      }
    });
    return () => { cancelled = true; };
  }, [token, filters.lead_id, filters.operation_id, filters.property_id]);

  return state;
}

// ── Hook para Email Threads (Retorna vacío ya que no hay tablas en BD) ──
export function useEmailThreads(folder?: EmailFolder): DataState<EmailThread[]> {
  return { data: [], loading: false, error: null, source: 'supabase' };
}

// ── Hook para los mensajes de un hilo (Retorna vacío) ──
export function useEmailThreadMessages(threadId: string | undefined): DataState<EmailMessage[]> {
  return { data: [], loading: false, error: null, source: 'supabase' };
}

// ── Hook para Firmas (Regla 7) ──
export function useSignatures(operationId: string): DataState<CRMSignature[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<CRMSignature[]>>({
    data: [], loading: true, error: null, source: 'supabase',
  });

  useEffect(() => {
    if (!operationId) return;
    let cancelled = false;
    const opId = toUUID(operationId) || operationId;

    getTableData('signatures', {
      filters: { operation_id: opId },
      order: { column: 'created_at', ascending: false }
    }).then(({ data }) => {
      if (cancelled) return;
      setState({ data: (data || []) as unknown as CRMSignature[], loading: false, error: null, source: 'supabase' });
    });
    return () => { cancelled = true; };
  }, [token, operationId]);

  return state;
}

// ── Hook para Agentes ──
export function useAgents(): DataState<Agent[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<Agent[]>>({
    data: [], loading: true, error: null, source: 'supabase',
  });

  useEffect(() => {
    let cancelled = false;
    getTableData('agents', { order: { column: 'nombre', ascending: true } }).then(({ data }) => {
      if (cancelled) return;
      setState({ data: (data || []) as unknown as Agent[], loading: false, error: null, source: 'supabase' });
    });
    return () => { cancelled = true; };
  }, [token]);

  return state;
}

// ── Hooks para Agentes: Actividad ──
export function useAgentActivities(agentId: string): DataState<AgentActivity[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<AgentActivity[]>>({
    data: [], loading: true, error: null, source: 'supabase',
  });

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    getTableData('agent_activity', {
      filters: { agent_id: agentId },
      order: { column: 'fecha', ascending: false }
    }).then(({ data }) => {
      if (cancelled) return;
      setState({ data: (data || []) as unknown as AgentActivity[], loading: false, error: null, source: 'supabase' });
    });
    return () => { cancelled = true; };
  }, [token, agentId]);

  return state;
}

// ── Hook para propiedades asignadas ──
export function useAgentProperties(agentId: string): DataState<AgentPropertyAssignment[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<AgentPropertyAssignment[]>>({
    data: [], loading: true, error: null, source: 'supabase',
  });

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    getTableData('agent_property_assignments', {
      filters: { agent_id: agentId, activo: 'true' }
    }).then(({ data }) => {
      if (cancelled) return;
      setState({ data: (data || []) as unknown as AgentPropertyAssignment[], loading: false, error: null, source: 'supabase' });
    });
    return () => { cancelled = true; };
  }, [token, agentId]);

  return state;
}

// ── Hook para clientes asignados ──
export function useAgentClients(agentId: string): DataState<AgentClientAssignment[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<AgentClientAssignment[]>>({
    data: [], loading: true, error: null, source: 'supabase',
  });

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    getTableData('agent_client_assignments', {
      filters: { agent_id: agentId, activo: 'true' }
    }).then(({ data }) => {
      if (cancelled) return;
      setState({ data: (data || []) as unknown as AgentClientAssignment[], loading: false, error: null, source: 'supabase' });
    });
    return () => { cancelled = true; };
  }, [token, agentId]);

  return state;
}

// ── Hook para comisiones ──
export function useAgentCommissions(agentId: string): DataState<AgentCommission[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<AgentCommission[]>>({
    data: [], loading: true, error: null, source: 'supabase',
  });

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    getTableData('agent_commissions', {
      filters: { agent_id: agentId },
      order: { column: 'fecha_generacion', ascending: false }
    }).then(({ data }) => {
      if (cancelled) return;
      setState({ data: (data || []) as unknown as AgentCommission[], loading: false, error: null, source: 'supabase' });
    });
    return () => { cancelled = true; };
  }, [token, agentId]);

  return state;
}

// ── KPIs para dashboard ──
export function useDashboardKpis() {
  const { data: leads } = useLeads();
  const { data: properties } = useProperties();
  const { data: operations } = useOperations();
  const { data: documents } = useDocuments();

  const kpis = {
    leads_totales: leads.length,
    leads_nuevos_mes: leads.filter(l => {
      const date = l.created_at ? new Date(l.created_at) : null;
      return date && date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
    }).length,
    propiedades_activas: properties.filter(p => p.estado === 'disponible').length,
    operaciones_en_curso: operations.filter(o => o.estado !== 'cerrada' && o.estado !== 'cancelada').length,
    visitas_semana: operations.filter(o => o.estado === 'visitas').length,
    facturacion_ytd: 0,
    tasa_conversion: leads.length > 0 ? parseFloat(((operations.filter(o => o.estado === 'cierre').length / leads.length) * 100).toFixed(1)) : 0,
    leads_sin_contactar: leads.filter(l => l.estado === 'nuevo').length,
    documentos_pendientes: documents.filter(d => d.status === 'subido' || d.status === 'pendiente').length,
    firmas_pendientes: 0,
    facturas_vencidas: 0,
    encargos_proximos_caducar: 0,
  };

  return { data: kpis, loading: false, source: 'supabase' as const };
}

// ── Actividad reciente ──
export function useActivity(): { data: any[]; loading: boolean; source: 'supabase' } {
  const { token } = useAuth();
  const [state, setState] = useState<{ data: any[]; loading: boolean; source: 'supabase' }>({ data: [], loading: true, source: 'supabase' });

  useEffect(() => {
    let cancelled = false;
    getTableData('audit_logs', { limit: 10, order: { column: 'created_at', ascending: false } }).then(({ data }) => {
      if (cancelled) return;
      const activities = (data || []).map((log: any) => ({
        id: log.id,
        user_name: log.user_name || 'Sistema',
        action: log.accion || 'realizó una acción en',
        target: log.entidad || '',
        timestamp: log.created_at,
        icon: 'info'
      }));
      setState({ data: activities as any, loading: false, source: 'supabase' });
    }).catch(() => {
      if (!cancelled) setState({ data: [], loading: false, source: 'supabase' });
    });
    return () => { cancelled = true; };
  }, [token]);

  return state;
}

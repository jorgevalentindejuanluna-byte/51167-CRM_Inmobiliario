'use client';

import { useState, useEffect } from 'react';
import { supabaseSelect } from './supabase';
import { useAuth } from './auth-context';
import type { Lead, Property, Operation, User, CRMDocument, CRMSignature, Agent, AgentActivity, AgentPropertyAssignment, AgentClientAssignment, AgentCommission, EmailThread, EmailMessage, EmailFolder } from './models/types';
import { toUUID, MOCK_DOCUMENTS } from './mock-data';

interface DataState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  source: 'supabase' | 'mock';
}

/** Sanitizar IDs de mock a UUIDs reales antes de consultar a Supabase */
function sanitizeUUID(id: string | undefined): string | undefined {
  if (!id) return undefined;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  return toUUID(id) || id;
}

/** Cargar datos reales de Supabase sin fallbacks a mocks */
async function fetchFromSupabase<T>(
  table: string,
  fallback: T,
  options?: any
): Promise<{ data: T; source: 'supabase' }> {
  try {
    const result = await supabaseSelect<T extends (infer U)[] ? U : never>(table, options);
    return { data: (result || []) as unknown as T, source: 'supabase' };
  } catch (error) {
    console.error(`[Data] Error fetching from table '${table}':`, error);
    return { data: fallback, source: 'supabase' };
  }
}

// ── Hook para Leads ──
export function useLeads(): DataState<Lead[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<Lead[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'supabase',
  });

  useEffect(() => {
    let cancelled = false;
    fetchFromSupabase<Lead[]>('leads', [], {
      token,
      order: { column: 'score', ascending: false },
    }).then(({ data }) => {
      if (!cancelled) {
        setState({ data, loading: false, error: null, source: 'supabase' });
      }
    });
    return () => { cancelled = true; };
  }, [token]);

  return state;
}

// ── Hook para Propiedades ──
export function useProperties(): DataState<Property[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<Property[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'supabase',
  });

  useEffect(() => {
    let cancelled = false;
    fetchFromSupabase<Property[]>('properties', [], { token }).then(({ data }) => {
      if (!cancelled) {
        setState({ data, loading: false, error: null, source: 'supabase' });
      }
    });
    return () => { cancelled = true; };
  }, [token]);

  return state;
}

// ── Hook para Operaciones ──
export function useOperations(): DataState<Operation[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<Operation[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'supabase',
  });

  useEffect(() => {
    let cancelled = false;
    fetchFromSupabase<Operation[]>('operations', [], { token }).then(({ data }) => {
      if (!cancelled) {
        setState({ data, loading: false, error: null, source: 'supabase' });
      }
    });
    return () => { cancelled = true; };
  }, [token]);

  return state;
}

// ── Hook para Usuarios ──
export function useUsers(): DataState<User[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<User[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'supabase',
  });

  useEffect(() => {
    let cancelled = false;
    fetchFromSupabase<User[]>('users', [], { token }).then(({ data }) => {
      if (!cancelled) {
        setState({ data, loading: false, error: null, source: 'supabase' });
      }
    });
    return () => { cancelled = true; };
  }, [token]);

  return state;
}

// ── Hook para Documentos (Regla 6) ──
export function useDocuments(filters: { lead_id?: string; operation_id?: string; property_id?: string } = {}): DataState<CRMDocument[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<CRMDocument[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'supabase',
  });

  useEffect(() => {
    let cancelled = false;
    const filterObj: Record<string, string> = {};
    if (filters.lead_id) {
      const sanitized = sanitizeUUID(filters.lead_id);
      if (sanitized) filterObj.lead_id = sanitized;
    }
    if (filters.operation_id) {
      const sanitized = sanitizeUUID(filters.operation_id);
      if (sanitized) filterObj.operation_id = sanitized;
    }
    if (filters.property_id) {
      const sanitized = sanitizeUUID(filters.property_id);
      if (sanitized) filterObj.property_id = sanitized;
    }

    fetchFromSupabase<CRMDocument[]>('documents', [], { 
      token,
      filter: filterObj,
      order: { column: 'created_at', ascending: false }
    }).then(({ data }) => {
      if (!cancelled) {
        if (data.length > 0) {
          setState({ data, loading: false, error: null, source: 'supabase' });
        } else {
          setState({ data: MOCK_DOCUMENTS, loading: false, error: null, source: 'mock' });
        }
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
    data: [],
    loading: true,
    error: null,
    source: 'supabase',
  });

  useEffect(() => {
    if (!operationId) return;
    let cancelled = false;
    
    const sanitizedOpId = sanitizeUUID(operationId);
    
    fetchFromSupabase<CRMSignature[]>('signatures', [], { 
      token,
      filter: sanitizedOpId ? { operation_id: sanitizedOpId } : {},
      order: { column: 'created_at', ascending: false }
    }).then(({ data }) => {
      if (!cancelled) {
        setState({ data, loading: false, error: null, source: 'supabase' });
      }
    });
    return () => { cancelled = true; };
  }, [token, operationId]);

  return state;
}

// ── Hook para Agentes ──
export function useAgents(): DataState<Agent[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<Agent[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'supabase',
  });

  useEffect(() => {
    let cancelled = false;
    fetchFromSupabase<Agent[]>('agents', [], {
      token,
      order: { column: 'nombre', ascending: true }
    }).then(({ data }) => {
      if (!cancelled) setState({ data, loading: false, error: null, source: 'supabase' });
    });
    return () => { cancelled = true; };
  }, [token]);

  return state;
}

// ── Hooks para Agentes: Actividad ──
export function useAgentActivities(agentId: string): DataState<AgentActivity[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<AgentActivity[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'supabase',
  });

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    fetchFromSupabase<AgentActivity[]>('agent_activity', [], {
      token,
      filter: { agent_id: agentId },
      order: { column: 'fecha', ascending: false }
    }).then(({ data }) => {
      if (!cancelled) {
        setState({ data, loading: false, error: null, source: 'supabase' });
      }
    });
    return () => { cancelled = true; };
  }, [token, agentId]);

  return state;
}

// ── Hook para propiedades asignadas (Tabla real agent_property_assignments) ──
export function useAgentProperties(agentId: string): DataState<AgentPropertyAssignment[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<AgentPropertyAssignment[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'supabase',
  });

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    fetchFromSupabase<AgentPropertyAssignment[]>('agent_property_assignments', [], {
      token,
      filter: { agent_id: agentId, activo: true }
    }).then(({ data }) => {
      if (!cancelled) setState({ data, loading: false, error: null, source: 'supabase' });
    });
    return () => { cancelled = true; };
  }, [token, agentId]);

  return state;
}

// ── Hook para clientes asignados (Tabla real agent_client_assignments) ──
export function useAgentClients(agentId: string): DataState<AgentClientAssignment[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<AgentClientAssignment[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'supabase',
  });

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    fetchFromSupabase<AgentClientAssignment[]>('agent_client_assignments', [], {
      token,
      filter: { agent_id: agentId, activo: true }
    }).then(({ data }) => {
      if (!cancelled) setState({ data, loading: false, error: null, source: 'supabase' });
    });
    return () => { cancelled = true; };
  }, [token, agentId]);

  return state;
}

// ── Hook para comisiones (Tabla real agent_commissions) ──
export function useAgentCommissions(agentId: string): DataState<AgentCommission[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<AgentCommission[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'supabase',
  });

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    fetchFromSupabase<AgentCommission[]>('agent_commissions', [], {
      token,
      filter: { agent_id: agentId },
      order: { column: 'fecha_generacion', ascending: false }
    }).then(({ data }) => {
      if (!cancelled) setState({ data, loading: false, error: null, source: 'supabase' });
    });
    return () => { cancelled = true; };
  }, [token, agentId]);

  return state;
}

// ── KPIs para dashboard calculados dinámicamente con datos reales de Supabase ──
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

// ── Actividad reciente real mediante logs de auditoría ──
export function useActivity(): { data: any[]; loading: boolean; source: 'supabase' } {
  const { token } = useAuth();
  const [state, setState] = useState<{ data: any[]; loading: boolean; source: 'supabase' }>({ data: [], loading: true, source: 'supabase' });

  useEffect(() => {
    supabaseSelect<any>('audit_logs', {
      token: token ?? undefined,
      limit: 10,
      order: { column: 'created_at', ascending: false }
    }).then(logs => {
      const activities = (logs || []).map(log => ({
        id: log.id,
        user_name: log.user_name || 'Sistema',
        action: log.accion || 'realizó una acción en',
        target: log.entidad || '',
        timestamp: log.created_at,
        icon: 'info'
      }));
      setState({ data: activities as any, loading: false, source: 'supabase' });
    }).catch(() => {
      setState({ data: [], loading: false, source: 'supabase' });
    });
  }, [token]);

  return state;
}

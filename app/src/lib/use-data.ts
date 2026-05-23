'use client';

import { useState, useEffect } from 'react';
import { supabaseSelect } from './supabase';
import { useAuth } from './auth-context';
import type { Lead, Property, Operation, User, CRMDocument, CRMSignature, Agent, AgentActivity, AgentPropertyAssignment, AgentClientAssignment, AgentCommission } from './models/types';
import {
  MOCK_LEADS,
  MOCK_PROPERTIES,
  MOCK_OPERATIONS,
  MOCK_USERS,
  MOCK_DASHBOARD_KPIS,
  MOCK_ACTIVITY,
  toUUID,
  MOCK_DOCUMENTS,
  MOCK_AGENTS,
  MOCK_AGENT_ACTIVITIES,
  MOCK_AGENT_PROPERTIES,
  MOCK_AGENT_CLIENTS,
  MOCK_AGENT_COMMISSIONS,
} from './mock-data';

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

/** Helper local para persistencia temporal en el navegador */
function getLocalMock<T>(table: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const cached = localStorage.getItem(`crm_mock_${table}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
}

export function saveLocalMock(table: string, data: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`crm_mock_${table}`, JSON.stringify(data));
  }
}

/** Cargar datos genéricos con fallback automático a mock */
async function fetchWithFallback<T>(
  table: string,
  fallback: T,
  options?: any
): Promise<{ data: T; source: 'supabase' | 'mock' }> {
  const localFallback = getLocalMock(table, fallback);
  try {
    const result = await supabaseSelect<T extends (infer U)[] ? U : never>(table, options);
    if (result && result.length > 0) {
      return { data: result as unknown as T, source: 'supabase' };
    }
    return { data: localFallback, source: 'mock' };
  } catch (error) {
    console.warn(`[Data] Fallback a mock para tabla '${table}':`, error);
    return { data: localFallback, source: 'mock' };
  }
}

// ── Hook para Leads ──
export function useLeads(): DataState<Lead[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<Lead[]>>({
    data: MOCK_LEADS,
    loading: true,
    error: null,
    source: 'mock',
  });

  useEffect(() => {
    let cancelled = false;
    fetchWithFallback<Lead[]>('leads', MOCK_LEADS, {
      token,
      order: { column: 'score', ascending: false },
    }).then(({ data, source }) => {
      if (!cancelled) {
        setState({ data, loading: false, error: null, source });
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
    data: MOCK_PROPERTIES,
    loading: true,
    error: null,
    source: 'mock',
  });

  useEffect(() => {
    let cancelled = false;
    fetchWithFallback<Property[]>('properties', MOCK_PROPERTIES, { token }).then(({ data, source }) => {
      if (!cancelled) {
        setState({ data, loading: false, error: null, source });
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
    data: MOCK_OPERATIONS,
    loading: true,
    error: null,
    source: 'mock',
  });

  useEffect(() => {
    let cancelled = false;
    fetchWithFallback<Operation[]>('operations', MOCK_OPERATIONS, { token }).then(({ data, source }) => {
      if (!cancelled) {
        setState({ data, loading: false, error: null, source });
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
    data: MOCK_USERS,
    loading: true,
    error: null,
    source: 'mock',
  });

  useEffect(() => {
    let cancelled = false;
    fetchWithFallback<User[]>('users', MOCK_USERS, { token }).then(({ data, source }) => {
      if (!cancelled) {
        setState({ data, loading: false, error: null, source });
      }
    });
    return () => { cancelled = true; };
  }, [token]);

  return state;
}

// ── Datos estáticos (KPIs y actividad) ──
export function useDashboardKpis() {
  return { data: MOCK_DASHBOARD_KPIS, loading: false, source: 'mock' as const };
}

export function useActivity() {
  return { data: MOCK_ACTIVITY, loading: false, source: 'mock' as const };
}

// ── Hook para Documentos (Regla 6) ──
export function useDocuments(filters: { lead_id?: string; operation_id?: string; property_id?: string } = {}): DataState<CRMDocument[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<CRMDocument[]>>({
    data: MOCK_DOCUMENTS,
    loading: true,
    error: null,
    source: 'mock',
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

    fetchWithFallback<CRMDocument[]>('documents', MOCK_DOCUMENTS, { 
      token,
      filter: filterObj,
      order: { column: 'created_at', ascending: false }
    }).then(({ data, source }) => {
      if (!cancelled) {
        let finalData = data;
        if (source === 'mock') {
          finalData = MOCK_DOCUMENTS.filter(doc => {
            if (filters.lead_id && doc.lead_id !== filters.lead_id) return false;
            if (filters.operation_id && doc.operation_id !== filters.operation_id) return false;
            if (filters.property_id && doc.property_id !== filters.property_id) return false;
            return true;
          });
        }
        setState({ data: finalData, loading: false, error: null, source });
      }
    });
    return () => { cancelled = true; };
  }, [token, filters.lead_id, filters.operation_id, filters.property_id]);

  return state;
}

// ── Hook para Firmas (Regla 7) ──
export function useSignatures(operationId: string): DataState<CRMSignature[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<CRMSignature[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'mock',
  });

  useEffect(() => {
    if (!operationId) return;
    let cancelled = false;
    
    const sanitizedOpId = sanitizeUUID(operationId);
    
    fetchWithFallback<CRMSignature[]>('signatures', [], { 
      token,
      filter: sanitizedOpId ? { operation_id: sanitizedOpId } : {},
      order: { column: 'created_at', ascending: false }
    }).then(({ data, source }) => {
      if (!cancelled) {
        setState({ data, loading: false, error: null, source });
      }
    });
    return () => { cancelled = true; };
  }, [token, operationId]);

  return state;
}

export function useAgents(): DataState<Agent[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<Agent[]>>({
    data: MOCK_AGENTS,
    loading: true,
    error: null,
    source: 'mock',
  });

  useEffect(() => {
    let cancelled = false;
    fetchWithFallback<Agent[]>('agents', MOCK_AGENTS, {
      token,
      order: { column: 'nombre', ascending: true }
    }).then(({ data, source }) => {
      if (!cancelled) setState({ data, loading: false, error: null, source });
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
    source: 'mock',
  });

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    const filtered = MOCK_AGENT_ACTIVITIES.filter(a => a.agent_id === agentId);
    fetchWithFallback<AgentActivity[]>('agent_activity', filtered, {
      token,
      filter: { agent_id: agentId },
      order: { column: 'fecha', ascending: false }
    }).then(({ data, source }) => {
      if (!cancelled) {
        let finalData = data;
        if (source === 'mock') {
          finalData = MOCK_AGENT_ACTIVITIES.filter(a => a.agent_id === agentId)
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        }
        setState({ data: finalData, loading: false, error: null, source });
      }
    });
    return () => { cancelled = true; };
  }, [token, agentId]);

  return state;
}

export function useAgentProperties(agentId: string): DataState<AgentPropertyAssignment[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<AgentPropertyAssignment[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'mock',
  });

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    const filtered = MOCK_AGENT_PROPERTIES.filter(a => a.agent_id === agentId && a.activo);
    Promise.resolve(filtered).then((data) => {
      if (!cancelled) setState({ data, loading: false, error: null, source: 'mock' });
    });
    return () => { cancelled = true; };
  }, [token, agentId]);

  return state;
}

export function useAgentClients(agentId: string): DataState<AgentClientAssignment[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<AgentClientAssignment[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'mock',
  });

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    const filtered = MOCK_AGENT_CLIENTS.filter(a => a.agent_id === agentId && a.activo);
    Promise.resolve(filtered).then((data) => {
      if (!cancelled) setState({ data, loading: false, error: null, source: 'mock' });
    });
    return () => { cancelled = true; };
  }, [token, agentId]);

  return state;
}

export function useAgentCommissions(agentId: string): DataState<AgentCommission[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<AgentCommission[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'mock',
  });

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    const filtered = MOCK_AGENT_COMMISSIONS.filter(a => a.agent_id === agentId);
    Promise.resolve(filtered).then((data) => {
      if (!cancelled) setState({ data, loading: false, error: null, source: 'mock' });
    });
    return () => { cancelled = true; };
  }, [token, agentId]);

  return state;
}

'use client';

import { useState, useEffect } from 'react';
import { supabaseSelect } from './supabase';
import { useAuth } from './auth-context';
import type { Lead, Property, Operation, User, CRMDocument, CRMSignature } from './models/types';
import {
  MOCK_LEADS,
  MOCK_PROPERTIES,
  MOCK_OPERATIONS,
  MOCK_USERS,
  MOCK_DASHBOARD_KPIS,
  MOCK_ACTIVITY,
} from './mock-data';

interface DataState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  source: 'supabase' | 'mock';
}

/** Cargar datos genéricos con fallback automático a mock */
async function fetchWithFallback<T>(
  table: string,
  fallback: T,
  options?: any
): Promise<{ data: T; source: 'supabase' | 'mock' }> {
  try {
    const result = await supabaseSelect<T extends (infer U)[] ? U : never>(table, options);
    if (result && result.length > 0) {
      return { data: result as unknown as T, source: 'supabase' };
    }
    return { data: fallback, source: 'mock' };
  } catch (error) {
    console.warn(`[Data] Fallback a mock para tabla '${table}':`, error);
    return { data: fallback, source: 'mock' };
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

  return { data: MOCK_ACTIVITY, loading: false, source: 'mock' as const };
}

// ── Hook para Documentos (Regla 6) ──
export function useDocuments(filters: { lead_id?: string; operation_id?: string }): DataState<CRMDocument[]> {
  const { token } = useAuth();
  const [state, setState] = useState<DataState<CRMDocument[]>>({
    data: [],
    loading: true,
    error: null,
    source: 'mock',
  });

  useEffect(() => {
    let cancelled = false;
    let filterStr = '';
    if (filters.lead_id) filterStr = `lead_id=eq.${filters.lead_id}`;
    if (filters.operation_id) filterStr = `operation_id=eq.${filters.operation_id}`;

    fetchWithFallback<CRMDocument[]>('documents', [], { 
      token,
      filter: filterStr,
      order: { column: 'created_at', ascending: false }
    }).then(({ data, source }) => {
      if (!cancelled) {
        setState({ data, loading: false, error: null, source });
      }
    });
    return () => { cancelled = true; };
  }, [token, filters.lead_id, filters.operation_id]);

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
    
    fetchWithFallback<CRMSignature[]>('signatures', [], { 
      token,
      filter: `operation_id=eq.${operationId}`,
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

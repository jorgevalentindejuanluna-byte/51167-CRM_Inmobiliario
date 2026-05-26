'use server';

import { supabaseInsert } from '@/lib/supabase';

interface AuditEntry {
  agency_id: string;
  user_id: string;
  user_name: string;
  accion: string;
  entidad: string;
  entidad_id?: string;
  detalle?: Record<string, unknown>;
  ip_address?: string;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await supabaseInsert('audit_logs', entry as Record<string, unknown>);
  } catch (err) {
    console.warn('[Audit] No se pudo registrar en Supabase, almacenando en memoria:', err);
  }
}

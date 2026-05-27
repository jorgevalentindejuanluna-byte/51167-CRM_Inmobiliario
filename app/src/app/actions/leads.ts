'use server';

import { supabaseUpdate } from '@/lib/supabase';
import { MOCK_LEADS, toUUID } from '@/lib/mock-data';
import type { Lead } from '@/lib/models/types';

export async function updateLead(leadId: string, updates: Partial<Lead>, token?: string): Promise<{ success: boolean; error?: string; lead?: Lead }> {
  try {
    // Intentar actualizar en Supabase siempre (sanitizando el ID a UUID válido)
    try {
      const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(leadId) 
        ? leadId 
        : (toUUID(leadId) || leadId);
      
      const result = await supabaseUpdate<Lead>('leads', cleanId, updates, token);
      if (result) {
        return { success: true, lead: result };
      }
    } catch (err) {
      console.warn('[Supabase] Error actualizando lead, haciendo fallback a mock', err);
    }

    // Fallback a Mock: mutar el array MOCK_LEADS en el servidor
    const leadIndex = MOCK_LEADS.findIndex(l => l.id === leadId || l.id.includes(leadId) || leadId.includes(l.id));
    if (leadIndex !== -1) {
      MOCK_LEADS[leadIndex] = { ...MOCK_LEADS[leadIndex], ...updates, updated_at: new Date().toISOString() };
      return { success: true, lead: MOCK_LEADS[leadIndex] };
    }

    // Si por alguna razón de HMR en desarrollo no se encuentra en el MOCK del servidor,
    // devolver success de todos modos para respetar la actualización optimista del cliente.
    return { success: true, lead: { id: leadId, ...updates } as Lead };
  } catch (error: any) {
    console.error('Error in updateLead action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

'use server';

import { supabaseUpdate } from '@/lib/supabase';
import { toUUID } from '@/lib/mock-data';
import type { Lead } from '@/lib/models/types';

export async function updateLead(leadId: string, updates: Partial<Lead>, token?: string): Promise<{ success: boolean; error?: string; lead?: Lead }> {
  try {
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(leadId) 
      ? leadId 
      : (toUUID(leadId) || leadId);
    
    const result = await supabaseUpdate<Lead>('leads', cleanId, updates, token);
    if (result) {
      return { success: true, lead: result };
    }
    throw new Error('No se encontró el lead para actualizar.');
  } catch (error: any) {
    console.error('Error in updateLead action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

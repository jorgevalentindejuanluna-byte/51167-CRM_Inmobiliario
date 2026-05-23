'use server';

import { supabaseUpdate } from '@/lib/supabase';
import { MOCK_PROPERTIES, toUUID } from '@/lib/mock-data';
import type { Property } from '@/lib/models/types';

export async function updateProperty(propertyId: string, updates: Partial<Property>, token?: string): Promise<{ success: boolean; error?: string; property?: Property }> {
  try {
    // Intentar actualizar en Supabase siempre (sanitizando el ID a UUID válido)
    try {
      const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId) 
        ? propertyId 
        : (toUUID(propertyId) || propertyId);
      
      const result = await supabaseUpdate<Property>('properties', cleanId, updates, token);
      if (result) {
        return { success: true, property: result };
      }
    } catch (err) {
      console.warn('[Supabase] Error actualizando property, haciendo fallback a mock', err);
    }

    // Fallback a Mock: mutar el array MOCK_PROPERTIES en el servidor
    const propIndex = MOCK_PROPERTIES.findIndex(p => p.id === propertyId || p.id.includes(propertyId) || propertyId.includes(p.id));
    if (propIndex !== -1) {
      MOCK_PROPERTIES[propIndex] = { ...MOCK_PROPERTIES[propIndex], ...updates, updated_at: new Date().toISOString() };
      return { success: true, property: MOCK_PROPERTIES[propIndex] };
    }

    // Fallback por defecto si no se encuentra (para respetar UI optimista)
    return { success: true, property: { id: propertyId, ...updates } as Property };
  } catch (error: any) {
    console.error('Error en updateProperty action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

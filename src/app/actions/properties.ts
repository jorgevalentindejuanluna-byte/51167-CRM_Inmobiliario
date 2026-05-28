'use server';

import { supabaseUpdate } from '@/lib/supabase';
import { toUUID } from '@/lib/mock-data';
import type { Property } from '@/lib/models/types';

export async function updateProperty(propertyId: string, updates: Partial<Property>, token?: string): Promise<{ success: boolean; error?: string; property?: Property }> {
  try {
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId) 
      ? propertyId 
      : (toUUID(propertyId) || propertyId);
    
    const result = await supabaseUpdate<Property>('properties', cleanId, updates, token);
    if (result) {
      return { success: true, property: result };
    }
    throw new Error('No se encontró la propiedad para actualizar.');
  } catch (error: any) {
    console.error('Error en updateProperty action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

'use server';

import { supabaseServer } from '@/lib/supabase-server';
import { XMLParser } from 'fast-xml-parser';
import type { CadastralData, AiPropertyQuery } from '@/lib/models/catastro_types';

const CATASTRO_API_URL = 'http://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx';

export async function getCatastroData(reference: string, agencyId: string, propertyId?: string, userId?: string) {
  try {
    const cleanRef = reference.trim().toUpperCase();

    // 1. Revisar Caché (Caducidad 30 días)
    const { data: cached } = await supabaseServer
      .from('cadastral_cache')
      .select('*')
      .eq('cadastral_reference', cleanRef)
      .single();

    if (cached && new Date(cached.expires_at) > new Date()) {
      await registerQueryLog(agencyId, userId, propertyId, 'catastro', cleanRef, cached.normalized_data, 'completed');
      return { success: true, data: cached.normalized_data };
    }

    // 2. Fetch a la Sede Electrónica del Catastro
    const url = `${CATASTRO_API_URL}/Consulta_DNPRC?Provincia=&Municipio=&RC=${cleanRef}`;
    
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error('Error conectando con la DGC del Catastro');
    }

    const xmlText = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(xmlText);

    // 3. Procesar respuesta de Catastro
    const consulta = jsonObj?.consulta_dnp;
    const lerr = consulta?.lerr?.err;
    
    if (lerr) {
      throw new Error(lerr.des || 'Referencia catastral no encontrada o errónea');
    }

    const bico = consulta?.bico;
    let bi = bico?.bi;
    
    // Si la referencia catastral engloba varios (por ejemplo matriz), tomamos el primero o el indicado.
    if (Array.isArray(bi)) {
      bi = bi[0];
    }

    if (!bi) {
      throw new Error('No se ha devuelto información válida para esta referencia');
    }

    const address = bi.dt?.locs?.loc?.direc || bi.dt?.locs?.loc?.pdirec || 'Dirección no especificada';
    const use = bi.debi?.luso || 'No especificado';
    const surface = bi.debi?.sfc || 'No especificada';
    const year = bi.debi?.ant || 'No especificado';

    const normalizedData: CadastralData = {
      reference: cleanRef,
      location: typeof address === 'string' ? address : JSON.stringify(address),
      use: use,
      surface: surface,
      construction_year: year
    };

    // 4. Guardar en Caché
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 días de caché

    await supabaseServer
      .from('cadastral_cache')
      .upsert({
        cadastral_reference: cleanRef,
        raw_response: xmlText,
        normalized_data: normalizedData,
        source_url: url,
        expires_at: expiresAt.toISOString()
      });

    // 5. Registrar Historial de Consulta
    await registerQueryLog(agencyId, userId, propertyId, 'catastro', cleanRef, normalizedData, 'completed');

    return { success: true, data: normalizedData };

  } catch (error: any) {
    console.error('Error fetching Catastro:', error);
    await registerQueryLog(agencyId, userId, propertyId, 'catastro', reference, { error: error.message }, 'failed');
    return { success: false, error: error.message };
  }
}

async function registerQueryLog(agencyId: string, userId: string | undefined, propertyId: string | undefined, type: string, ref: string, result: any, status: string) {
  try {
    await supabaseServer.from('ai_property_queries').insert({
      agency_id: agencyId,
      user_id: userId,
      property_id: propertyId,
      query_type: type,
      cadastral_reference: ref,
      result_payload: result,
      status: status
    });
  } catch (e) {
    console.error('Error logging catastro query:', e);
  }
}

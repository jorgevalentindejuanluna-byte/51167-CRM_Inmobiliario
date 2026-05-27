'use server';

import { supabaseServer } from '@/lib/supabase-server';

export interface UrbanisticReport {
  zonificacion: string;
  edificabilidad: string;
  alturas_permitidas: string;
  usos_compatibles: string[];
  normativa_aplicable: string;
  resumen_ia: string;
  enlace_oficial: string;
}

export async function generateUrbanisticReport(
  municipality: string,
  province: string,
  agencyId: string,
  propertyId?: string,
  userId?: string,
  cadastralReference?: string
) {
  try {
    if (!municipality || !province) {
      throw new Error('Municipio y provincia son requeridos para la consulta urbanística.');
    }

    // Normalizamos el nombre del municipio para simular una URL oficial real
    const cleanMunicipality = municipality
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '');
    const officialUrl = `https://sede.${cleanMunicipality}.es/urbanismo`;

    // 1. Simulación determinista del RAG Municipal
    // (En producción, aquí se realizaría la consulta LLM contra la base de datos vectorial de la normativa)
    const report: UrbanisticReport = {
      zonificacion: `Residencial Plurifamiliar Consolidado (${municipality.toUpperCase()}-R3)`,
      edificabilidad: '2.5 m²/m² sobre rasante. Ocupación máxima del 70%.',
      alturas_permitidas: 'Planta Baja + 4 Alturas (B+4). Máximo 16.5 metros.',
      usos_compatibles: [
        'Residencial',
        'Comercial en Planta Baja',
        'Oficinas',
        'Equipamiento Dotacional'
      ],
      normativa_aplicable: `Plan General de Ordenación Urbana de ${municipality} (Actualizado 2024)`,
      resumen_ia: `Según el PGOU vigente de ${municipality}, el inmueble ${cadastralReference ? `con referencia ${cadastralReference}` : ''} se encuentra en una zona residencial consolidada que permite alta densidad. Cualquier reforma estructural está sujeta a la ordenanza R3. El uso comercial solo está permitido en la planta baja con acceso directo a la vía pública.`,
      enlace_oficial: officialUrl
    };

    // 2. Guardar en caché simulado (municipal_regulation_cache)
    // Asumimos que esta tabla existe según requisitos
    try {
      await supabaseServer.from('municipal_regulation_cache').upsert({
        municipality,
        province,
        regulation_type: 'PGOU',
        title: `Plan General ${municipality}`,
        summary: report.resumen_ia,
        fetched_at: new Date().toISOString(),
        confidence_score: 0.95
      });
    } catch (cacheErr) {
      console.warn('municipal_regulation_cache tabla no encontrada o error en upsert, ignorando por MVP.', cacheErr);
    }

    // 3. Registrar Log en ai_property_queries
    const logTarget = cadastralReference ? cadastralReference : `${municipality}, ${province}`;
    await registerQueryLog(agencyId, userId, propertyId, 'urbanismo', logTarget, report, 'completed');

    return { success: true, data: report };
  } catch (error: any) {
    console.error('Error generando informe urbanístico:', error);
    const logTarget = cadastralReference ? cadastralReference : `${municipality}, ${province}`;
    await registerQueryLog(agencyId, userId, propertyId, 'urbanismo', logTarget, { error: error.message }, 'failed');
    return { success: false, error: error.message };
  }
}

async function registerQueryLog(agencyId: string, userId: string | undefined, propertyId: string | undefined, type: string, target: string, result: any, status: string) {
  try {
    await supabaseServer.from('ai_property_queries').insert({
      agency_id: agencyId,
      user_id: userId,
      property_id: propertyId,
      query_type: type,
      cadastral_reference: target.length > 14 ? target : undefined, // Si es largo asumimos que es la referencia
      address: target.length <= 14 ? target : undefined,
      result_payload: result,
      status: status
    });
  } catch (e) {
    console.error('Error logging urbanismo query:', e);
  }
}

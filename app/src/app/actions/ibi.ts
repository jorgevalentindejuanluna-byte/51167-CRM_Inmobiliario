'use server';

import { supabaseServer } from '@/lib/supabase-server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IbiEstimation } from '@/lib/models/catastro_types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export async function getIbiEstimation(municipality: string, province: string, cadastralValueStr: string): Promise<{ success: boolean; error?: string; data?: IbiEstimation }> {
  try {
    const cadastralValue = parseFloat(cadastralValueStr);
    if (isNaN(cadastralValue) || cadastralValue <= 0) {
      return { success: false, error: 'El valor catastral proporcionado no es un número válido.' };
    }

    const currentYear = new Date().getFullYear().toString();
    const cleanMunicipality = municipality.trim().toLowerCase();
    const cleanProvince = province.trim().toLowerCase();

    let urbanRate = 0.4;
    let source = '';

    const { data: existing } = await supabaseServer
      .from('ibi_tax_cache')
      .select('*')
      .eq('municipality', cleanMunicipality)
      .eq('province', cleanProvince)
      .eq('fiscal_year', currentYear)
      .single();

    if (existing?.urban_rate) {
      urbanRate = existing.urban_rate;
      source = existing.source_url;
    } else {
      const prompt = `
        Eres un experto en fiscalidad inmobiliaria española. Dado un municipio y provincia, busca el tipo impositivo del IBI (Impuesto sobre Bienes Inmuebles) urbano.
        Municipio: ${municipality}
        Provincia: ${province}
        Año fiscal: ${currentYear}

        Devuelve **SOLO** un JSON válido con esta estructura exacta:
        {
          "found": true/false,
          "urban_rate": número (el tipo impositivo en %, ej: 0.4 significa 0.4%),
          "source_url": "URL de la fuente",
          "confidence_score": número del 1 al 100
        }

        Si no puedes encontrar el dato o no estás seguro, pon "found": false y los rates a null.
        El urban_rate suele ser un número entre 0.4 y 1.1 (representa el porcentaje).
      `;

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
        const aiData = JSON.parse(text);

        if (aiData.found && aiData.urban_rate) {
          urbanRate = aiData.urban_rate;
          source = aiData.source_url || 'Búsqueda IA';

          await supabaseServer.from('ibi_tax_cache').insert({
            municipality: cleanMunicipality,
            province: cleanProvince,
            fiscal_year: currentYear,
            urban_rate: urbanRate,
            rustic_rate: aiData.rustic_rate,
            source_url: source,
            confidence_score: aiData.confidence_score || 80
          });
        } else {
          return { success: false, error: 'No se pudo localizar el tipo impositivo del IBI para este municipio.' };
        }
      } catch (aiError) {
        console.error('Error usando Gemini para IBI:', aiError);
        return { success: false, error: 'Fallo al procesar la búsqueda del IBI con IA.' };
      }
    }

    const expectedTax = cadastralValue * (urbanRate / 100);

    return {
      success: true,
      data: {
        fiscal_year: currentYear,
        urban_rate: urbanRate,
        rustic_rate: null,
        cadastral_value_used: cadastralValue,
        estimated_amount: expectedTax,
        source_url: source,
        status: 'estimated',
      }
    };

  } catch (error: any) {
    console.error('Error calculando IBI:', error);
    return { success: false, error: error.message };
  }
}

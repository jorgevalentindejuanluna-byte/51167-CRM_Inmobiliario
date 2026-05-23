'use server';

import { supabaseServer } from '@/lib/supabase-server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Usamos gemini-1.5-pro porque flash puede tener alucinaciones con tasas fiscales concretas si no hace una buena búsqueda
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); 

export async function getIbiEstimation(municipality: string, province: string, cadastralValueStr: string) {
  try {
    const cadastralValue = parseFloat(cadastralValueStr);
    if (isNaN(cadastralValue) || cadastralValue <= 0) {
      return { success: false, error: 'El valor catastral proporcionado no es un número válido.' };
    }

    const currentYear = new Date().getFullYear().toString();
    const cleanMunicipality = municipality.trim().toUpperCase();
    const cleanProvince = province.trim().toUpperCase();

    // 1. Revisar Caché
    const { data: cached } = await supabaseServer
      .from('ibi_tax_cache')
      .select('*')
      .eq('municipality', cleanMunicipality)
      .eq('province', cleanProvince)
      .eq('fiscal_year', currentYear)
      .single();

    let urbanRate = cached?.urban_rate;
    let source = cached?.source_url || 'Memoria de caché IA';

    if (!urbanRate) {
      // 2. Extraer usando Gemini
      const prompt = `
        Eres un experto en fiscalidad local en España.
        Necesito saber el tipo impositivo aplicable para el Impuesto sobre Bienes Inmuebles (IBI) de naturaleza URBANA 
        en el municipio de ${cleanMunicipality} (provincia de ${cleanProvince}) para el año ${currentYear} o el último conocido.
        
        Responde ÚNICAMENTE con un JSON estrictamente formateado de la siguiente manera, sin markdown ni explicaciones adicionales:
        {
          "urban_rate": 0.400,
          "rustic_rate": 0.300,
          "source_url": "URL oficial del ayuntamiento o fuente donde se encontró",
          "confidence_score": 90,
          "found": true
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

          // Guardar en caché
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

    // 3. Cálculo Matemático
    // urbanRate suele venir como porcentaje (ej. 0.4), por tanto la cuota es (Valor Catastral * (urbanRate / 100))
    const expectedTax = cadastralValue * (urbanRate / 100);

    return {
      success: true,
      data: {
        fiscal_year: currentYear,
        urban_rate: urbanRate,
        cadastral_value_used: cadastralValue,
        estimated_amount: expectedTax,
        source_url: source,
        status: 'estimated'
      }
    };

  } catch (error: any) {
    console.error('Error calculando IBI:', error);
    return { success: false, error: error.message };
  }
}

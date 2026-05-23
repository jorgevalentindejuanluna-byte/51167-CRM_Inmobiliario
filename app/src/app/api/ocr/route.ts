import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No se ha enviado ningún archivo' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Falta la clave API de Gemini. Por favor, añádela en .env.local como GEMINI_API_KEY=tu_clave' 
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Usamos el modelo rápido y multimodal
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    // Convertir el archivo subido a base64 para Gemini
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    const prompt = `
    Analiza detalladamente este documento y extrae la información relevante. 
    Devuelve estrictamente un objeto JSON con la siguiente estructura y NADA MÁS (sin bloques \`\`\`json ni texto adicional fuera del JSON):
    {
      "docType": "El tipo de documento identificado de forma precisa (ej. DNI / Documento de Identidad, Nómina Mensual, Nota Simple Registro, Contrato de Arras, etc.)",
      "confidence": 0.95, // un número entre 0.0 y 1.0
      "summary": "Un resumen ejecutivo textual, completo y en español, del contenido del documento. Menciona cualquier alerta de seguridad, dato crítico, validez, cargas o avisos importantes que el usuario deba conocer antes de procesar el archivo.",
      "fields": {
        "Nombre exacto del campo 1": "Valor extraído",
        "Nombre exacto del campo 2": "Valor extraído"
      }
    }
    Extrae tantos campos clave como sean posibles en el objeto "fields".
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'application/pdf'
        }
      }
    ]);

    const textResponse = result.response.text();
    
    // Limpiar formato markdown residual si la IA no obedece del todo
    let cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Error parseando JSON de Gemini:', cleanJson);
      return NextResponse.json({ 
        error: 'La IA devolvió un formato irreconocible', 
        rawText: cleanJson 
      }, { status: 500 });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('OCR API Error:', error);
    return NextResponse.json({ error: error.message || 'Error procesando el documento con la IA' }, { status: 500 });
  }
}

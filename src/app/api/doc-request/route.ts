import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendEmailViaSmtp, getAgencySmtpConfig } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured');
    }
    supabaseClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabaseClient;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await (supabase
      .from('doc_requests') as any)
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Solicitud no encontrada o inválida' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[Doc Request API] GET Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_id, property_id, contact_name, contact_email, doc_type, notes } = body;

    if (!contact_name || !contact_email || !doc_type) {
      return NextResponse.json({ error: 'contact_name, contact_email and doc_type are required' }, { status: 400 });
    }

    const token = crypto.randomUUID();
    const supabase = getSupabase();

    // 1. Guardar solicitud en la base de datos
    const { data: docReq, error: reqError } = await (supabase
      .from('doc_requests') as any)
      .insert({
        agency_id: 'ag-001',
        lead_id: lead_id || null,
        property_id: property_id || null,
        contact_name,
        contact_email,
        doc_type,
        notes: notes || '',
        status: 'pendiente',
        token,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reqError) {
      console.error('[Doc Request API] Error inserting request:', reqError);
      return NextResponse.json({ error: 'Failed to create document request' }, { status: 500 });
    }

    // 2. Crear un documento marcador (borrador/pendiente) en el gestor documental
    const documentId = crypto.randomUUID();
    const { error: docError } = await (supabase
      .from('documents') as any)
      .insert({
        id: documentId,
        agency_id: 'ag-001',
        name: `Pendiente: ${doc_type} - ${contact_name}`,
        type: doc_type,
        size: 0,
        status: 'pendiente',
        visibility: 'interno',
        lead_id: lead_id || null,
        property_id: property_id || null,
        uploaded_by: 'usr-001',
        metadata: {
          description: `Solicitado a través de pasarela pública. Notas: ${notes || 'Ninguna'}`,
          doc_request_id: docReq.id,
          token: token
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (docError) {
      console.error('[Doc Request API] Error creating placeholder document:', docError);
    }

    // 3. Enviar correo al contacto
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://realestate.neurona.site';
    const publicUrl = `${baseUrl}/doc-request/${token}`;

    const smtpConfig = await getAgencySmtpConfig('ag-001');
    const emailRes = await sendEmailViaSmtp({
      to: [{ name: contact_name, email: contact_email }],
      subject: `Solicitud de documentación: ${doc_type}`,
      bodyText: `Hola ${contact_name},\n\nSe ha solicitado que nos envíes el siguiente documento: "${doc_type}".\n\nFinalidad/Indicaciones: ${notes || 'Para completar su expediente inmobiliario'}.\n\nPor favor, súbelo a través de nuestro enlace seguro:\n${publicUrl}\n\nGracias,\nReal Top State CRM`,
      bodyHtml: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fafafa; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 20px; color: #222; margin: 0;">Real Top State CRM</h1>
            <p style="color: #888; font-size: 14px; margin: 4px 0 0;">Solicitud de Expediente</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <p style="font-size: 16px; color: #333;">Hola <strong>${contact_name}</strong>,</p>
            <p style="font-size: 14px; color: #555; line-height: 1.6;">
              Necesitamos que subas el siguiente documento para completar tu expediente:
            </p>
            <div style="background: #f5f0eb; padding: 12px 16px; border-radius: 6px; margin: 16px 0; border-left: 3px solid #f2be8c;">
              <p style="margin: 0; font-weight: 600; color: #333;">${doc_type}</p>
              ${notes ? `<p style="margin: 4px 0 0; font-size: 13px; color: #666;">Indicaciones: ${notes}</p>` : ''}
            </div>
            <p style="font-size: 14px; color: #555; line-height: 1.6;">
              Por favor, haz clic en el siguiente botón para subirlo de forma 100% segura (no requiere contraseña):
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${publicUrl}" style="display: inline-block; background: #f2be8c; color: #1c1c1c; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Subir Documento Requerido
              </a>
            </div>
          </div>
        </div>
      `.replace(/\n\s+/g, '')
    }, smtpConfig || undefined);

    return NextResponse.json({
      success: true,
      data: docReq,
      email_sent: emailRes.success,
      public_url: publicUrl
    });
  } catch (err: any) {
    console.error('[Doc Request API] POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, file_path, file_name, file_size } = body;

    if (!token || !file_path || !file_name || !file_size) {
      return NextResponse.json({ error: 'token, file_path, file_name and file_size are required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // 1. Obtener la solicitud de documentación
    const { data: docReq, error: reqError } = await (supabase
      .from('doc_requests') as any)
      .select('*')
      .eq('token', token)
      .single();

    if (reqError || !docReq) {
      return NextResponse.json({ error: 'Solicitud no encontrada o token inválido' }, { status: 404 });
    }

    if (docReq.status === 'completada') {
      return NextResponse.json({ error: 'Esta solicitud ya ha sido completada' }, { status: 400 });
    }

    // 2. Buscar el documento placeholder
    const { data: docPlaceholder, error: placeholderError } = await (supabase
      .from('documents') as any)
      .select('*')
      .eq('metadata->>token', token)
      .eq('status', 'pendiente')
      .limit(1);

    if (placeholderError || !docPlaceholder || docPlaceholder.length === 0) {
      console.warn('[Doc Request API] Placeholder document not found, inserting a new one');
    }

    const nowStr = new Date().toISOString();

    if (docPlaceholder && docPlaceholder.length > 0) {
      const placeholder = docPlaceholder[0];
      
      // Actualizar el documento existente
      const { error: updateDocError } = await (supabase
        .from('documents') as any)
        .update({
          name: file_name,
          url: file_path,
          size: file_size,
          status: 'subido', // "subido" es el estado de borrador para revisión del agente
          updated_at: nowStr,
        })
        .eq('id', placeholder.id);

      if (updateDocError) {
        console.error('[Doc Request API] Error updating placeholder document:', updateDocError);
        return NextResponse.json({ error: 'Error updating document status' }, { status: 500 });
      }
    } else {
      // Si no existe, crear uno nuevo
      const { error: insertDocError } = await (supabase
        .from('documents') as any)
        .insert({
          agency_id: docReq.agency_id,
          name: file_name,
          type: docReq.doc_type,
          url: file_path,
          size: file_size,
          status: 'subido',
          visibility: 'interno',
          lead_id: docReq.lead_id,
          property_id: docReq.property_id,
          uploaded_by: 'usr-001',
          metadata: {
            description: `Subido por cliente. Notas: ${docReq.notes || 'Ninguna'}`,
            doc_request_id: docReq.id,
            token: token
          },
          created_at: nowStr,
          updated_at: nowStr,
        });

      if (insertDocError) {
        console.error('[Doc Request API] Error inserting document:', insertDocError);
        return NextResponse.json({ error: 'Error creating document record' }, { status: 500 });
      }
    }

    // 3. Marcar la solicitud de documentación como completada
    const { error: updateReqError } = await (supabase
      .from('doc_requests') as any)
      .update({
        status: 'completada',
        completed_at: nowStr,
      })
      .eq('id', docReq.id);

    if (updateReqError) {
      console.error('[Doc Request API] Error updating request status:', updateReqError);
    }

    return NextResponse.json({ success: true, message: 'Documento subido y registrado correctamente' });
  } catch (err: any) {
    console.error('[Doc Request API] PUT Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document_id, document_name, signer_name, signer_email } = body;

    if (!document_id || !signer_name || !signer_email) {
      return NextResponse.json({ error: 'document_id, signer_name and signer_email are required' }, { status: 400 });
    }

    const token = crypto.randomUUID();
    const supabase = getSupabase();

    const { data, error } = await (supabase
      .from('signatures') as any)
      .insert({
        agency_id: 'ag-001',
        operation_id: null,
        document_id,
        title: document_name || `Firma biométrica - ${document_id}`,
        type: 'biometric',
        status: 'enviado',
        signer_name,
        signer_email,
        token,
        hash_documento: crypto.createHash('sha256').update(document_id + Date.now()).digest('hex'),
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Signature API] Error creating signature:', error);
      return NextResponse.json({ error: 'Failed to create signature request' }, { status: 500 });
    }

    const sig = data as any;

    return NextResponse.json({
      success: true,
      id: sig.id,
      token: sig.token,
      signature_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://realestate.neurona.site'}/signature/${sig.id}?token=${sig.token}`,
    });
  } catch (err) {
    console.error('[Signature API] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

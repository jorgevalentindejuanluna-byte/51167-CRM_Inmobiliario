import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Signature ID is required' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();

    const { data, error } = await (supabase
      .from('signatures') as any)
      .select('id, title, type, status, signer_name, signer_id, signer_email, document_id, operation_id, token, created_at, expires_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    const sig = data as any;

    // Si la firma tiene token, validarlo contra el query param
    if (sig.token) {
      const { searchParams } = new URL(request.url);
      const providedToken = searchParams.get('token');
      if (!providedToken || providedToken !== sig.token) {
        return NextResponse.json({ error: 'Invalid or missing token' }, { status: 403 });
      }
    }

    if (sig.status !== 'borrador' && sig.status !== 'enviado') {
      return NextResponse.json({ error: 'Signature already completed or expired' }, { status: 410 });
    }

    let documentInfo: Record<string, unknown> | null = null;
    if (sig.document_id) {
      const { data: doc } = await (supabase
        .from('documents') as any)
        .select('id, name, type, url, created_at')
        .eq('id', sig.document_id)
        .single();
      documentInfo = doc;
    }

    return NextResponse.json({
      id: sig.id,
      title: sig.title,
      type: sig.type,
      signer_name: sig.signer_name,
      signer_id: sig.signer_id,
      signer_email: sig.signer_email,
      document: documentInfo,
      created_at: sig.created_at,
      expires_at: sig.expires_at,
    });
  } catch (err) {
    console.error('[Signature API] Error fetching signature:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Signature ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const validStatuses = ['cancelado', 'enviado', 'borrador'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { error } = await (supabase
      .from('signatures') as any)
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('[Signature API] Error updating signature status:', error);
      return NextResponse.json({ error: error.message || 'Failed to update signature' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Signature API] Error in PATCH:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

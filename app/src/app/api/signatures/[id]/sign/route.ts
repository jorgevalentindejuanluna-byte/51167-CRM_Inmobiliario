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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Signature ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { strokes, signer_id, signer_email } = body;

    if (!strokes || !Array.isArray(strokes) || strokes.length < 2) {
      return NextResponse.json({ error: 'Invalid signature data: at least 2 stroke points required' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: existing, error: fetchError } = await (supabase
      .from('signatures') as any)
      .select('id, status, signer_name, signer_id, hash_documento')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    const sig = existing as any;

    if (sig.status !== 'borrador' && sig.status !== 'enviado') {
      return NextResponse.json({ error: 'Signature already completed or expired' }, { status: 410 });
    }

    const biometricAnalysis = analyzeBiometricData(strokes);
    const hashFirmado = crypto
      .createHash('sha256')
      .update(JSON.stringify({ strokes: strokes.slice(0, 50), timestamp: Date.now() }))
      .digest('hex');

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const browserInfo = request.headers.get('user-agent') || 'unknown';

    const { error: updateError } = await (supabase
      .from('signatures') as any)
      .update({
        status: 'firmado',
        signer_id: signer_id || sig.signer_id,
        signer_email: signer_email || undefined,
        biometric_data: {
          strokes: strokes.slice(0, 100),
          analysis: biometricAnalysis,
        },
        hash_firmado: `sha256:${hashFirmado}`,
        ip_address: ipAddress,
        browser_info: browserInfo,
        location_data: {},
        signed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('[Signature API] Error updating signature:', updateError);
      return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      biometric_summary: {
        strokes_count: biometricAnalysis.strokesCount,
        average_speed: `${biometricAnalysis.averageSpeed} px/s`,
        average_pressure: `${(biometricAnalysis.averagePressure * 100).toFixed(0)}%`,
        max_pressure: `${(biometricAnalysis.maxPressure * 100).toFixed(0)}%`,
        duration_ms: biometricAnalysis.durationMs,
        device: biometricAnalysis.device,
      },
      document: {
        hash_original: sig.hash_documento || 'N/A',
        hash_firmado: `sha256:${hashFirmado}`,
        signed_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[Signature API] Error signing:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface StrokePoint {
  x: number;
  y: number;
  t: number;
  p?: number;
}

function analyzeBiometricData(strokes: StrokePoint[]) {
  if (strokes.length < 2) {
    return {
      strokesCount: strokes.length,
      averagePressure: 0.5,
      maxPressure: 0.5,
      averageSpeed: 0,
      durationMs: 0,
      device: 'unknown',
    };
  }

  let totalDistance = 0;
  let totalTime = 0;
  let totalPressure = 0;
  let maxPressure = 0;

  for (let i = 1; i < strokes.length; i++) {
    const p1 = strokes[i - 1];
    const p2 = strokes[i];

    const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    const time = p2.t - p1.t;

    totalDistance += dist;
    totalTime += time > 0 ? time : 1;
    const pressure = p2.p || 0.5;
    totalPressure += pressure;
    if (pressure > maxPressure) maxPressure = pressure;
  }

  const avgSpeed = totalDistance / (totalTime / 1000);
  const avgPressure = totalPressure / strokes.length;
  const durationMs = strokes[strokes.length - 1].t - strokes[0].t;

  return {
    strokesCount: strokes.length,
    averagePressure: parseFloat(avgPressure.toFixed(2)),
    maxPressure: parseFloat(maxPressure.toFixed(2)),
    averageSpeed: parseFloat(avgSpeed.toFixed(1)),
    durationMs,
    device: 'tablet',
  };
}

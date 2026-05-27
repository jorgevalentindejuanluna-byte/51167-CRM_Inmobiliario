import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
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
    const { strokes, signer_id, signer_email, signature_image } = body;

    if (!strokes || !Array.isArray(strokes) || strokes.length < 2) {
      return NextResponse.json({ error: 'Invalid signature data: at least 2 stroke points required' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: existing, error: fetchError } = await (supabase
      .from('signatures') as any)
      .select('id, status, signer_name, signer_id, hash_documento, document_id, signed_url_expiry_years')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    const sig = existing as any;
    if (sig.status !== 'borrador' && sig.status !== 'enviado') {
      return NextResponse.json({ error: 'Signature already completed or expired' }, { status: 410 });
    }

    const urlExpiryYears = Math.max(1, Math.min(99, Number(sig.signed_url_expiry_years) || 5));
    const urlExpirySeconds = urlExpiryYears * 365 * 24 * 60 * 60;

    // Analysis
    const biometricAnalysis = analyzeBiometricData(strokes);
    const hashFirmado = crypto
      .createHash('sha256')
      .update(JSON.stringify({ strokes: strokes.slice(0, 50), timestamp: Date.now() }))
      .digest('hex');

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const browserInfo = request.headers.get('user-agent') || 'unknown';
    const signedAt = new Date().toISOString();

    // Upload signature image to storage
    let signatureImageUrl = '';
    if (signature_image) {
      try {
        const base64Data = signature_image.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const imagePath = `signatures/${id}_${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(imagePath, buffer, { contentType: 'image/png', upsert: true });
        if (!uploadError) {
          const { data: signed } = await supabase.storage.from('documents').createSignedUrl(imagePath, urlExpirySeconds);
          if (signed) signatureImageUrl = signed.signedUrl;
        }
      } catch (e) {
        console.warn('[Signature] Could not upload signature image:', e);
      }
    }

    // Fetch document info
    let documentId = sig.document_id as string | null;
    let docRecord: any = null;
    if (documentId) {
      const { data: doc } = await (supabase.from('documents') as any)
        .select('id, name, url, lead_id, property_id, operation_id, metadata')
        .eq('id', documentId)
        .single();
      docRecord = doc;
    }

    // Generate signed document PDF
    let signedDocUrl = '';

    async function addSecurityPage(pdfDoc: PDFDocument, font: any, fontBold: any) {
      let sigImage: any = null;
      if (signatureImageUrl) {
        const sigImageBytes = await fetch(signatureImageUrl).then(r => r.arrayBuffer());
        try { sigImage = await pdfDoc.embedPng(sigImageBytes); } catch { sigImage = await pdfDoc.embedJpg(sigImageBytes); }
      }

      const page = pdfDoc.addPage([595, 842]);
      let y = 810;

      page.drawText('DOCUMENTO FIRMADO ELECTRÓNICAMENTE', { x: 50, y, size: 16, font: fontBold, color: rgb(0.13, 0.13, 0.13) });
      y -= 30;
      page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
      y -= 25;

      if (sigImage) {
        const dims = sigImage.scale(0.6);
        page.drawImage(sigImage, { x: 50, y: y - dims.height, width: dims.width, height: dims.height });
        y -= dims.height + 20;
      }

      const lines: [string, string][] = [
        ['Firmante:', sig.signer_name || 'N/A'],
        ['Fecha:', new Date(signedAt).toLocaleString('es-ES')],
        ['IP:', ipAddress],
        ['Dispositivo:', browserInfo.slice(0, 80)],
        ['', ''],
        ['Hash Original:', sig.hash_documento || 'N/A'],
        ['Hash Firma:', `sha256:${hashFirmado}`],
        ['', ''],
        ['Trazo (pts):', `${biometricAnalysis.strokesCount}`],
        ['Velocidad:', `${biometricAnalysis.averageSpeed} px/s`],
        ['Presión media:', `${(biometricAnalysis.averagePressure * 100).toFixed(0)}%`],
        ['Presión máx:', `${(biometricAnalysis.maxPressure * 100).toFixed(0)}%`],
        ['Duración:', `${biometricAnalysis.durationMs} ms`],
        ['', ''],
        ['Estándar:', 'eIDAS (UE) 910/2014'],
      ];

      for (const [l, v] of lines) {
        if (!l && !v) { y -= 10; continue; }
        if (l) {
          page.drawText(l, { x: 70, y, size: l.includes('Hash') ? 9 : 10, font: l.includes('Hash') || l.includes('Estándar') ? fontBold : font, color: rgb(0.13, 0.13, 0.13) });
        }
        if (v) {
          const vx = l.includes('Hash') || l.includes('Estándar') ? 70 : 180;
          page.drawText(v, { x: vx, y, size: l.includes('Hash') ? 9 : 10, font, color: l.includes('Hash') ? rgb(0.3, 0.3, 0.3) : rgb(0.13, 0.13, 0.13) });
        }
        y -= l.includes('Hash') ? 22 : 18;
      }
    }

    try {
      let pdfDoc: PDFDocument;
      if (docRecord?.url && docRecord.url.startsWith('http')) {
        const originalPdfBytes = await fetch(docRecord.url).then(r => r.arrayBuffer());
        pdfDoc = await PDFDocument.load(originalPdfBytes);
      } else {
        pdfDoc = await PDFDocument.create();
      }

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      await addSecurityPage(pdfDoc, font, fontBold);

      const signedPdfBytes = await pdfDoc.save();
      const signedPath = `signed/${docRecord?.id || id}_signed_${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage
        .from('documents')
        .upload(signedPath, Buffer.from(signedPdfBytes), { contentType: 'application/pdf', upsert: true });
      if (!upErr) {
        const { data: signed } = await supabase.storage.from('documents').createSignedUrl(signedPath, urlExpirySeconds);
        if (signed) signedDocUrl = signed.signedUrl;
      }
    } catch (pdfErr) {
      console.warn('[Signature] PDF generation failed:', pdfErr);
    }

    // Update signature record
    const updatePayload: Record<string, any> = {
      status: 'firmado',
      signer_id: signer_id || sig.signer_id,
      biometric_data: { strokes: strokes.slice(0, 100), analysis: biometricAnalysis },
      signature_image_url: signatureImageUrl,
      signed_document_url: signedDocUrl,
      hash_firmado: `sha256:${hashFirmado}`,
      ip_address: ipAddress,
      browser_info: browserInfo,
      location_data: {},
      signed_at: signedAt,
    };
    const emailVal = signer_email || sig.signer_email;
    if (emailVal) updatePayload.signer_email = emailVal;

    const { error: updateError } = await (supabase.from('signatures') as any)
      .update(updatePayload)
      .eq('id', id);

    if (updateError) {
      console.error('[Signature API] Error updating signature:', JSON.stringify(updateError));
      return NextResponse.json({ error: updateError?.message || updateError?.toString() || 'Failed to save signature' }, { status: 500 });
    }

    // Update document record in CRM
    if (docRecord) {
      const certificate = {
        signed_at: signedAt,
        hash_original: sig.hash_documento || 'N/A',
        hash_firmado: `sha256:${hashFirmado}`,
        ip_address: ipAddress,
        browser_info: browserInfo.slice(0, 200),
        biometric_summary: {
          strokes_count: biometricAnalysis.strokesCount,
          avg_speed: `${biometricAnalysis.averageSpeed} px/s`,
          avg_pressure: `${(biometricAnalysis.averagePressure * 100).toFixed(0)}%`,
          max_pressure: `${(biometricAnalysis.maxPressure * 100).toFixed(0)}%`,
          duration_ms: biometricAnalysis.durationMs,
        },
        firmante: sig.signer_name || '',
      };

      const updatedMetadata = {
        ...(docRecord.metadata || {}),
        signatures: {
          status: 'firmado_biometricamente',
          firmante: sig.signer_name || '',
          signed_at: signedAt,
          hash_documento: sig.hash_documento || 'N/A',
          hash_firmado: `sha256:${hashFirmado}`,
          signature_image_url: signatureImageUrl,
          signed_document_url: signedDocUrl,
          certificate,
        },
      };

      await (supabase.from('documents') as any)
        .update({
          status: 'aprobado',
          metadata: updatedMetadata,
          url: signedDocUrl || docRecord.url,
          updated_at: signedAt,
        })
        .eq('id', documentId);

      // Create activity log for lead or property
      const activityNote = `Firma biométrica completada por ${sig.signer_name || 'el firmante'}. Certificado de autenticidad generado.`;
      const activityId = crypto.randomUUID();

      if (docRecord.lead_id) {
        await supabase.from('activities').insert({
          id: activityId,
          agency_id: 'ag-001',
          lead_id: docRecord.lead_id,
          tipo: 'email',
          descripcion: activityNote,
          metadata: { signature_id: id, document_id: documentId, signed_document_url: signedDocUrl },
          created_at: signedAt,
          updated_at: signedAt,
        }).maybeSingle();
      }

      if (docRecord.property_id) {
        await supabase.from('activities').insert({
          id: crypto.randomUUID(),
          agency_id: 'ag-001',
          property_id: docRecord.property_id,
          tipo: 'email',
          descripcion: activityNote,
          metadata: { signature_id: id, document_id: documentId, signed_document_url: signedDocUrl },
          created_at: signedAt,
          updated_at: signedAt,
        }).maybeSingle();
      }
    }

    return NextResponse.json({
      success: true,
      signed_document_url: signedDocUrl,
      signature_image_url: signatureImageUrl,
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
        signed_at: signedAt,
      },
    });
  } catch (err: any) {
    console.error('[Signature API] Error signing:', err);
    return NextResponse.json({ error: err?.message || err?.toString() || 'Internal server error' }, { status: 500 });
  }
}

interface StrokePoint { x: number; y: number; t: number; p?: number; }

function analyzeBiometricData(strokes: StrokePoint[]) {
  if (strokes.length < 2) {
    return { strokesCount: strokes.length, averagePressure: 0.5, maxPressure: 0.5, averageSpeed: 0, durationMs: 0, device: 'unknown' };
  }
  let totalDistance = 0, totalTime = 0, totalPressure = 0, maxPressure = 0;
  for (let i = 1; i < strokes.length; i++) {
    const p1 = strokes[i - 1], p2 = strokes[i];
    totalDistance += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    totalTime += p2.t - p1.t > 0 ? p2.t - p1.t : 1;
    const pressure = p2.p || 0.5;
    totalPressure += pressure;
    if (pressure > maxPressure) maxPressure = pressure;
  }
  return {
    strokesCount: strokes.length,
    averagePressure: parseFloat((totalPressure / strokes.length).toFixed(2)),
    maxPressure: parseFloat(maxPressure.toFixed(2)),
    averageSpeed: parseFloat((totalDistance / (totalTime / 1000)).toFixed(1)),
    durationMs: strokes[strokes.length - 1].t - strokes[0].t,
    device: 'tablet',
  };
}

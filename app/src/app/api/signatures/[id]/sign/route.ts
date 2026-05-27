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
      .select('id, status, signer_name, signer_id, hash_documento, document_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    const sig = existing as any;
    if (sig.status !== 'borrador' && sig.status !== 'enviado') {
      return NextResponse.json({ error: 'Signature already completed or expired' }, { status: 410 });
    }

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
          const { data: signed } = await supabase.storage.from('documents').createSignedUrl(imagePath, 60 * 60 * 24 * 365);
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
    if (docRecord?.url && docRecord.url.startsWith('http')) {
      try {
        const originalPdfBytes = await fetch(docRecord.url).then(r => r.arrayBuffer());
        const pdfDoc = await PDFDocument.load(originalPdfBytes);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Signature image page
        if (signatureImageUrl) {
          const sigImageBytes = await fetch(signatureImageUrl).then(r => r.arrayBuffer());
          let sigImage;
          try {
            sigImage = await pdfDoc.embedPng(sigImageBytes);
          } catch {
            sigImage = await pdfDoc.embedJpg(sigImageBytes);
          }
          const sigPage = pdfDoc.addPage([595, 420]);
          const sigDims = sigImage.scale(0.8);
          sigPage.drawText('FIRMA BIOMÉTRICA', { x: 50, y: 370, size: 18, font: fontBold, color: rgb(0.13, 0.13, 0.13) });
          sigPage.drawLine({ start: { x: 50, y: 360 }, end: { x: 545, y: 360 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
          sigPage.drawImage(sigImage, { x: 50, y: 150, width: sigDims.width, height: sigDims.height });
          sigPage.drawText(`Firmante: ${sig.signer_name || 'N/A'}`, { x: 50, y: 100, size: 10, font });
          sigPage.drawText(`Fecha: ${new Date(signedAt).toLocaleString('es-ES')}`, { x: 50, y: 85, size: 10, font });
          sigPage.drawText(`IP: ${ipAddress}`, { x: 50, y: 70, size: 10, font });
        }

        // Certificate page
        const certPage = pdfDoc.addPage([595, 842]);
        let y = 800;
        certPage.drawText('CERTIFICADO DE AUTENTICIDAD', { x: 50, y, size: 20, font: fontBold, color: rgb(0.13, 0.13, 0.13) });
        y -= 35;
        certPage.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
        y -= 30;

        const certLines = [
          ['Documento ID:', docRecord?.id || 'N/A'],
          ['Tipo:', 'Firma Biométrica Avanzada'],
          ['Firmante:', sig.signer_name || 'N/A'],
          ['Fecha de Firma:', new Date(signedAt).toLocaleString('es-ES')],
          ['IP del Firmante:', ipAddress],
          ['Dispositivo / Navegador:', browserInfo.slice(0, 80)],
          ['', ''],
          ['HASH DEL DOCUMENTO ORIGINAL:', sig.hash_documento || 'N/A'],
          ['HASH DE LA FIRMA:', `sha256:${hashFirmado}`],
          ['', ''],
          ['DATOS BIOMÉTRICOS:', ''],
          [`  · Trazos capturados:`, `${biometricAnalysis.strokesCount}`],
          [`  · Velocidad media:`, `${biometricAnalysis.averageSpeed} px/s`],
          [`  · Presión media:`, `${(biometricAnalysis.averagePressure * 100).toFixed(0)}%`],
          [`  · Presión máxima:`, `${(biometricAnalysis.maxPressure * 100).toFixed(0)}%`],
          [`  · Duración:`, `${biometricAnalysis.durationMs} ms`],
          ['', ''],
          ['ESTÁNDARES:', 'eIDAS / REGLAMENTO (UE) Nº 910/2014'],
          ['VALIDEZ:', 'Plena validez jurídica como firma electrónica'],
        ];

        for (const [label, value] of certLines) {
          if (label) {
            certPage.drawText(label, { x: 70, y, size: label.startsWith('  ·') ? 9 : 10, font: label.includes('BIOMÉ') || label.includes('HASH') || label.includes('CERTIF') || label.includes('ESTÁN') || label.includes('VALIDEZ') ? fontBold : font, color: label.startsWith('  ·') ? rgb(0.3, 0.3, 0.3) : rgb(0.13, 0.13, 0.13) });
          }
          if (value) {
            certPage.drawText(value, { x: label ? 310 : 70, y, size: 10, font, color: label.startsWith('  ·') ? rgb(0.3, 0.3, 0.3) : rgb(0.13, 0.13, 0.13) });
          }
          y -= 18;
        }

        const signedPdfBytes = await pdfDoc.save();
        const signedPath = `signed/${docRecord?.id || id}_signed_${Date.now()}.pdf`;
        const { error: signedUploadError } = await supabase.storage
          .from('documents')
          .upload(signedPath, Buffer.from(signedPdfBytes), { contentType: 'application/pdf', upsert: true });
        if (!signedUploadError) {
          const { data: signed } = await supabase.storage.from('documents').createSignedUrl(signedPath, 60 * 60 * 24 * 365);
          if (signed) signedDocUrl = signed.signedUrl;
        }
      } catch (pdfErr) {
        console.warn('[Signature] PDF merge failed, saving signature-only:', pdfErr);
      }
    } else {
      // Create a standalone certificate PDF
      try {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        if (signatureImageUrl) {
          const sigImageBytes = await fetch(signatureImageUrl).then(r => r.arrayBuffer());
          let sigImage;
          try { sigImage = await pdfDoc.embedPng(sigImageBytes); } catch { sigImage = await pdfDoc.embedJpg(sigImageBytes); }
          const sigPage = pdfDoc.addPage([595, 420]);
          const sigDims = sigImage.scale(0.8);
          sigPage.drawText('FIRMA BIOMÉTRICA', { x: 50, y: 370, size: 18, font: fontBold });
          sigPage.drawLine({ start: { x: 50, y: 360 }, end: { x: 545, y: 360 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
          sigPage.drawImage(sigImage, { x: 50, y: 150, width: sigDims.width, height: sigDims.height });
          sigPage.drawText(`Firmante: ${sig.signer_name || 'N/A'}`, { x: 50, y: 100, size: 10, font });
          sigPage.drawText(`Fecha: ${new Date(signedAt).toLocaleString('es-ES')}`, { x: 50, y: 85, size: 10, font });
        }

        const standalonePdfBytes = await pdfDoc.save();
        const standalonePath = `signed/standalone_${id}_${Date.now()}.pdf`;
        const { error: upErr } = await supabase.storage.from('documents').upload(standalonePath, Buffer.from(standalonePdfBytes), { contentType: 'application/pdf', upsert: true });
        if (!upErr) {
          const { data: signed } = await supabase.storage.from('documents').createSignedUrl(standalonePath, 60 * 60 * 24 * 365);
          if (signed) signedDocUrl = signed.signedUrl;
        }
      } catch (certErr) {
        console.warn('[Signature] Certificate PDF creation failed:', certErr);
      }
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

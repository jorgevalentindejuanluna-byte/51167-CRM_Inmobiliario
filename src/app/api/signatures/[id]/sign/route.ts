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
        try {
          const sigImageBytes = await fetch(signatureImageUrl).then(r => r.arrayBuffer());
          try { sigImage = await pdfDoc.embedPng(sigImageBytes); } catch { sigImage = await pdfDoc.embedJpg(sigImageBytes); }
        } catch { /* ignore img */ }
      }

      const pages = pdfDoc.getPages();
      if (pages.length === 0) {
        pdfDoc.addPage([595, 842]);
        pages.push(pages[pages.length - 1]);
      }

      for (const page of pages) {
        const { width } = page.getSize();
        const boxW = Math.min(width - 40, 500);
        const boxX = (width - boxW) / 2;
        const boxY = 18;
        const boxH = 85;

        page.drawRectangle({
          x: boxX, y: boxY, width: boxW, height: boxH,
          borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5, color: rgb(0.98, 0.98, 0.98)
        });

        let currentY = boxY + boxH - 15;

        page.drawText('FIRMADO ELECTRÓNICAMENTE (eIDAS 910/2014)', {
          x: boxX + 8, y: currentY, size: 8, font: fontBold, color: rgb(0.13, 0.13, 0.13)
        });
        currentY -= 14;

        page.drawText(`Firmante: ${sig.signer_name || 'N/A'}`, {
          x: boxX + 8, y: currentY, size: 7, font
        });
        currentY -= 10;

        page.drawText(`Fecha: ${new Date(signedAt).toLocaleString('es-ES')} — IP: ${ipAddress}`, {
          x: boxX + 8, y: currentY, size: 7, font
        });
        currentY -= 10;

        page.drawText(`Dispositivo: ${biometricAnalysis.device}`, {
          x: boxX + 8, y: currentY, size: 7, font
        });
        currentY -= 12;

        page.drawText(`Hash: sha256:${hashFirmado.substring(0, 24)}...`, {
          x: boxX + 8, y: currentY, size: 6, font: fontBold, color: rgb(0.3, 0.3, 0.3)
        });

        if (sigImage) {
          const dims = sigImage.scaleToFit(110, boxH - 5);
          page.drawImage(sigImage, {
            x: boxX + boxW - dims.width - 6, y: boxY + 4,
            width: dims.width, height: dims.height
          });
        }
      }
    }

    let signedPdfBytesFinal: Uint8Array | undefined;
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
      signedPdfBytesFinal = signedPdfBytes;
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

    if (emailVal && signedPdfBytesFinal) {
      try {
        const { sendEmailViaSmtp } = await import('@/lib/email-service');
        const fileName = (docRecord?.name || 'Documento_Firmado').replace(/[^a-zA-Z0-9_\-\.]/g, '_');
        
        let subjectName = sig.signer_name || 'Firmante';
        if (docRecord?.lead_id) {
          const { data: leadData } = await supabase.from('leads').select('first_name, last_name, name').eq('id', docRecord.lead_id).single();
          if (leadData) {
            const firstName = leadData.first_name || leadData.name || '';
            const lastName = leadData.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();
            if (fullName) subjectName = fullName;
          }
        }

        const subject = `${subjectName} - Gracias por su firma del documento: ${docRecord?.name || 'Documento'}`;
        const bodyText = `Estimado/a ${subjectName},\n\nGracias por firmar el documento.\n\nAdjuntamos una copia de su documento firmado electrónicamente, así como la hoja de confirmación de validez jurídica de los datos de la firma.\n\nUn cordial saludo.`;

        // Generar Hoja de Confirmación (Certificado)
        const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
        const certPdf = await PDFDocument.create();
        const certPage = certPdf.addPage([595.28, 841.89]);
        const fBold = await certPdf.embedFont(StandardFonts.HelveticaBold);
        const fNormal = await certPdf.embedFont(StandardFonts.Helvetica);
        
        let y = 780;
        const drawText = (text: string, font: any, size: number, color = rgb(0,0,0)) => {
          certPage.drawText(text, { x: 50, y, size, font, color });
          y -= (size + 8);
        };

        drawText('HOJA DE CONFIRMACIÓN DE VALIDEZ JURÍDICA', fBold, 16);
        y -= 10;
        drawText('Identificación del Firmante:', fBold, 12);
        drawText(`Nombre: ${sig.signer_name || subjectName}`, fNormal, 10);
        drawText(`Email de contacto: ${emailVal}`, fNormal, 10);
        drawText(`IP: ${sig.ip_address || 'No registrada'}`, fNormal, 10);
        drawText(`User Agent: ${sig.user_agent || 'No registrado'}`, fNormal, 10);
        y -= 10;
        drawText('Datos del Documento:', fBold, 12);
        drawText(`Documento: ${docRecord?.name || 'Documento'}`, fNormal, 10);
        drawText(`Fecha de Firma: ${new Date(signedAt).toLocaleString('es-ES')}`, fNormal, 10);
        drawText(`Hash Original (SHA-256):`, fNormal, 10);
        drawText(sig.hash_documento || 'N/A', fNormal, 8, rgb(0.3, 0.3, 0.3));
        drawText(`Hash Firmado (SHA-256):`, fNormal, 10);
        drawText(hashFirmado, fNormal, 8, rgb(0.3, 0.3, 0.3));
        y -= 10;
        drawText('Datos Biométricos Capturados:', fBold, 12);
        drawText(`Trazos (Strokes): ${biometricAnalysis.strokesCount}`, fNormal, 10);
        drawText(`Duración de firma: ${biometricAnalysis.durationMs} ms`, fNormal, 10);
        drawText(`Velocidad Media: ${biometricAnalysis.averageSpeed.toFixed(2)} px/ms`, fNormal, 10);
        drawText(`Presión Media: ${(biometricAnalysis.averagePressure * 100).toFixed(0)}%`, fNormal, 10);
        drawText(`Dispositivo Captura: ${biometricAnalysis.device}`, fNormal, 10);

        const certBytes = await certPdf.save();

        await sendEmailViaSmtp({
          to: [{ name: subjectName, email: emailVal }],
          subject,
          bodyText,
          attachments: [
            {
               filename: `${fileName}.pdf`,
               content: Buffer.from(signedPdfBytesFinal),
               contentType: 'application/pdf'
            },
            {
               filename: `Confirmacion_Validez_${fileName}.pdf`,
               content: Buffer.from(certBytes),
               contentType: 'application/pdf'
            }
          ]
        });
      } catch (mailErr) {
        console.warn('[Signature API] Error enviando email de confirmación:', mailErr);
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

'use server';

import crypto from 'crypto';
import { sendEmailViaSmtp } from '@/lib/email-service';

export async function sendLoginOtp(email: string, name: string = 'Usuario') {
  // Generar código de 6 dígitos numéricos
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Crear hash SHA-256 del OTP para validación segura en el frontend
  const hash = crypto.createHash('sha256').update(otp).digest('hex');

  const subject = `Código de seguridad para acceso al CRM: ${otp}`;
  const bodyText = `Hola ${name},\n\nTu código de acceso de 6 dígitos para entrar al CRM Real Top State es:\n\n${otp}\n\nIntroduce este código en la pantalla de inicio de sesión para acceder a tu cuenta.\nSi no has solicitado este acceso, puedes ignorar este mensaje.\n\nUn saludo,\nEquipo de Seguridad`;

  try {
    await sendEmailViaSmtp({
      to: [{ name, email }],
      subject,
      bodyText,
    });
    
    return { success: true, hash };
  } catch (error: any) {
    console.error('Error enviando OTP:', error);
    return { success: false, error: 'No se pudo enviar el código de acceso al email.' };
  }
}

export async function toggleMfa(enabled: boolean, token: string) {
  try {
    const { supabaseUpdateUser } = await import('@/lib/supabase');
    const result = await supabaseUpdateUser(token, { mfa_enabled: enabled });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar configuración de seguridad' };
  }
}


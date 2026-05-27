-- Migration 02: Add missing columns for biometric signature flow
-- Ejecutar en el SQL Editor de Supabase (proyecto producción)

-- Añadir columnas biométricas a signatures
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS biometric_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS hash_documento TEXT;
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS hash_firmado TEXT;
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS browser_info TEXT;
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS location_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;

-- Añadir updated_at a documents (si no existe)
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Verificar columnas actuales
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'signatures'
ORDER BY ordinal_position;

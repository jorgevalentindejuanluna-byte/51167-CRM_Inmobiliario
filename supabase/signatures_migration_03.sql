-- Migration 03: Añadir columna signed_url_expiry_years
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS signed_url_expiry_years INTEGER DEFAULT 5;

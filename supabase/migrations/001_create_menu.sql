-- =============================================================================
-- Migración 001: Crear tabla menu y políticas RLS
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.menu (
  id    BIGSERIAL       PRIMARY KEY,
  name  TEXT            NOT NULL,
  price NUMERIC(10, 2)  NOT NULL CHECK (price > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;

-- Lectura pública: cualquier usuario (incluso anónimo) puede leer el menú
CREATE POLICY "menu_select_public" ON public.menu
  FOR SELECT
  USING (true);

-- Inserción restringida: solo usuarios autenticados pueden agregar platos
CREATE POLICY "menu_insert_authenticated" ON public.menu
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- (Opcional) Datos de ejemplo para arrancar el menú
-- INSERT INTO public.menu (name, price) VALUES
--   ('Pasta Carbonara',   12.50),
--   ('Pizza Margherita',  11.00),
--   ('Ensalada César',     8.50),
--   ('Tiramisú',           5.00);

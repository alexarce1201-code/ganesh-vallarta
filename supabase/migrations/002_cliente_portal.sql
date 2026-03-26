-- ================================================
-- Oscar Salcedo Coach App — Cliente Portal v2.0
-- Ejecutar en Supabase SQL Editor
-- ================================================

-- ------------------------------------------------
-- 1. Add auth_user_id to clientes
-- ------------------------------------------------
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id);

-- ------------------------------------------------
-- 2. Add body measurement columns to progreso
-- ------------------------------------------------
ALTER TABLE progreso ADD COLUMN IF NOT EXISTS cintura numeric(5,1);
ALTER TABLE progreso ADD COLUMN IF NOT EXISTS cadera  numeric(5,1);
ALTER TABLE progreso ADD COLUMN IF NOT EXISTS pecho   numeric(5,1);
ALTER TABLE progreso ADD COLUMN IF NOT EXISTS brazo   numeric(5,1);

-- ------------------------------------------------
-- 3. Update handle_new_user trigger → default role = 'cliente'
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, role) VALUES (new.id, 'cliente');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------
-- 4. Admin helper function
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS bool AS $$
  SELECT role = 'admin' FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------------------------------------
-- 5. Enable RLS on all tables
-- ------------------------------------------------
ALTER TABLE clientes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE dietas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE comidas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots        ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------
-- 6. Drop existing policies (idempotent re-run)
-- ------------------------------------------------
DROP POLICY IF EXISTS "admin_all_clientes"      ON clientes;
DROP POLICY IF EXISTS "cliente_select_clientes"  ON clientes;

DROP POLICY IF EXISTS "admin_all_asignaciones"   ON asignaciones;
DROP POLICY IF EXISTS "cliente_select_asignaciones" ON asignaciones;

DROP POLICY IF EXISTS "admin_all_dietas"         ON dietas;
DROP POLICY IF EXISTS "cliente_select_dietas"    ON dietas;

DROP POLICY IF EXISTS "admin_all_comidas"        ON comidas;
DROP POLICY IF EXISTS "cliente_select_comidas"   ON comidas;

DROP POLICY IF EXISTS "admin_all_progreso"       ON progreso;
DROP POLICY IF EXISTS "cliente_select_progreso"  ON progreso;
DROP POLICY IF EXISTS "cliente_insert_progreso"  ON progreso;

DROP POLICY IF EXISTS "admin_all_mensajes"       ON mensajes;
DROP POLICY IF EXISTS "cliente_select_mensajes"  ON mensajes;
DROP POLICY IF EXISTS "cliente_update_mensajes"  ON mensajes;

DROP POLICY IF EXISTS "admin_all_pagos"          ON pagos;
DROP POLICY IF EXISTS "cliente_select_pagos"     ON pagos;

DROP POLICY IF EXISTS "admin_all_slots"          ON slots;
DROP POLICY IF EXISTS "auth_select_slots"        ON slots;

-- ------------------------------------------------
-- 7. RLS Policies
-- ------------------------------------------------

-- SLOTS: admin all, any authenticated user can read
CREATE POLICY "admin_all_slots"   ON slots FOR ALL    USING (is_admin());
CREATE POLICY "auth_select_slots" ON slots FOR SELECT USING (auth.uid() IS NOT NULL);

-- CLIENTES
CREATE POLICY "admin_all_clientes"
  ON clientes FOR ALL USING (is_admin());

CREATE POLICY "cliente_select_clientes"
  ON clientes FOR SELECT
  USING (auth_user_id = auth.uid());

-- ASIGNACIONES
CREATE POLICY "admin_all_asignaciones"
  ON asignaciones FOR ALL USING (is_admin());

CREATE POLICY "cliente_select_asignaciones"
  ON asignaciones FOR SELECT
  USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE auth_user_id = auth.uid()
    )
  );

-- DIETAS
CREATE POLICY "admin_all_dietas"
  ON dietas FOR ALL USING (is_admin());

CREATE POLICY "cliente_select_dietas"
  ON dietas FOR SELECT
  USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE auth_user_id = auth.uid()
    )
  );

-- COMIDAS
CREATE POLICY "admin_all_comidas"
  ON comidas FOR ALL USING (is_admin());

CREATE POLICY "cliente_select_comidas"
  ON comidas FOR SELECT
  USING (
    dieta_id IN (
      SELECT d.id FROM dietas d
      JOIN clientes c ON c.id = d.cliente_id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- PROGRESO
CREATE POLICY "admin_all_progreso"
  ON progreso FOR ALL USING (is_admin());

CREATE POLICY "cliente_select_progreso"
  ON progreso FOR SELECT
  USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "cliente_insert_progreso"
  ON progreso FOR INSERT
  WITH CHECK (
    cliente_id IN (
      SELECT id FROM clientes WHERE auth_user_id = auth.uid()
    )
  );

-- MENSAJES
CREATE POLICY "admin_all_mensajes"
  ON mensajes FOR ALL USING (is_admin());

CREATE POLICY "cliente_select_mensajes"
  ON mensajes FOR SELECT
  USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "cliente_update_mensajes"
  ON mensajes FOR UPDATE
  USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE auth_user_id = auth.uid()
    )
  );

-- PAGOS
CREATE POLICY "admin_all_pagos"
  ON pagos FOR ALL USING (is_admin());

CREATE POLICY "cliente_select_pagos"
  ON pagos FOR SELECT
  USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE auth_user_id = auth.uid()
    )
  );

-- 004_reservas.sql
-- Modelo nuevo de reservas para box CrossFit
--   - Reemplaza el modelo viejo "asignaciones por semana" con "reservas por fecha"
--   - Cada slot tiene capacidad 15 (configurable)
--   - Solo días Lunes a Viernes (constraint a nivel DB)

-- 1. Drop modelo viejo
DROP TABLE IF EXISTS asignaciones CASCADE;
DROP TABLE IF EXISTS slots CASCADE;

-- 2. Slots: horarios fijos del box (mismos cada día Lun-Vie)
CREATE TABLE slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hora_inicio time NOT NULL,
  hora_fin    time NOT NULL,
  capacidad   int  NOT NULL DEFAULT 15,
  orden       int  NOT NULL,
  activo      boolean NOT NULL DEFAULT true,
  UNIQUE(hora_inicio)
);

INSERT INTO slots (hora_inicio, hora_fin, orden) VALUES
  ('06:00', '07:00', 1),
  ('07:00', '08:00', 2),
  ('08:00', '09:00', 3),
  ('17:00', '18:00', 4),
  ('18:00', '19:00', 5),
  ('19:00', '20:00', 6),
  ('20:00', '21:00', 7);

-- 3. Reservas: cliente reserva su lugar en un slot para una fecha específica
CREATE TABLE reservas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  slot_id    uuid NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  fecha      date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cliente_id, slot_id, fecha),
  CONSTRAINT reservas_lun_vie CHECK (EXTRACT(ISODOW FROM fecha) BETWEEN 1 AND 5)
);

CREATE INDEX reservas_fecha_slot_idx ON reservas (fecha, slot_id);
CREATE INDEX reservas_cliente_idx    ON reservas (cliente_id, fecha);

-- 4. Trigger atómico para validar capacidad
CREATE OR REPLACE FUNCTION check_reserva_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cap int;
  cnt int;
BEGIN
  SELECT capacidad INTO cap FROM slots WHERE id = NEW.slot_id;
  SELECT COUNT(*) INTO cnt FROM reservas
    WHERE slot_id = NEW.slot_id AND fecha = NEW.fecha;
  IF cnt >= cap THEN
    RAISE EXCEPTION 'Cupo lleno: esta clase ya tiene % reservas (máx %)', cnt, cap
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reservas_capacity_check ON reservas;
CREATE TRIGGER reservas_capacity_check
  BEFORE INSERT ON reservas
  FOR EACH ROW EXECUTE FUNCTION check_reserva_capacity();

-- 5. RLS
ALTER TABLE slots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Slots
DROP POLICY IF EXISTS "slots_read_auth" ON slots;
CREATE POLICY "slots_read_auth" ON slots
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "slots_admin_write" ON slots;
CREATE POLICY "slots_admin_write" ON slots
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Reservas
DROP POLICY IF EXISTS "reservas_admin_all" ON reservas;
CREATE POLICY "reservas_admin_all" ON reservas
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "reservas_cliente_select" ON reservas;
CREATE POLICY "reservas_cliente_select" ON reservas
  FOR SELECT
  USING (
    cliente_id IN (SELECT id FROM clientes WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "reservas_cliente_insert" ON reservas;
CREATE POLICY "reservas_cliente_insert" ON reservas
  FOR INSERT
  WITH CHECK (
    cliente_id IN (SELECT id FROM clientes WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "reservas_cliente_delete" ON reservas;
CREATE POLICY "reservas_cliente_delete" ON reservas
  FOR DELETE
  USING (
    cliente_id IN (SELECT id FROM clientes WHERE auth_user_id = auth.uid())
  );

-- 6. Función pública para disponibilidad por slot/fecha
-- (los clientes NO pueden ver reservas de otros, así que necesitamos esta función)
CREATE OR REPLACE FUNCTION slot_disponibilidad(p_fecha date)
RETURNS TABLE(slot_id uuid, ocupados int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT r.slot_id, COUNT(*)::int AS ocupados
  FROM reservas r
  WHERE r.fecha = p_fecha
  GROUP BY r.slot_id;
END;
$$;

GRANT EXECUTE ON FUNCTION slot_disponibilidad(date) TO authenticated;

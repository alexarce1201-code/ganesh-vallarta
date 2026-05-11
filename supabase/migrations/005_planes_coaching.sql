-- 005_planes_coaching.sql
-- Agrega flexibilidad al modelo de miembros:
--   - meses_plan:    cuántos meses pagó el miembro (libre, default 1)
--   - monto_mensual: cuánto paga al mes (custom por miembro, default 700)
--   - coaching_extra: si contrató coaching personalizado (datos físicos + dieta)

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS meses_plan      int     NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS monto_mensual   int     NOT NULL DEFAULT 700,
  ADD COLUMN IF NOT EXISTS coaching_extra  boolean NOT NULL DEFAULT false;

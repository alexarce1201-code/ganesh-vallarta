-- ================================================
-- Oscar Salcedo Coach App — Schema v1.0
-- Ejecutar en Supabase SQL Editor
-- ================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, role) VALUES (new.id, 'admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         text NOT NULL,
  edad           int,
  peso_inicial   numeric(5,2),
  peso_meta      numeric(5,2),
  peso_actual    numeric(5,2),
  altura         numeric(5,2),
  objetivo       text,
  condiciones    text,
  fecha_inicio   date,
  contacto       text,
  tipo           text CHECK (tipo IN ('grupal','individual')) DEFAULT 'grupal',
  activo         bool DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- Slots (seed below)
CREATE TABLE IF NOT EXISTS slots (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dia          text CHECK (dia IN ('lunes','martes','miercoles','jueves','viernes','sabado')),
  hora_inicio  time NOT NULL,
  hora_fin     time NOT NULL,
  capacidad    int DEFAULT 4,
  UNIQUE(dia, hora_inicio)
);

-- Asignaciones (cliente ↔ slot por semana)
CREATE TABLE IF NOT EXISTS asignaciones (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id    uuid REFERENCES clientes(id) ON DELETE CASCADE,
  slot_id       uuid REFERENCES slots(id) ON DELETE CASCADE,
  semana_inicio date NOT NULL,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(cliente_id, slot_id, semana_inicio)
);

-- Dietas
CREATE TABLE IF NOT EXISTS dietas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id) ON DELETE CASCADE,
  activa      bool DEFAULT true,
  notas       text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Comidas (pertenecen a una dieta)
CREATE TABLE IF NOT EXISTS comidas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dieta_id     uuid REFERENCES dietas(id) ON DELETE CASCADE,
  tipo         text CHECK (tipo IN ('desayuno','colacion_m','comida','merienda','cena')),
  orden        int DEFAULT 0,
  nombre       text NOT NULL,
  descripcion  text,
  cantidad_g   numeric(6,1),
  calorias     int,
  proteina_g   numeric(5,1),
  carbos_g     numeric(5,1),
  grasa_g      numeric(5,1)
);

-- Progreso
CREATE TABLE IF NOT EXISTS progreso (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id) ON DELETE CASCADE,
  fecha       date NOT NULL DEFAULT CURRENT_DATE,
  peso        numeric(5,2),
  nota_coach  text,
  foto_url    text,
  created_at  timestamptz DEFAULT now()
);

-- Mensajes
CREATE TABLE IF NOT EXISTS mensajes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id) ON DELETE CASCADE,
  titulo      text NOT NULL,
  cuerpo      text NOT NULL,
  leido       bool DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Pagos
CREATE TABLE IF NOT EXISTS pagos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id) ON DELETE CASCADE,
  mes         date NOT NULL,
  monto       numeric(8,2),
  estado      text CHECK (estado IN ('pagado','pendiente')) DEFAULT 'pendiente',
  tipo        text CHECK (tipo IN ('grupal','individual')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE(cliente_id, mes)
);

-- ================================================
-- Funciones de validación
-- ================================================

CREATE OR REPLACE FUNCTION clases_semana(p_cliente_id uuid, p_semana_inicio date)
RETURNS int AS $$
  SELECT COUNT(*)::int FROM asignaciones
  WHERE cliente_id = p_cliente_id AND semana_inicio = p_semana_inicio;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION ocupacion_slot(p_slot_id uuid, p_semana_inicio date)
RETURNS int AS $$
  SELECT COUNT(*)::int FROM asignaciones
  WHERE slot_id = p_slot_id AND semana_inicio = p_semana_inicio;
$$ LANGUAGE sql STABLE;

-- ================================================
-- Seed de Slots (horarios de Oscar)
-- Lunes: 11:30-17:00 (5 slots de 1hr + última clase 16:00)
-- Martes: 9:30-17:00
-- Miér-Vie: 13:00-17:00
-- Sábado: 9:00-15:00
-- ================================================
INSERT INTO slots (dia, hora_inicio, hora_fin) VALUES
  -- Lunes
  ('lunes', '11:30', '12:15'),
  ('lunes', '12:30', '13:15'),
  ('lunes', '13:30', '14:15'),
  ('lunes', '14:30', '15:15'),
  ('lunes', '15:30', '16:15'),
  ('lunes', '16:00', '16:45'),
  -- Martes
  ('martes', '09:30', '10:15'),
  ('martes', '10:30', '11:15'),
  ('martes', '11:30', '12:15'),
  ('martes', '12:30', '13:15'),
  ('martes', '13:30', '14:15'),
  ('martes', '14:30', '15:15'),
  ('martes', '15:30', '16:15'),
  ('martes', '16:00', '16:45'),
  -- Miércoles
  ('miercoles', '13:00', '13:45'),
  ('miercoles', '14:00', '14:45'),
  ('miercoles', '15:00', '15:45'),
  ('miercoles', '16:00', '16:45'),
  -- Jueves
  ('jueves', '13:00', '13:45'),
  ('jueves', '14:00', '14:45'),
  ('jueves', '15:00', '15:45'),
  ('jueves', '16:00', '16:45'),
  -- Viernes
  ('viernes', '13:00', '13:45'),
  ('viernes', '14:00', '14:45'),
  ('viernes', '15:00', '15:45'),
  ('viernes', '16:00', '16:45'),
  -- Sábado
  ('sabado', '09:00', '09:45'),
  ('sabado', '10:00', '10:45'),
  ('sabado', '11:00', '11:45'),
  ('sabado', '12:00', '12:45'),
  ('sabado', '13:00', '13:45'),
  ('sabado', '14:00', '14:45')
ON CONFLICT (dia, hora_inicio) DO NOTHING;

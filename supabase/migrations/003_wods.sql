-- 003_wods.sql
-- Tabla de WOD (Workout Of the Day) — un WOD por fecha
-- Los admins crean/editan; los clientes solo leen

create table if not exists wods (
  id          uuid primary key default gen_random_uuid(),
  fecha       date not null unique,
  titulo      text not null,
  descripcion text not null,
  notas       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id) on delete set null
);

create index if not exists wods_fecha_idx on wods (fecha desc);

-- Trigger para updated_at
create or replace function set_wods_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists wods_updated_at on wods;
create trigger wods_updated_at
  before update on wods
  for each row execute function set_wods_updated_at();

-- RLS
alter table wods enable row level security;

-- Admins: full access
drop policy if exists "wods_admin_all" on wods;
create policy "wods_admin_all" on wods
  for all
  using (is_admin())
  with check (is_admin());

-- Clientes autenticados: solo lectura
drop policy if exists "wods_cliente_read" on wods;
create policy "wods_cliente_read" on wods
  for select
  using (auth.role() = 'authenticated');

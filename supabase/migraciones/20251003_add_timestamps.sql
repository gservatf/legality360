-- ✅ Agregar columnas created_at / updated_at en tablas
alter table empresas
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table casos
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table tareas
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- ✅ Crear función de actualización automática
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ✅ Triggers para cada tabla
drop trigger if exists set_updated_at_empresas on empresas;
create trigger set_updated_at_empresas
before update on empresas
for each row
execute function set_updated_at();

drop trigger if exists set_updated_at_casos on casos;
create trigger set_updated_at_casos
before update on casos
for each row
execute function set_updated_at();

drop trigger if exists set_updated_at_tareas on tareas;
create trigger set_updated_at_tareas
before update on tareas
for each row
execute function set_updated_at();

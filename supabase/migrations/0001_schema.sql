-- Perfil del profesional
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

-- Pacientes
create table patients (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references auth.users(id),
  first_name text not null,
  last_name text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Tipos de consulta (catálogo personalizable)
create table consultation_types (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references auth.users(id),
  name text not null,
  default_price_cents integer not null check (default_price_cents >= 0),
  default_duration_minutes integer not null default 60,
  created_at timestamptz not null default now()
);

-- Consultas / Turnos
create table consultations (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references auth.users(id),
  patient_id uuid not null references patients(id) on delete restrict,
  consultation_type_id uuid references consultation_types(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  price_cents integer not null check (price_cents >= 0),
  paid_cents integer not null default 0 check (paid_cents >= 0),
  status text not null default 'pendiente' check (status in ('pendiente', 'parcial', 'pagada', 'cancelada')),
  notes text,
  created_at timestamptz not null default now()
);

-- Pagos individuales asociados a una consulta
create table payments (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references auth.users(id),
  consultation_id uuid not null references consultations(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  payment_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

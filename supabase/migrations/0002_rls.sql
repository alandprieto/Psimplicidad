-- Activar RLS en todas las tablas
alter table profiles enable row level security;
alter table patients enable row level security;
alter table consultation_types enable row level security;
alter table consultations enable row level security;
alter table payments enable row level security;

-- Políticas para profiles
create policy "own profile" on profiles
  for all using (id = auth.uid());

-- Políticas para patients
create policy "own patients" on patients
  for all using (professional_id = auth.uid());

-- Políticas para consultation_types
create policy "own consultation_types" on consultation_types
  for all using (professional_id = auth.uid());

-- Políticas para consultations
create policy "own consultations" on consultations
  for all using (professional_id = auth.uid());

-- Políticas para payments
create policy "own payments" on payments
  for all using (professional_id = auth.uid());

-- Reemplaza 'TU_USER_UUID_DE_SUPABASE' con el ID (uuid) de tu usuario en auth.users
-- Tipos de consulta de ejemplo
insert into consultation_types (id, professional_id, name, default_price_cents, default_duration_minutes)
values
  ('a0000000-0000-0000-0000-000000000001', 'TU_USER_UUID_DE_SUPABASE', 'Sesión Individual', 1500000, 50),
  ('a0000000-0000-0000-0000-000000000002', 'TU_USER_UUID_DE_SUPABASE', 'Primera Entrevista', 1800000, 60);

-- Pacientes de ejemplo
insert into patients (id, professional_id, first_name, last_name, phone)
values
  ('b0000000-0000-0000-0000-000000000001', 'TU_USER_UUID_DE_SUPABASE', 'María', 'Gómez', '+5491112345678'),
  ('b0000000-0000-0000-0000-000000000002', 'TU_USER_UUID_DE_SUPABASE', 'Carlos', 'Pérez', '+5491187654321');

-- Consulta de ejemplo (precio 1500000 centavos = $15.000)
insert into consultations (id, professional_id, patient_id, consultation_type_id, title, starts_at, price_cents)
values
  ('c0000000-0000-0000-0000-000000000001', 'TU_USER_UUID_DE_SUPABASE', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Sesión regular', now(), 1500000);

-- Pago parcial de prueba (500000 centavos = $5.000 -> Debería cambiar el estado a 'parcial' automáticamente por el trigger)
insert into payments (professional_id, consultation_id, amount_cents)
values
  ('TU_USER_UUID_DE_SUPABASE', 'c0000000-0000-0000-0000-000000000001', 500000);

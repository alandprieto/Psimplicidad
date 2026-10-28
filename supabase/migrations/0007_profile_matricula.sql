-- Matrícula profesional del psicólogo
-- El número y la jurisdicción emisora son obligatorios en el formulario de
-- registro (validados en el cliente); se guardan como texto para permitir
-- formatos con letras y guiones (ej. "MP 34.567").
alter table profiles
  add column license_number text not null default '',
  add column license_province text not null default '';

alter table consultations
  add column duration_minutes integer not null default 50
  check (duration_minutes >= 10);

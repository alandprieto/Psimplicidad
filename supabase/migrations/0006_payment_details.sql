alter table payments
  add column payment_method text not null default 'otro',
  add column notes text;

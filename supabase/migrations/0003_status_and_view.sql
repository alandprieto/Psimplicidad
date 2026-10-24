-- Función y Trigger para actualizar dinámicamente paid_cents y status en consultations
create or replace function update_consultation_payment_status()
returns trigger as $$
declare
  target_consultation_id uuid;
  total_paid integer;
  cons_price integer;
  new_status text;
begin
  -- Identificar la consulta afectada (maneja INSERT, UPDATE y DELETE)
  if (TG_OP = 'DELETE') then
    target_consultation_id := OLD.consultation_id;
  else
    target_consultation_id := NEW.consultation_id;
  end if;

  -- Calcular la suma total de pagos para esa consulta
  select coalesce(sum(amount_cents), 0) into total_paid
  from payments
  where consultation_id = target_consultation_id;

  -- Obtener el precio de la consulta
  select price_cents into cons_price
  from consultations
  where id = target_consultation_id;

  -- Validar que la suma de pagos no supere el precio total
  if total_paid > cons_price then
    raise exception 'El monto total pagado (%) supera el valor de la consulta (%)', total_paid, cons_price;
  end if;

  -- Determinar el estado correspondiente
  if total_paid = 0 then
    new_status := 'pendiente';
  elsif total_paid < cons_price then
    new_status := 'parcial';
  else
    new_status := 'pagada';
  end if;

  -- Actualizar la consulta
  update consultations
  set paid_cents = total_paid,
      status = case when status = 'cancelada' then 'cancelada' else new_status end
  where id = target_consultation_id;

  if (TG_OP = 'DELETE') then
    return OLD;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger tr_sync_consultation_payment
after insert or update or delete on payments
for each row
execute function update_consultation_payment_status();

-- Vista mensual adaptada a la hora de Argentina y respetando RLS
create view monthly_summary
with (security_invoker = true) as
select
  professional_id,
  date_trunc('month', starts_at at time zone 'America/Argentina/Buenos_Aires') as month,
  count(*) as total_consultations,
  sum(price_cents) as billed_cents,
  sum(paid_cents) as paid_cents
from consultations
where status != 'cancelada'
group by 1, 2;

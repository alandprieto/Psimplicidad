import { supabase } from "@/lib/supabase";
import { TIMEZONE } from "@/lib/constants";
import type {
  Consultation,
  ConsultationStatus,
  ConsultationType,
  Patient,
} from "@/types/domain";

interface DashboardConsultationRow {
  id: string;
  professional_id: string;
  patient_id: string;
  consultation_type_id: string | null;
  starts_at: string;
  duration_minutes: number;
  price_cents: number;
  paid_cents: number;
  status: ConsultationStatus;
  notes: string | null;
  created_at: string;
  patient: {
    id: string;
    professional_id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    is_active: boolean;
    created_at: string;
  } | null;
  consultationType: {
    id: string;
    professional_id: string;
    name: string;
    default_duration_minutes: number;
    default_price_cents: number;
    is_active: boolean;
    created_at: string;
  } | null;
}

export async function getDashboardMetrics() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No hay sesión activa");

  const now = new Date();
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const startOfDay = new Date(`${todayKey}T00:00:00-03:00`);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
  const startOfMonth = new Date(`${todayKey.slice(0, 7)}-01T00:00:00-03:00`);

  // 1. Pacientes activos
  const { count: activePatientsCount, error: patientsError } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .eq("professional_id", user.id)
    .eq("is_active", true);
  if (patientsError) throw new Error(patientsError.message);

  // 2. Consultas de hoy
  const { data: todayConsultations, error: consultationsError } = await supabase
    .from("consultations")
    .select(
      `
      *,
      patient:patients(*),
      consultationType:consultation_types(*)
    `,
    )
    .eq("professional_id", user.id)
    .gte("starts_at", startOfDay.toISOString())
    .lte("starts_at", endOfDay.toISOString())
    .neq("status", "cancelada")
    .order("starts_at", { ascending: true });
  if (consultationsError) throw new Error(consultationsError.message);

  const consultations: Consultation[] = (
    (todayConsultations ?? []) as DashboardConsultationRow[]
  ).map((row) => {
    const patient: Patient | undefined = row.patient
      ? {
          id: row.patient.id,
          professionalId: row.patient.professional_id,
          firstName: row.patient.first_name,
          lastName: row.patient.last_name,
          phone: row.patient.phone,
          isActive: row.patient.is_active,
          createdAt: row.patient.created_at,
        }
      : undefined;
    const consultationType: ConsultationType | undefined =
      row.consultationType
        ? {
            id: row.consultationType.id,
            professionalId: row.consultationType.professional_id,
            name: row.consultationType.name,
            defaultDurationMinutes:
              row.consultationType.default_duration_minutes,
            defaultPriceCents: row.consultationType.default_price_cents,
            isActive: row.consultationType.is_active,
            createdAt: row.consultationType.created_at,
          }
        : undefined;

    return {
      id: row.id,
      professionalId: row.professional_id,
      patientId: row.patient_id,
      consultationTypeId: row.consultation_type_id,
      startsAt: row.starts_at,
      durationMinutes: row.duration_minutes,
      priceCents: row.price_cents,
      paidCents: row.paid_cents,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      patient,
      consultationType,
    };
  });

  // 3. Pagos / Ingresos del mes actual
  const { data: monthPayments, error: paymentsError } = await supabase
    .from("payments")
    .select("amount_cents")
    .eq("professional_id", user.id)
    .gte("payment_date", startOfMonth.toISOString());
  if (paymentsError) throw new Error(paymentsError.message);

  const totalMonthRevenueCents = (monthPayments || []).reduce(
    (acc, p) => acc + p.amount_cents,
    0,
  );

  return {
    activePatientsCount: activePatientsCount || 0,
    todayConsultations: consultations,
    totalMonthRevenueCents,
  };
}

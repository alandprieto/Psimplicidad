import { supabase } from "@/lib/supabase";
import { TIMEZONE } from "@/lib/constants";
import type { ConsultationStatus } from "@/types/domain";

interface MonthlyConsultationRow {
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
    first_name: string;
    last_name: string;
  } | null;
}

export async function getMonthlyFinancialStats() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No hay sesión activa");

  const now = new Date();
  const monthKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).format(now);
  const startOfMonth = new Date(`${monthKey}-01T00:00:00-03:00`);
  const endOfMonth = new Date(
    new Date(`${monthKey}-01T00:00:00-03:00`).setMonth(
      startOfMonth.getMonth() + 1,
    ) - 1,
  );

  const { data: consultations, error } = await supabase
    .from("consultations")
    .select(
      `
      *,
      patient:patients(first_name, last_name)
    `,
    )
    .eq("professional_id", user.id)
    .gte("starts_at", startOfMonth.toISOString())
    .lte("starts_at", endOfMonth.toISOString())
    .order("starts_at", { ascending: true });

  if (error) throw new Error(error.message);

  const monthlyConsultations = (
    (consultations ?? []) as MonthlyConsultationRow[]
  ).map((consultation) => ({
    id: consultation.id,
    professionalId: consultation.professional_id,
    patientId: consultation.patient_id,
    consultationTypeId: consultation.consultation_type_id,
    startsAt: consultation.starts_at,
    durationMinutes: consultation.duration_minutes,
    priceCents: consultation.price_cents,
    paidCents: consultation.paid_cents,
    status: consultation.status,
    notes: consultation.notes,
    createdAt: consultation.created_at,
    patient: consultation.patient
      ? {
          firstName: consultation.patient.first_name,
          lastName: consultation.patient.last_name,
        }
      : undefined,
  }));

  let totalBilledCents = 0;
  let totalCollectedCents = 0;
  let totalPendingCents = 0;

  (consultations || []).forEach((c) => {
    if (c.status !== "cancelada") {
      totalBilledCents += c.price_cents;
      totalCollectedCents += c.paid_cents;
      const pending = c.price_cents - c.paid_cents;
      if (pending > 0) {
        totalPendingCents += pending;
      }
    }
  });

  return {
    totalBilledCents,
    totalCollectedCents,
    totalPendingCents,
    consultations: monthlyConsultations,
  };
}

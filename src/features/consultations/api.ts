import { supabase } from "@/lib/supabase";
import type { Consultation } from "@/types/domain";

export async function getConsultations(): Promise<Consultation[]> {
  const { data, error } = await supabase
    .from("consultations")
    .select(
      `
      *,
      patient:patients(*)
    `,
    )
    .order("starts_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((c: any) => ({
    id: c.id,
    professionalId: c.professional_id,
    patientId: c.patient_id,
    consultationTypeId: c.consultation_type_id,
    title: c.title,
    startsAt: c.starts_at,
    durationMinutes: c.duration_minutes,
    priceCents: c.price_cents,
    paidCents: c.paid_cents,
    status: c.status,
    notes: c.notes,
    createdAt: c.created_at,
    patient: c.patient
      ? {
          id: c.patient.id,
          professionalId: c.patient.professional_id,
          firstName: c.patient.first_name,
          lastName: c.patient.last_name,
          phone: c.patient.phone,
          isActive: c.patient.is_active,
          createdAt: c.patient.created_at,
        }
      : undefined,
  }));
}

export async function createConsultation(consultation: {
  patientId: string;
  consultationTypeId?: string | null;
  title: string;
  startsAt: string;
  durationMinutes: number;
  priceCents: number;
  notes?: string;
}): Promise<Consultation> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No hay sesión activa");

  const { data, error } = await supabase
    .from("consultations")
    .insert({
      professional_id: user.id,
      patient_id: consultation.patientId,
      consultation_type_id: consultation.consultationTypeId || null,
      title: consultation.title,
      starts_at: consultation.startsAt,
      duration_minutes: consultation.durationMinutes,
      price_cents: consultation.priceCents,
      notes: consultation.notes || null,
    })
    .select(
      `
      *,
      patient:patients(*),
      consultationType:consultation_types(*)
    `,
    )
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    professionalId: data.professional_id,
    patientId: data.patient_id,
    consultationTypeId: data.consultation_type_id,
    title: data.title,
    startsAt: data.starts_at,
    durationMinutes: data.duration_minutes,
    priceCents: data.price_cents,
    paidCents: data.paid_cents,
    status: data.status,
    notes: data.notes,
    createdAt: data.created_at,
    patient: data.patient
      ? {
          id: data.patient.id,
          professionalId: data.patient.professional_id,
          firstName: data.patient.first_name,
          lastName: data.patient.last_name,
          phone: data.patient.phone,
          isActive: data.patient.is_active,
          createdAt: data.patient.created_at,
        }
      : undefined,
    consultationType: data.consultationType
      ? {
          id: data.consultationType.id,
          professionalId: data.consultationType.professional_id,
          name: data.consultationType.name,
          defaultDurationMinutes:
            data.consultationType.default_duration_minutes,
          defaultPriceCents: data.consultationType.default_price_cents,
          isActive: data.consultationType.is_active,
          createdAt: data.consultationType.created_at,
        }
      : undefined,
  };
}

export async function updateConsultation(
  id: string,
  consultation: {
    patientId: string;
    consultationTypeId?: string | null;
    title: string;
    startsAt: string;
    durationMinutes: number;
    priceCents: number;
    notes?: string;
  },
): Promise<void> {
  const { data, error } = await supabase
    .from("consultations")
    .update({
      patient_id: consultation.patientId,
      consultation_type_id: consultation.consultationTypeId || null,
      title: consultation.title,
      starts_at: consultation.startsAt,
      duration_minutes: consultation.durationMinutes,
      price_cents: consultation.priceCents,
      notes: consultation.notes || null,
    })
    .eq("id", id)
    .lte("paid_cents", consultation.priceCents)
    .select("id");

  if (error) throw new Error(error.message);
  if (data.length === 0) {
    throw new Error(
      "No se encontró la consulta o el precio no puede ser menor a lo ya abonado.",
    );
  }
}

export async function cancelConsultation(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("consultations")
    .update({ status: "cancelada" })
    .eq("id", id)
    .neq("status", "cancelada")
    .select("id");

  if (error) throw new Error(error.message);
  if (data.length === 0) {
    throw new Error("La consulta ya fue cancelada o no se encontró.");
  }
}

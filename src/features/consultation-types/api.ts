import { supabase } from "@/lib/supabase";
import type { ConsultationType } from "@/types/domain";

export async function getConsultationTypes(): Promise<ConsultationType[]> {
  const { data, error } = await supabase
    .from("consultation_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((ct: any) => ({
    id: ct.id,
    professionalId: ct.professional_id,
    name: ct.name,
    defaultDurationMinutes: ct.default_duration_minutes,
    defaultPriceCents: ct.default_price_cents,
    isActive: ct.is_active,
    createdAt: ct.created_at,
  }));
}

export async function createConsultationType(consultationType: {
  name: string;
  defaultDurationMinutes: number;
  defaultPriceCents: number;
}): Promise<ConsultationType> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No hay sesión activa");

  const { data, error } = await supabase
    .from("consultation_types")
    .insert({
      professional_id: user.id,
      name: consultationType.name,
      default_duration_minutes: consultationType.defaultDurationMinutes,
      default_price_cents: consultationType.defaultPriceCents,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    professionalId: data.professional_id,
    name: data.name,
    defaultDurationMinutes: data.default_duration_minutes,
    defaultPriceCents: data.default_price_cents,
    isActive: data.is_active,
    createdAt: data.created_at,
  };
}

export async function toggleConsultationTypeStatus(
  id: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("consultation_types")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

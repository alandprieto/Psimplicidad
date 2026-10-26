import { supabase } from "@/lib/supabase";
import type { Payment } from "@/types/domain";

export async function getPaymentsForConsultation(
  consultationId: string,
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("consultation_id", consultationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((p: any) => ({
    id: p.id,
    professionalId: p.professional_id,
    consultationId: p.consultation_id,
    amountCents: p.amount_cents,
    paymentMethod: p.payment_method,
    paidAt: p.payment_date,
    notes: p.notes,
    createdAt: p.created_at,
  }));
}

export async function createPayment(payment: {
  consultationId: string;
  amountCents: number;
  paymentMethod: string;
  notes?: string;
}): Promise<Payment> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No hay sesión activa");

  const { data, error } = await supabase
    .from("payments")
    .insert({
      professional_id: user.id,
      consultation_id: payment.consultationId,
      amount_cents: payment.amountCents,
      payment_method: payment.paymentMethod,
      notes: payment.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    professionalId: data.professional_id,
    consultationId: data.consultation_id,
    amountCents: data.amount_cents,
    paymentMethod: data.payment_method,
    paidAt: data.payment_date,
    notes: data.notes,
    createdAt: data.created_at,
  };
}

import { supabase } from '@/lib/supabase';
import type { Patient } from '@/types/domain';

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('last_name', { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((p) => ({
    id: p.id,
    professionalId: p.professional_id,
    firstName: p.first_name,
    lastName: p.last_name,
    phone: p.phone,
    isActive: p.is_active,
    createdAt: p.created_at,
  }));
}

export async function createPatient(patient: {
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<Patient> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('patients')
    .insert({
      professional_id: user.id,
      first_name: patient.firstName,
      last_name: patient.lastName,
      phone: patient.phone || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    professionalId: data.professional_id,
    firstName: data.first_name,
    lastName: data.last_name,
    phone: data.phone,
    isActive: data.is_active,
    createdAt: data.created_at,
  };
}

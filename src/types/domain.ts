export type ConsultationStatus = 'pendiente' | 'parcial' | 'pagada' | 'cancelada';

export interface Patient {
  id: string;
  professionalId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ConsultationType {
  id: string;
  professionalId: string;
  name: string;
  defaultPriceCents: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface Consultation {
  id: string;
  professionalId: string;
  patientId: string;
  consultationTypeId?: string | null;
  startsAt: string;
  durationMinutes: number;
  priceCents: number;
  paidCents: number;
  status: ConsultationStatus;
  notes?: string | null;
  createdAt: string;
  // Relaciones opcionales para joins frecuentes
  patient?: Patient;
  consultationType?: ConsultationType;
}

export interface Payment {
  id: string;
  professionalId: string;
  consultationId: string;
  amountCents: number;
  paidAt: string;
  notes?: string | null;
  createdAt: string;
}

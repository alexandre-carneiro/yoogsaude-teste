export type Patient = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  birthDate?: string | null;
  notes?: string | null;
};

export type PatientPayload = {
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  notes?: string;
};


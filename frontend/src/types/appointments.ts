export type AppointmentStatus = 'AGUARDANDO' | 'EM_ATENDIMENTO' | 'FINALIZADO';

export type AppointmentPaciente = {
  id: string;
  name: string;
  phone: string;
};

export type Appointment = {
  id: string;
  pacienteId: string;
  paciente?: AppointmentPaciente | null;
  title: string;
  description: string;
  status: AppointmentStatus;
  scheduledFor?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  priority?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AppointmentCreatePayload = {
  patientId: string;
  title: string;
  description: string;
  scheduledFor?: string;
  priority?: number;
};

export type AppointmentUpdatePayload = {
  title?: string;
  description?: string;
  scheduledFor?: string | null;
  priority?: number | null;
};

export type AppointmentStatusPayload = {
  status: AppointmentStatus;
};

export type AppointmentListResponse = {
  items: Appointment[];
  total: number;
  page: number;
  pageSize: number;
};


import { api } from './api';
import type {
  Appointment,
  AppointmentCreatePayload,
  AppointmentListResponse,
  AppointmentStatusPayload,
  AppointmentUpdatePayload
} from '../types/appointments';

export async function fetchAppointments(params: {
  patientId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<AppointmentListResponse> {
  const response = await api.get<AppointmentListResponse>('/appointments', {
    params: {
      ...(params.patientId ? { patientId: params.patientId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.page ? { page: params.page } : {}),
      ...(params.pageSize ? { pageSize: params.pageSize } : {})
    }
  });

  return response.data;
}

export async function createAppointment(payload: AppointmentCreatePayload): Promise<Appointment> {
  const response = await api.post<Appointment>('/appointments', payload);
  return response.data;
}

export async function updateAppointment(id: string, payload: AppointmentUpdatePayload): Promise<Appointment> {
  const response = await api.put<Appointment>(`/appointments/${id}`, payload);
  return response.data;
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${id}`);
}

export async function updateAppointmentStatus(id: string, payload: AppointmentStatusPayload): Promise<Appointment> {
  const response = await api.patch<Appointment>(`/appointments/${id}/status`, payload);
  return response.data;
}


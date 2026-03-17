import { api } from './api';

import type { Patient, PatientPayload } from '../types/patients';

export async function fetchPatients(): Promise<Patient[]> {
  const response = await api.get<Patient[]>('/patients');
  return response.data;
}

export async function createPatient(payload: PatientPayload): Promise<Patient> {
  const response = await api.post<Patient>('/patients', payload);
  return response.data;
}

export async function updatePatient(id: string, payload: PatientPayload): Promise<Patient> {
  const response = await api.put<Patient>(`/patients/${id}`, payload);
  return response.data;
}

export async function deletePatient(id: string): Promise<void> {
  await api.delete(`/patients/${id}`);
}


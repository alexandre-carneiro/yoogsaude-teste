import { useCallback, useState } from 'react';
import {
  fetchPatients,
  createPatient as createPatientService,
  updatePatient as updatePatientService,
  deletePatient as deletePatientService
} from '../services/patients';
import type { Patient, PatientPayload } from '../types/patients';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPatients();
      setPatients(data);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Erro ao carregar pacientes';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const savePatient = useCallback(
    async (id: string | undefined, payload: PatientPayload) => {
      setError(null);
      if (id) {
        await updatePatientService(id, payload);
      } else {
        await createPatientService(payload);
      }
      await loadPatients();
    },
    [loadPatients]
  );

  const deletePatientById = useCallback(
    async (id: string) => {
      setError(null);
      await deletePatientService(id);
      await loadPatients();
    },
    [loadPatients]
  );

  return {
    patients,
    loading,
    error,
    setError,
    loadPatients,
    savePatient,
    deletePatientById
  };
}


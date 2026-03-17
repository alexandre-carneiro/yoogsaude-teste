import { useCallback, useState } from 'react';
import type {
  Appointment,
  AppointmentCreatePayload,
  AppointmentListResponse,
  AppointmentStatusPayload,
  AppointmentUpdatePayload
} from '../types/appointments';
import {
  fetchAppointments,
  createAppointment as createAppointmentService,
  updateAppointment as updateAppointmentService,
  deleteAppointment as deleteAppointmentService,
  updateAppointmentStatus as updateAppointmentStatusService
} from '../services/appointments';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(
    async (params: { patientId?: string; status?: string; page?: number } = {}) => {
      const nextPage = params.page ?? 1;
      setPage(nextPage);
      setLoading(true);
      setError(null);

      try {
        const data: AppointmentListResponse = await fetchAppointments({
          patientId: params.patientId,
          status: params.status,
          page: nextPage,
          pageSize
        });

        setAppointments(data.items);
        setTotal(data.total);
      } catch (err: any) {
        const message = err?.response?.data?.message ?? 'Erro ao carregar atendimentos';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  const saveAppointment = useCallback(
    async (id: string | undefined, payload: AppointmentCreatePayload | AppointmentUpdatePayload) => {
      setError(null);
      if (id) {
        await updateAppointmentService(id, payload as AppointmentUpdatePayload);
      } else {
        await createAppointmentService(payload as AppointmentCreatePayload);
      }
      await loadAppointments({ page });
    },
    [loadAppointments, page]
  );

  const deleteAppointmentById = useCallback(
    async (id: string) => {
      setError(null);
      await deleteAppointmentService(id);
      await loadAppointments({ page });
    },
    [loadAppointments, page]
  );

  const updateStatus = useCallback(
    async (id: string, payload: AppointmentStatusPayload) => {
      setError(null);
      await updateAppointmentStatusService(id, payload);
      await loadAppointments({ page });
    },
    [loadAppointments, page]
  );

  return {
    appointments,
    total,
    page,
    pageSize,
    loading,
    error,
    loadAppointments,
    saveAppointment,
    deleteAppointmentById,
    updateStatus
  };
}


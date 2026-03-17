import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { z } from 'zod';

import { PageShell } from '../components/templates/PageShell';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog';
import { BackButton } from '../components/atoms/BackButton';

import { usePatients } from '../hooks/usePatients';
import { useAppointments } from '../hooks/useAppointments';
import type { AppointmentStatus, AppointmentUpdatePayload, AppointmentCreatePayload, Appointment } from '../types/appointments';

type AppointmentFormState = {
  id?: string;
  patientId: string;
  title: string;
  description: string;
  scheduledFor: string; // datetime-local value ('' means empty)
  priority: string; // keep as string for TextField
};

const MAX_TITLE_LENGTH = 200;

const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  scheduledFor: z.string().datetime().optional().nullable(),
  priority: z.number().int().optional().nullable()
});

const updateAppointmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  scheduledFor: z.string().datetime().optional().nullable(),
  priority: z.number().int().optional().nullable()
});

function toDateTimeLocalValue(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // datetime-local expects "YYYY-MM-DDTHH:mm"
  return d.toISOString().slice(0, 16);
}

function buildCreatePayload(form: AppointmentFormState): AppointmentCreatePayload {
  return {
    patientId: form.patientId,
    title: form.title.trim(),
    description: form.description.trim(),
    scheduledFor: form.scheduledFor ? new Date(form.scheduledFor).toISOString() : undefined,
    priority: form.priority ? Number(form.priority) : undefined
  };
}

function buildUpdatePayload(form: AppointmentFormState): AppointmentUpdatePayload {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    scheduledFor: form.scheduledFor ? new Date(form.scheduledFor).toISOString() : null,
    priority: form.priority ? Number(form.priority) : null
  };
}

function statusLabel(status: AppointmentStatus) {
  switch (status) {
    case 'AGUARDANDO':
      return 'Aguardando';
    case 'EM_ATENDIMENTO':
      return 'Em atendimento';
    case 'FINALIZADO':
      return 'Finalizado';
    default:
      return status;
  }
}

export function AppointmentsPage() {
  const { patients, loading: loadingPatients, loadPatients } = usePatients();
  const { appointments, total, page, pageSize, loading, loadAppointments, saveAppointment, deleteAppointmentById, updateStatus } =
    useAppointments();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AppointmentFormState>({
    patientId: '',
    title: '',
    description: '',
    scheduledFor: '',
    priority: ''
  });
  const [initialForm, setInitialForm] = useState<AppointmentFormState>({
    patientId: '',
    title: '',
    description: '',
    scheduledFor: '',
    priority: ''
  });
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);

  const [alert, setAlert] = useState<{ severity: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null);

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form, initialForm]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    void loadAppointments({ page: 1 });
  }, []);

  useEffect(() => {
    if (!alert) return;
    const timeoutId = window.setTimeout(() => setAlert(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [alert]);

  function openCreateDialog() {
    const firstPatientId = patients[0]?.id ?? '';
    const next: AppointmentFormState = {
      patientId: firstPatientId,
      title: '',
      description: '',
      scheduledFor: '',
      priority: ''
    };
    setInitialForm(next);
    setForm(next);
    setDialogOpen(true);
  }

  function openEditDialog(appointment: Appointment) {
    const next: AppointmentFormState = {
      id: appointment.id,
      patientId: appointment.pacienteId,
      title: appointment.title,
      description: appointment.description,
      scheduledFor: toDateTimeLocalValue(appointment.scheduledFor),
      priority: appointment.priority != null ? String(appointment.priority) : ''
    };

    setInitialForm(next);
    setForm(next);
    setDialogOpen(true);
  }

  function handleChange(field: keyof AppointmentFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const { isCreateValid, isUpdateValid } = useMemo(() => {
    const createPayload = buildCreatePayload(form);
    const parsedCreate = createAppointmentSchema.safeParse(createPayload);

    const updatePayload = buildUpdatePayload(form);
    const parsedUpdate = updateAppointmentSchema.safeParse(updatePayload);

    return { isCreateValid: parsedCreate.success, isUpdateValid: parsedUpdate.success };
  }, [form]);

  const isFormValid = form.id ? isUpdateValid : isCreateValid;

  async function persistAppointment() {
    setSaving(true);
    setAlert(null);
    try {
      const payload = form.id ? buildUpdatePayload(form) : buildCreatePayload(form);
      await saveAppointment(form.id, payload as any);
      setDialogOpen(false);
      setAlert({
        severity: 'success',
        message: form.id ? 'Atendimento atualizado com sucesso' : 'Atendimento criado com sucesso'
      });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Erro ao salvar atendimento';
      setAlert({ severity: 'error', message });
    } finally {
      setSaving(false);
    }
  }

  function handleSaveClick() {
    if (form.id) {
      setConfirmEditOpen(true);
      return;
    }
    void persistAppointment();
  }

  async function handleConfirmEdit() {
    setConfirmEditOpen(false);
    await persistAppointment();
  }

  async function handleConfirmDelete() {
    if (!confirmDeleteId) return;
    try {
      await deleteAppointmentById(confirmDeleteId);
      setAlert({ severity: 'success', message: 'Atendimento excluído com sucesso' });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Erro ao excluir atendimento';
      setAlert({ severity: 'error', message });
    } finally {
      setConfirmDeleteId(null);
    }
  }

  function getStatusActions(status: AppointmentStatus) {
    if (status === 'AGUARDANDO') {
      return (
        <Button
          variant="outlined"
          size="small"
          onClick={() => void updateStatusHandler(status, 'EM_ATENDIMENTO')}
        >
          Iniciar
        </Button>
      );
    }

    if (status === 'EM_ATENDIMENTO') {
      return (
        <Button
          variant="outlined"
          size="small"
          onClick={() => void updateStatusHandler(status, 'FINALIZADO')}
        >
          Finalizar
        </Button>
      );
    }

    return <Typography variant="body2" color="text.secondary">Finalizado</Typography>;
  }

  async function updateStatusHandler(_current: AppointmentStatus, next: AppointmentStatus) {
    // placeholder; we'll bind id via closure below
    void next;
  }

  async function handleStatusTransition(id: string, next: AppointmentStatus) {
    try {
      await updateStatus(id, { status: next });
      setAlert({ severity: 'success', message: 'Status atualizado com sucesso' });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Erro ao atualizar status';
      setAlert({ severity: 'error', message });
    }
  }

  return (
    <PageShell>
      <Box sx={{ mb: 2 }}>
        <BackButton />
      </Box>

      {alert && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 1300,
            pointerEvents: 'none'
          }}
        >
          <Alert
            severity={alert.severity}
            onClose={() => setAlert(null)}
            variant="filled"
            sx={{ pointerEvents: 'auto', width: { xs: 'calc(100% - 32px)', sm: 'auto' } }}
          >
            {alert.message}
          </Alert>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'flex-start', sm: 'space-between' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
            Atendimentos
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Registre, acompanhe e atualize o status dos atendimentos.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog} disabled={loadingPatients}>
          Novo atendimento
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Agendado</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id} hover>
                    <TableCell>
                      {appointment.paciente?.name ?? appointment.pacienteId}
                    </TableCell>
                    <TableCell>{appointment.title}</TableCell>
                    <TableCell>{statusLabel(appointment.status)}</TableCell>
                    <TableCell>
                      {appointment.scheduledFor ? new Date(appointment.scheduledFor).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-end', sm: 'center' },
                          justifyContent: 'flex-end',
                          gap: 1,
                          flexWrap: 'wrap'
                        }}
                      >
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => openEditDialog(appointment)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" onClick={() => setConfirmDeleteId(appointment.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {appointment.status === 'AGUARDANDO' && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => void handleStatusTransition(appointment.id, 'EM_ATENDIMENTO')}
                          >
                            Iniciar
                          </Button>
                        )}

                        {appointment.status === 'EM_ATENDIMENTO' && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => void handleStatusTransition(appointment.id, 'FINALIZADO')}
                          >
                            Finalizar
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && appointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum atendimento cadastrado ainda.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? 'Editar atendimento' : 'Novo atendimento'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {!form.id ? (
              <FormControl fullWidth>
                <InputLabel id="patient-select-label">Paciente *</InputLabel>
                <Select
                  labelId="patient-select-label"
                  value={form.patientId}
                  label="Paciente *"
                  onChange={(e) => handleChange('patientId', String(e.target.value))}
                  error={form.patientId ? false : !isCreateValid}
                >
                  {patients.map((patient) => (
                    <MenuItem value={patient.id} key={patient.id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField label="Paciente" value={patients.find((p) => p.id === form.patientId)?.name ?? ''} fullWidth disabled helperText=" " />
            )}

            <TextField
              label="Título *"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              fullWidth
              helperText=" "
              inputProps={{ maxLength: MAX_TITLE_LENGTH }}
            />

            <TextField
              label="Descrição *"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              fullWidth
              multiline
              minRows={3}
              helperText=" "
              inputProps={{ maxLength: 2000 }}
            />

            <TextField
              label="Agendado para"
              type="datetime-local"
              value={form.scheduledFor}
              onChange={(e) => handleChange('scheduledFor', e.target.value)}
              fullWidth
              helperText=" "
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Prioridade"
              type="number"
              value={form.priority}
              onChange={(e) => {
                const next = e.target.value;
                const digitsOnly = next === '' ? '' : String(next).replace(/[^\d-]/g, '');
                handleChange('priority', digitsOnly);
              }}
              fullWidth
              helperText=" "
              inputProps={{ step: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveClick}
            disabled={saving || !isFormValid || (Boolean(form.id) && !isDirty)}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(confirmDeleteId)} onClose={() => setConfirmDeleteId(null)}>
        <ConfirmDialog
          open={Boolean(confirmDeleteId)}
          title="Confirmar exclusão"
          description="Tem certeza de que deseja excluir este atendimento? Esta ação não poderá ser desfeita."
          confirmLabel="Excluir"
          confirmColor="error"
          onConfirm={handleConfirmDelete}
          onClose={() => setConfirmDeleteId(null)}
        />
      </Dialog>

      <ConfirmDialog
        open={confirmEditOpen}
        title="Confirmar atualização"
        description="Deseja salvar as alterações realizadas neste atendimento?"
        confirmLabel="Confirmar"
        onConfirm={handleConfirmEdit}
        onClose={() => setConfirmEditOpen(false)}
      />
    </PageShell>
  );
}


import React, { useEffect, useState } from 'react';
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
import { z } from 'zod';
import { PageShell } from '../components/templates/PageShell';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog';
import { BackButton } from '../components/atoms/BackButton';
import { usePatients } from '../hooks/usePatients';
import type { Patient } from '../types/patients';

type PatientFormState = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  notes: string;
};

const MAX_NOTES_LENGTH = 100;
const emptyForm: PatientFormState = {
  name: '',
  phone: '',
  email: '',
  birthDate: '',
  notes: ''
};

const patientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().nullable()
});

function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function PatientsPage() {
  const { patients, loading, loadPatients, savePatient, deletePatientById } = usePatients();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PatientFormState>(emptyForm);
  const [initialForm, setInitialForm] = useState<PatientFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [alert, setAlert] = useState<{ severity: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(
    null
  );
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (!alert) return;
    const timeoutId = window.setTimeout(() => setAlert(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [alert]);

  function openCreateDialog() {
    setInitialForm(emptyForm);
    setForm(emptyForm);
    setEmailError(null);
    setPhoneError(null);
    setAlert(null);
    setDialogOpen(true);
  }

  function openEditDialog(patient: Patient) {
    const editedForm: PatientFormState = {
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      email: patient.email ?? '',
      birthDate: patient.birthDate ? patient.birthDate.substring(0, 10) : '',
      notes: patient.notes ?? ''
    };
    setInitialForm(editedForm);
    setForm(editedForm);
    setEmailError(null);
    setPhoneError(null);
    setAlert(null);
    setDialogOpen(true);
  }

  function handleChange(field: keyof PatientFormState, value: string) {
    setForm((prev) => {
      const normalizedValue =
        field === 'phone' ? value.replace(/\D/g, '') : value;
      const nextForm = { ...prev, [field]: normalizedValue };
      const parseResult = patientSchema.safeParse({
        name: nextForm.name.trim(),
        phone: nextForm.phone.trim(),
        email: nextForm.email || undefined
      });

      if (!parseResult.success) {
        const emailIssue = parseResult.error.issues.find((i) => String(i.path[0]) === 'email');
        const phoneIssue = parseResult.error.issues.find((i) => String(i.path[0]) === 'phone');

        setEmailError(emailIssue ? 'E-mail inválido' : null);
        setPhoneError(phoneIssue ? 'Telefone inválido' : null);
      } else {
        setEmailError(null);
        setPhoneError(null);
      }

      return nextForm;
    });
  }

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const isPatientValid = patientSchema.safeParse({
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email || undefined
  }).success;

  async function persistPatient() {
    if (!isPatientValid) {
      const parseResult = patientSchema.safeParse({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email || undefined
      });

      const emailIssue = parseResult.success
        ? null
        : parseResult.error.issues.find((i) => String(i.path[0]) === 'email');
      const phoneIssue = parseResult.success
        ? null
        : parseResult.error.issues.find((i) => String(i.path[0]) === 'phone');

      setEmailError(emailIssue ? 'E-mail inválido' : null);
      setPhoneError(phoneIssue ? 'Telefone inválido' : null);
      return;
    }

    setSaving(true);
    setAlert(null);
    setEmailError(null);
    setPhoneError(null);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email || undefined,
        birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : undefined,
        notes: form.notes || undefined
      };

      await savePatient(form.id, payload);
      setDialogOpen(false);
      setAlert({
        severity: 'success',
        message: form.id
          ? 'Paciente atualizado com sucesso'
          : 'Paciente criado com sucesso'
      });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Erro ao salvar paciente';
      setAlert({ severity: 'error', message });
      const messageLower = String(message).toLowerCase();
      if (messageLower.includes('email') && messageLower.includes('em uso')) {
        setEmailError(message);
        setPhoneError(null);
      } else {
        setEmailError(null);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleSaveClick() {
    if (form.id) {
      setConfirmEditOpen(true);
      return;
    }
    void persistPatient();
  }

  async function handleConfirmEdit() {
    setConfirmEditOpen(false);
    await persistPatient();
  }

  async function handleDelete(id: string) {
    setConfirmDeleteId(id);
  }

  async function handleConfirmDelete() {
    if (!confirmDeleteId) return;
    try {
      await deletePatientById(confirmDeleteId);
      setAlert({ severity: 'success', message: 'Paciente excluído com sucesso' });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Erro ao excluir paciente';
      setAlert({ severity: 'error', message });
    } finally {
      setConfirmDeleteId(null);
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
            Pacientes
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Cadastre e gerencie os pacientes da clínica.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
        >
          Novo paciente
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 660 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Notas</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id} hover>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{truncate(patient.notes, 60)}</TableCell>
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
                          <IconButton size="small" onClick={() => openEditDialog(patient)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" onClick={() => handleDelete(patient.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && patients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum paciente cadastrado ainda.
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
        <DialogTitle>{form.id ? 'Editar paciente' : 'Novo paciente'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nome"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              fullWidth
              helperText=" "
            />
            <TextField
              label="Telefone"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
              fullWidth
              inputMode="numeric"
              error={Boolean(phoneError)}
              helperText={phoneError ?? ' '}
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              fullWidth
              error={Boolean(emailError)}
              helperText={emailError ?? ' '}
            />
            <TextField
              label="Data de nascimento"
              type="date"
              value={form.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              helperText=" "
            />
            <TextField
              label="Notas"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              multiline
              minRows={3}
              fullWidth
              sx={{
                '& .MuiInputBase-inputMultiline': {
                  maxHeight: 120,
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }
              }}
              inputProps={{ maxLength: MAX_NOTES_LENGTH }}
              helperText={`${form.notes.length}/${MAX_NOTES_LENGTH} caracteres`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveClick}
            disabled={
              saving ||
              !isPatientValid ||
              (Boolean(form.id) && !isDirty)
            }
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
      >
        <ConfirmDialog
          open={Boolean(confirmDeleteId)}
          title="Confirmar exclusão"
          description="Tem certeza de que deseja excluir este paciente? Esta ação não poderá ser desfeita."
          confirmLabel="Excluir"
          confirmColor="error"
          onConfirm={handleConfirmDelete}
          onClose={() => setConfirmDeleteId(null)}
        />
      </Dialog>

      <ConfirmDialog
        open={confirmEditOpen}
        title="Confirmar atualização"
        description="Deseja salvar as alterações realizadas neste paciente?"
        confirmLabel="Confirmar"
        onConfirm={handleConfirmEdit}
        onClose={() => setConfirmEditOpen(false)}
      />
    </PageShell>
  );
}


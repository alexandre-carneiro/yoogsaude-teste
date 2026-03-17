import type { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { z } from 'zod';

const patientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().nullable(),
  birthDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable()
});

export async function createPatient(req: Request, res: Response) {
  const parseResult = patientSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid patient data', issues: parseResult.error.issues });
  }

  const { name, phone, email, birthDate, notes } = parseResult.data;

  const patient = await prisma.paciente.create({
    data: {
      name,
      phone,
      email: email ?? undefined,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      notes: notes ?? undefined
    }
  });

  return res.status(201).json(patient);
}

export async function listPatients(_req: Request, res: Response) {
  const patients = await prisma.paciente.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return res.status(200).json(patients);
}

export async function getPatientById(req: Request, res: Response) {
  const { id } = req.params;

  const patient = await prisma.paciente.findUnique({
    where: { id }
  });

  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  return res.status(200).json(patient);
}

export async function updatePatient(req: Request, res: Response) {
  const { id } = req.params;

  const existing = await prisma.paciente.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const partialSchema = patientSchema.partial();
  const parseResult = partialSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid patient data', issues: parseResult.error.issues });
  }

  const { name, phone, email, birthDate, notes } = parseResult.data;

  const updated = await prisma.paciente.update({
    where: { id },
    data: {
      name,
      phone,
      email,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      notes
    }
  });

  return res.status(200).json(updated);
}

export async function deletePatient(req: Request, res: Response) {
  const { id } = req.params;

  const existing = await prisma.paciente.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const appointmentsCount = await prisma.atendimento.count({
    where: { pacienteId: id }
  });

  if (appointmentsCount > 0) {
    return res.status(400).json({
      message: 'Cannot delete patient with existing appointments'
    });
  }

  await prisma.paciente.delete({ where: { id } });

  return res.status(200).json({
    message: 'Patient deleted successfully'
  });
}


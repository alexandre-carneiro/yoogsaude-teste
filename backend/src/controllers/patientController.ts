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
    return res.status(400).json({ message: 'Dados inválidos do paciente', issues: parseResult.error.issues });
  }

  const { name, phone, email, birthDate, notes } = parseResult.data;

  try {
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
  } catch (err: any) {
    if (err?.code === 'P2002' && Array.isArray(err.meta?.target) && err.meta.target.includes('email')) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    return res.status(500).json({ message: 'Erro inesperado ao criar paciente' });
  }
}

export async function listPatients(_req: Request, res: Response) {
  try {
    const patients = await prisma.paciente.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(patients);
  } catch (err) {
    return res.status(500).json({ message: 'Erro inesperado ao listar pacientes' });
  }
}

export async function getPatientById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const patient = await prisma.paciente.findUnique({
      where: { id }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    return res.status(200).json(patient);
  } catch (err) {
    return res.status(500).json({ message: 'Erro inesperado ao buscar paciente' });
  }
}

export async function updatePatient(req: Request, res: Response) {
  const { id } = req.params;

  const existing = await prisma.paciente.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Paciente não encontrado' });
  }

  const partialSchema = patientSchema.partial();
  const parseResult = partialSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ message: 'Dados inválidos do paciente', issues: parseResult.error.issues });
  }

  const { name, phone, email, birthDate, notes } = parseResult.data;

  try {
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
  } catch (err: any) {
    if (err?.code === 'P2002' && Array.isArray(err.meta?.target) && err.meta.target.includes('email')) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    return res.status(500).json({ message: 'Erro inesperado ao atualizar paciente' });
  }
}

export async function deletePatient(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const existing = await prisma.paciente.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    const appointmentsCount = await prisma.atendimento.count({
      where: { pacienteId: id }
    });

    if (appointmentsCount > 0) {
      return res.status(400).json({
        message: 'Não é possível excluir o paciente com atendimentos existentes'
      });
    }

    await prisma.paciente.delete({ where: { id } });

    return res.status(200).json({
      message: 'Paciente excluído com sucesso'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro inesperado ao excluir paciente' });
  }
}


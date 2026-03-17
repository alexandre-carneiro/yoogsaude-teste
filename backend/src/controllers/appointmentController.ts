import type { Request, Response } from 'express';
import { AtendimentoStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { z } from 'zod';

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

const updateStatusSchema = z.object({
  status: z.nativeEnum(AtendimentoStatus)
});

const validNextStatus: Record<AtendimentoStatus, AtendimentoStatus | null> = {
  [AtendimentoStatus.AGUARDANDO]: AtendimentoStatus.EM_ATENDIMENTO,
  [AtendimentoStatus.EM_ATENDIMENTO]: AtendimentoStatus.FINALIZADO,
  [AtendimentoStatus.FINALIZADO]: null
};

export async function createAppointment(req: Request, res: Response) {
  const parseResult = createAppointmentSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid appointment data', issues: parseResult.error.issues });
  }

  const { patientId, title, description, scheduledFor, priority } = parseResult.data;

  const patient = await prisma.paciente.findUnique({ where: { id: patientId } });
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const appointment = await prisma.atendimento.create({
    data: {
      pacienteId: patientId,
      title,
      description,
      status: AtendimentoStatus.AGUARDANDO,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      priority: priority ?? 0
    }
  });

  return res.status(201).json(appointment);
}

export async function listAppointments(req: Request, res: Response) {
  const { patientId, status, page = '1', pageSize = '10' } = req.query;

  const where: Record<string, unknown> = {};

  if (typeof patientId === 'string') {
    where.pacienteId = patientId;
  }

  if (typeof status === 'string' && Object.values(AtendimentoStatus).includes(status as AtendimentoStatus)) {
    where.status = status as AtendimentoStatus;
  }

  const pageNumber = Number(page) || 1;
  const sizeNumber = Number(pageSize) || 10;
  const skip = (pageNumber - 1) * sizeNumber;

  const [items, total] = await Promise.all([
    prisma.atendimento.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: sizeNumber,
      include: {
        paciente: {
          select: { id: true, name: true, phone: true }
        }
      }
    }),
    prisma.atendimento.count({ where })
  ]);

  return res.status(200).json({
    items,
    total,
    page: pageNumber,
    pageSize: sizeNumber
  });
}

export async function getAppointmentById(req: Request, res: Response) {
  const { id } = req.params;

  const appointment = await prisma.atendimento.findUnique({
    where: { id },
    include: {
      paciente: {
        select: { id: true, name: true, phone: true }
      }
    }
  });

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  return res.status(200).json(appointment);
}

export async function updateAppointment(req: Request, res: Response) {
  const { id } = req.params;

  const existing = await prisma.atendimento.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const parseResult = updateAppointmentSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid appointment data', issues: parseResult.error.issues });
  }

  const { title, description, scheduledFor, priority } = parseResult.data;

  const updated = await prisma.atendimento.update({
    where: { id },
    data: {
      title,
      description,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      priority: priority ?? existing.priority
    }
  });

  return res.status(200).json(updated);
}

export async function deleteAppointment(req: Request, res: Response) {
  const { id } = req.params;

  const existing = await prisma.atendimento.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  await prisma.atendimento.delete({ where: { id } });

  return res.status(200).json({
    message: 'Appointment deleted successfully'
  });
}

export async function updateAppointmentStatus(req: Request, res: Response) {
  const { id } = req.params;

  const existing = await prisma.atendimento.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const parseResult = updateStatusSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid status payload', issues: parseResult.error.issues });
  }

  const { status } = parseResult.data;

  const next = validNextStatus[existing.status];

  if (!next || next !== status) {
    return res.status(400).json({
      message: `Invalid status transition from ${existing.status} to ${status}`
    });
  }

  const data: Record<string, unknown> = { status };

  if (status === AtendimentoStatus.EM_ATENDIMENTO && !existing.startedAt) {
    data.startedAt = new Date();
  }

  if (status === AtendimentoStatus.FINALIZADO && !existing.finishedAt) {
    data.finishedAt = new Date();
  }

  const updated = await prisma.atendimento.update({
    where: { id },
    data
  });

  return res.status(200).json(updated);
}


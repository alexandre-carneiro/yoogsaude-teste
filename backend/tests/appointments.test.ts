import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';
import { AtendimentoStatus } from '@prisma/client';

describe('Appointments API', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.atendimento.deleteMany();
    await prisma.paciente.deleteMany();
    await prisma.$disconnect();
  });

  async function createTestPatient() {
    return prisma.paciente.create({
      data: {
        name: 'Patient For Appointment',
        phone: '+55 11 90000-0000',
        email: `patient.${Date.now()}@example.com`
      }
    });
  }

  it('should create an appointment with status AGUARDANDO', async () => {
    const patient = await createTestPatient();

    const response = await request(app)
      .post('/api/appointments')
      .send({
        patientId: patient.id,
        title: 'Initial Consultation',
        description: 'First appointment',
        scheduledFor: '2026-03-20T10:00:00.000Z',
        priority: 1
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe(AtendimentoStatus.AGUARDANDO);
  });

  it('should reject an invalid status transition', async () => {
    const patient = await createTestPatient();

    const createResponse = await request(app)
      .post('/api/appointments')
      .send({
        patientId: patient.id,
        title: 'Status Flow Test',
        description: 'Testing invalid transition',
        scheduledFor: '2026-03-21T10:00:00.000Z'
      });

    const appointmentId = createResponse.body.id as string;

    const invalidTransition = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .send({ status: AtendimentoStatus.FINALIZADO });

    expect(invalidTransition.status).toBe(400);
    expect(invalidTransition.body.message).toContain('Transição de status inválida');
  });

  it('should perform the full status transition flow until FINALIZADO', async () => {
    const patient = await createTestPatient();

    const createResponse = await request(app)
      .post('/api/appointments')
      .send({
        patientId: patient.id,
        title: 'Full Flow',
        description: 'Testing full status flow'
      });

    const appointmentId = createResponse.body.id as string;

    // AGUARDANDO -> EM_ATENDIMENTO
    const toInProgress = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .send({ status: AtendimentoStatus.EM_ATENDIMENTO });

    expect(toInProgress.status).toBe(200);
    expect(toInProgress.body.status).toBe(AtendimentoStatus.EM_ATENDIMENTO);
    expect(toInProgress.body.startedAt).toBeTruthy();

    // EM_ATENDIMENTO -> FINALIZADO
    const toFinished = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .send({ status: AtendimentoStatus.FINALIZADO });

    expect(toFinished.status).toBe(200);
    expect(toFinished.body.status).toBe(AtendimentoStatus.FINALIZADO);
    expect(toFinished.body.finishedAt).toBeTruthy();
  });
});

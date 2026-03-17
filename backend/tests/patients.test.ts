import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';

describe('Patients API', () => {
  beforeAll(async () => {
    // Garantir que a conexão com o banco está ativa
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.atendimento.deleteMany();
    await prisma.paciente.deleteMany();
    await prisma.$disconnect();
  });

  it('should create, list, get, update and delete a patient', async () => {
    const email = `john.${Date.now()}@example.com`;

    // Create
    const createResponse = await request(app)
      .post('/api/patients')
      .send({
        name: 'John Doe',
        phone: '+55 11 99999-0000',
        email,
        birthDate: '1990-01-01T00:00:00.000Z',
        notes: 'First test patient'
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toHaveProperty('id');

    const patientId = createResponse.body.id as string;

    // List
    const listResponse = await request(app).get('/api/patients');
    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.some((p: any) => p.id === patientId)).toBe(true);

    // Get by id
    const getResponse = await request(app).get(`/api/patients/${patientId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(patientId);

    // Update
    const updateResponse = await request(app)
      .put(`/api/patients/${patientId}`)
      .send({
        name: 'John Doe Jr.',
        phone: '+55 11 98888-0000',
        notes: 'Updated notes'
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('John Doe Jr.');

    // Delete
    const deleteResponse = await request(app).delete(`/api/patients/${patientId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({
      message: 'Patient deleted successfully'
    });

    const getAfterDelete = await request(app).get(`/api/patients/${patientId}`);
    expect(getAfterDelete.status).toBe(404);
  });
});

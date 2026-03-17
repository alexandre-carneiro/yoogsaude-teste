import request from 'supertest';
import { app } from '../src/app';

describe('Healthcheck da aplicação', () => {
  it('deve retornar 200 e o status operacional', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

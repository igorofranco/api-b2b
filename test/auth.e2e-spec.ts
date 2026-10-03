import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';

const ADMIN_EMAIL = 'admin@api-b2b.dev';
const ADMIN_PASSWORD = 'admin123';
const CUSTOMER_EMAIL = 'compras@metalurgica.dev';
const CUSTOMER_PASSWORD = 'cliente123';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('faz login do admin e devolve access token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);

    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.user).toMatchObject({ role: 'ADMIN' });
    expect(response.body.user.email).toBe(ADMIN_EMAIL);
  });

  it('rejeita credenciais inválidas com 401', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, password: 'senha-errada' })
      .expect(401);

    expect(response.body).toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('rejeita payload inválido com 400 e código de validação', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'nao-e-email', password: '' })
      .expect(400);

    expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('devolve o usuário logado em /auth/me', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: CUSTOMER_EMAIL, password: CUSTOMER_PASSWORD })
      .expect(200);

    const token = login.body.accessToken as string;

    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      email: CUSTOMER_EMAIL,
      role: 'CUSTOMER',
    });
    expect(response.body.customerId).toBeTruthy();
  });

  it('bloqueia /auth/me sem token com 401', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .expect(401);

    expect(response.body).toMatchObject({ code: 'UNAUTHENTICATED' });
  });
});

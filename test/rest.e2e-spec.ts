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

async function login(
  app: INestApplication<App>,
  email: string,
  password: string,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);
  return response.body.accessToken as string;
}

describe('REST base (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    adminToken = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    customerToken = await login(app, CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
  });

  afterAll(async () => {
    await app.close();
  });

  it('lista clientes de forma paginada para admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/customers?page=1&limit=2')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(2);
    expect(response.body.total).toBeGreaterThanOrEqual(3);
    expect(response.body.items.length).toBeLessThanOrEqual(2);
  });

  it('lista produtos para usuário autenticado', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/products?limit=5')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(response.body.items.length).toBeGreaterThan(0);
    expect(response.body.total).toBeGreaterThan(0);
  });

  it('bloqueia recurso protegido sem token com 401', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/customers')
      .expect(401);

    expect(response.body).toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('bloqueia rota de admin para o papel cliente com 403', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/customers')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);

    expect(response.body).toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejeita payload inválido com 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ sku: 'E2E-INVALIDO' })
      .expect(400);

    expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('cria, busca e inativa um produto como admin', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: 'E2E-PROD-1',
        name: 'Produto de teste e2e',
        unit: 'UN',
        basePriceCents: 1234,
      })
      .expect(201);

    const productId = create.body.id as string;
    expect(create.body.sku).toBe('E2E-PROD-1');

    const search = await request(app.getHttpServer())
      .get('/api/v1/products?search=E2E-PROD-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(search.body.total).toBe(1);

    const inactivate = await request(app.getHttpServer())
      .patch(`/api/v1/products/${productId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'INACTIVE' })
      .expect(200);

    expect(inactivate.body.status).toBe('INACTIVE');
  });

  it('bloqueia criação de produto para o papel cliente com 403', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        sku: 'E2E-PROD-2',
        name: 'Produto proibido',
        unit: 'UN',
        basePriceCents: 1000,
      })
      .expect(403);
  });
});

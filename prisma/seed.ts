import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const CUSTOMER_IDS = {
  metalurgica: 'c0000000-0000-4000-8000-000000000001',
  distribuidora: 'c0000000-0000-4000-8000-000000000002',
  construtora: 'c0000000-0000-4000-8000-000000000003',
} as const;

const PRICE_TABLE_IDS = {
  metalurgica: 'p1000000-0000-4000-8000-000000000001',
  distribuidora: 'p1000000-0000-4000-8000-000000000002',
  construtora: 'p1000000-0000-4000-8000-000000000003',
} as const;

interface SeedProduct {
  sku: string;
  name: string;
  description: string;
  unit: string;
  basePrice: number;
  onHand: number;
}

const PRODUCTS: SeedProduct[] = [
  {
    sku: 'PAR-M8-30',
    name: 'Parafuso sextavado M8 x 30mm',
    description: 'Aço inox 304',
    unit: 'UN',
    basePrice: 120,
    onHand: 5000,
  },
  {
    sku: 'PAR-M10-50',
    name: 'Parafuso sextavado M10 x 50mm',
    description: 'Aço inox 304',
    unit: 'UN',
    basePrice: 210,
    onHand: 4200,
  },
  {
    sku: 'POR-M8',
    name: 'Porca sextavada M8',
    description: 'Aço inox 304',
    unit: 'UN',
    basePrice: 45,
    onHand: 8000,
  },
  {
    sku: 'POR-M10',
    name: 'Porca sextavada M10',
    description: 'Aço inox 304',
    unit: 'UN',
    basePrice: 70,
    onHand: 6500,
  },
  {
    sku: 'ARR-1-2',
    name: 'Arruela lisa 1/2"',
    description: 'Aço zincado',
    unit: 'UN',
    basePrice: 25,
    onHand: 12000,
  },
  {
    sku: 'ARR-M8',
    name: 'Arruela de pressão M8',
    description: 'Aço mola',
    unit: 'UN',
    basePrice: 30,
    onHand: 9000,
  },
  {
    sku: 'CHV-FENDA-1-4',
    name: 'Chave de fenda 1/4" x 6"',
    description: 'Cabo emborrachado',
    unit: 'UN',
    basePrice: 1890,
    onHand: 320,
  },
  {
    sku: 'CHV-PHIL-3-16',
    name: 'Chave Phillips 3/16" x 4"',
    description: 'Ponta magnética',
    unit: 'UN',
    basePrice: 2190,
    onHand: 280,
  },
  {
    sku: 'ALI-UNIV-8',
    name: 'Alicate universal 8"',
    description: 'Aço cromo-vanádio',
    unit: 'UN',
    basePrice: 4290,
    onHand: 150,
  },
  {
    sku: 'ALI-CORT-6',
    name: 'Alicate de corte diagonal 6"',
    description: 'Isolado 1000V',
    unit: 'UN',
    basePrice: 3890,
    onHand: 95,
  },
  {
    sku: 'FUR-500W',
    name: 'Furadeira de impacto 500W',
    description: '220V, mandril 1/2"',
    unit: 'UN',
    basePrice: 24900,
    onHand: 40,
  },
  {
    sku: 'FUR-850W',
    name: 'Furadeira de impacto 850W',
    description: '220V, velocidade variável',
    unit: 'UN',
    basePrice: 39900,
    onHand: 25,
  },
  {
    sku: 'SER-CIRC-7-1-4',
    name: 'Serra circular 7 1/4"',
    description: '1800W, 220V',
    unit: 'UN',
    basePrice: 58900,
    onHand: 18,
  },
  {
    sku: 'ESM-ANG-4-1-2',
    name: 'Esmerilhadeira angular 4 1/2"',
    description: '850W, 220V',
    unit: 'UN',
    basePrice: 32900,
    onHand: 30,
  },
  {
    sku: 'FIT-TEF-18',
    name: 'Fita veda rosca 18mm x 50m',
    description: 'PTFE',
    unit: 'UN',
    basePrice: 890,
    onHand: 600,
  },
  {
    sku: 'TUB-PVC-25',
    name: 'Tubo PVC soldável 25mm x 3m',
    description: 'Água fria',
    unit: 'BR',
    basePrice: 2790,
    onHand: 210,
  },
  {
    sku: 'CON-PVC-25',
    name: 'Conexão PVC 25mm',
    description: 'Joelho 90 graus',
    unit: 'UN',
    basePrice: 320,
    onHand: 1500,
  },
  {
    sku: 'CAB-FLX-2-5',
    name: 'Cabo flexível 2,5mm',
    description: 'Rolo 100m, 750V',
    unit: 'RL',
    basePrice: 42900,
    onHand: 60,
  },
  {
    sku: 'DIS-JUN-20A',
    name: 'Disjuntor monopolizar 20A',
    description: 'Curva C',
    unit: 'UN',
    basePrice: 1590,
    onHand: 400,
  },
  {
    sku: 'LUM-LED-20',
    name: 'Luminária LED 20W',
    description: 'Bivolt, IP65',
    unit: 'UN',
    basePrice: 8990,
    onHand: 5,
  },
];

async function main(): Promise<void> {
  const connectionString =
    process.env.DATABASE_URL ??
    'postgresql://apib2b:apib2b@localhost:5433/apib2b?schema=public';
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.stockReservation.deleteMany();
      await transaction.orderItem.deleteMany();
      await transaction.order.deleteMany();
      await transaction.stock.deleteMany();
      await transaction.priceTableItem.deleteMany();
      await transaction.customer.deleteMany();
      await transaction.priceTable.deleteMany();
      await transaction.product.deleteMany();

      const products = await Promise.all(
        PRODUCTS.map(async (product, index) => {
          const id = `d0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
          const created = await transaction.product.create({
            data: {
              id,
              sku: product.sku,
              name: product.name,
              description: product.description,
              unit: product.unit,
              basePrice: product.basePrice,
            },
          });
          await transaction.stock.create({
            data: {
              id: randomUUID(),
              productId: created.id,
              quantityOnHand: product.onHand,
              quantityReserved: 0,
            },
          });
          return created;
        }),
      );

      await transaction.priceTable.create({
        data: {
          id: PRICE_TABLE_IDS.metalurgica,
          name: 'Contrato Metalúrgica Ferro Forte 2026',
          validFrom: new Date('2026-01-01T00:00:00.000Z'),
          validTo: new Date('2026-12-31T23:59:59.000Z'),
          items: {
            create: products.map((product, index) => ({
              id: randomUUID(),
              productId: product.id,
              price: Math.round(
                product.basePrice * (index % 3 === 0 ? 0.85 : 0.92),
              ),
            })),
          },
        },
      });

      await transaction.priceTable.create({
        data: {
          id: PRICE_TABLE_IDS.distribuidora,
          name: 'Contrato Distribuidora Central 2026',
          validFrom: new Date('2026-01-01T00:00:00.000Z'),
          items: {
            create: products.slice(0, 12).map((product, index) => ({
              id: randomUUID(),
              productId: product.id,
              price: Math.round(
                product.basePrice * (index % 2 === 0 ? 0.78 : 0.88),
              ),
            })),
          },
        },
      });

      await transaction.priceTable.create({
        data: {
          id: PRICE_TABLE_IDS.construtora,
          name: 'Contrato Construtora Horizonte 2026',
          validFrom: new Date('2026-01-01T00:00:00.000Z'),
          items: {
            create: products.slice(10).map((product) => ({
              id: randomUUID(),
              productId: product.id,
              price: Math.round(product.basePrice * 0.9),
            })),
          },
        },
      });

      await transaction.customer.createMany({
        data: [
          {
            id: CUSTOMER_IDS.metalurgica,
            name: 'Metalúrgica Ferro Forte LTDA',
            cnpj: '11222333000181',
            creditLimit: 5_000_000,
            priceTableId: PRICE_TABLE_IDS.metalurgica,
          },
          {
            id: CUSTOMER_IDS.distribuidora,
            name: 'Distribuidora Central de Peças SA',
            cnpj: '11444777000161',
            creditLimit: 12_000_000,
            priceTableId: PRICE_TABLE_IDS.distribuidora,
          },
          {
            id: CUSTOMER_IDS.construtora,
            name: 'Construtora Horizonte Engenharia LTDA',
            cnpj: '34028316000103',
            creditLimit: 800_000,
            priceTableId: PRICE_TABLE_IDS.construtora,
          },
        ],
      });
    });

    console.log(
      'Seed concluído: 20 produtos, 3 tabelas de preço, 3 clientes e estoque.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

await main();

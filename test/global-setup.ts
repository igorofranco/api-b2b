import 'dotenv/config';
import { execSync } from 'node:child_process';

const TEST_DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://apib2b:apib2b@localhost:5433/apib2b_test?schema=public';

export async function setup(): Promise<void> {
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
  execSync('npx prisma db seed', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
}

export async function teardown(): Promise<void> {
  // O banco de teste é recriado no próximo `migrate deploy` + seed.
}

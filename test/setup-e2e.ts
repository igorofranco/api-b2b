import 'dotenv/config';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??=
  'postgresql://apib2b:apib2b@localhost:5433/apib2b_test?schema=public';

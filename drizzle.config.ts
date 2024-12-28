import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  verbose: true,
  strict: true,
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.DB_URL as string,
    ssl: false
  },
});

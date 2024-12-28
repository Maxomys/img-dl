import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const ImageTable = pgTable('image', {
  id: serial('id').primaryKey(),
  sourceUrl: varchar().notNull(),
  addedAt: timestamp().notNull(),
  downloadedAt: timestamp(),
  localPath: varchar()
});

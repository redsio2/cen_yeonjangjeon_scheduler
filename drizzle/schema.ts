import { relations } from "drizzle-orm";
import { date, index, pgEnum, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";
import { SCHEDULE_TYPES } from "../src/types/schedule";

export const scheduleType = pgEnum('schedule_type', SCHEDULE_TYPES);

export const schedules = pgTable('schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  date: date('date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  type: scheduleType('type').notNull(),
  assignee: text('assignee').notNull(),
  location: text('location').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const scheduleMemos = pgTable('schedule_memos', {
  id: uuid('id').primaryKey().defaultRandom(),
  scheduleId: uuid('schedule_id')
    .notNull()
    .references(() => schedules.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('schedule_memos_schedule_id_idx').on(t.scheduleId),
]);

export const schedulesRelations = relations(schedules, ({ many }) => ({
  memos: many(scheduleMemos),
}));

export const scheduleMemosRelations = relations(scheduleMemos, ({ one }) => ({
  schedule: one(schedules, { fields: [scheduleMemos.scheduleId], references: [schedules.id] }),
}));

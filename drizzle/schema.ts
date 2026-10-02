import { date, pgEnum, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";
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

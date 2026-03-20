import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  status: text("status").notNull().default("pending_review"),
  contentType: text("content_type").notNull(),
  prompt: text("prompt").notNull(),
  draft: text("draft").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  remindedAt: text("reminded_at"),
  resolvedAt: text("resolved_at"),
  snoozeUntil: text("snooze_until"),
  reminderEpoch: integer("reminder_epoch").notNull().default(0),
});

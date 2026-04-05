import { pgTable, text } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  status: text("status").notNull().default("pending"),
  description: text("description").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  remindAt: text("remind_at"),
  remindedAt: text("reminded_at"),
  doneAt: text("done_at"),
});

import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversionJobs = pgTable("conversion_jobs", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  originalData: jsonb("original_data").notNull(),
  convertedData: jsonb("converted_data"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  errorMessage: text("error_message"),
  fileSize: integer("file_size").notNull(),
  timestampFormat: text("timestamp_format").notNull(), // iso, milliseconds
  createdAt: integer("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConversionJobSchema = createInsertSchema(conversionJobs).pick({
  fileName: true,
  originalData: true,
  fileSize: true,
  timestampFormat: true,
});

// Telemetry data schemas
export const telemetryEntrySchema = z.object({
  timestamp: z.union([z.string(), z.number()]),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  pressure: z.number().optional(),
  // Allow additional fields
}).passthrough();

export const telemetryDataSchema = z.object({
  telemetry: z.array(telemetryEntrySchema),
}).passthrough();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ConversionJob = typeof conversionJobs.$inferSelect;
export type InsertConversionJob = z.infer<typeof insertConversionJobSchema>;
export type TelemetryEntry = z.infer<typeof telemetryEntrySchema>;
export type TelemetryData = z.infer<typeof telemetryDataSchema>;

import { users, conversionJobs, type User, type InsertUser, type ConversionJob, type InsertConversionJob } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conversion job methods
  createConversionJob(job: InsertConversionJob): Promise<ConversionJob>;
  getConversionJob(id: number): Promise<ConversionJob | undefined>;
  updateConversionJob(id: number, updates: Partial<ConversionJob>): Promise<ConversionJob | undefined>;
  getAllConversionJobs(): Promise<ConversionJob[]>;
  deleteConversionJob(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createConversionJob(insertJob: InsertConversionJob): Promise<ConversionJob> {
    const [job] = await db
      .insert(conversionJobs)
      .values({
        ...insertJob,
        createdAt: Date.now(),
      })
      .returning();
    return job;
  }

  async getConversionJob(id: number): Promise<ConversionJob | undefined> {
    const [job] = await db.select().from(conversionJobs).where(eq(conversionJobs.id, id));
    return job || undefined;
  }

  async updateConversionJob(id: number, updates: Partial<ConversionJob>): Promise<ConversionJob | undefined> {
    const [job] = await db
      .update(conversionJobs)
      .set(updates)
      .where(eq(conversionJobs.id, id))
      .returning();
    return job || undefined;
  }

  async getAllConversionJobs(): Promise<ConversionJob[]> {
    return await db.select().from(conversionJobs);
  }

  async deleteConversionJob(id: number): Promise<boolean> {
    const result = await db
      .delete(conversionJobs)
      .where(eq(conversionJobs.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();

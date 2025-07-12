import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { telemetryDataSchema, insertConversionJobSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

function convertISOToMilliseconds(timestamp: string): number {
  return new Date(timestamp).getTime();
}

function detectTimestampFormat(data: any): "iso" | "milliseconds" | "unknown" {
  if (data.telemetry && Array.isArray(data.telemetry) && data.telemetry.length > 0) {
    const firstTimestamp = data.telemetry[0].timestamp;
    if (typeof firstTimestamp === "string" && firstTimestamp.includes("T")) {
      return "iso";
    } else if (typeof firstTimestamp === "number") {
      return "milliseconds";
    }
  }
  return "unknown";
}

function convertTelemetryData(data: any): any {
  const format = detectTimestampFormat(data);
  
  if (format === "iso") {
    // Convert ISO timestamps to milliseconds
    return {
      ...data,
      telemetry: data.telemetry.map((entry: any) => ({
        ...entry,
        timestamp: convertISOToMilliseconds(entry.timestamp),
      })),
    };
  } else if (format === "milliseconds") {
    // Already in correct format
    return data;
  }
  
  throw new Error("Unknown timestamp format");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload and convert files
  app.post("/api/convert", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString("utf-8");
      let originalData;

      try {
        originalData = JSON.parse(fileContent);
      } catch (error) {
        return res.status(400).json({ message: "Invalid JSON format" });
      }

      // Validate telemetry data structure
      const validationResult = telemetryDataSchema.safeParse(originalData);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid telemetry data structure",
          errors: validationResult.error.errors 
        });
      }

      const timestampFormat = detectTimestampFormat(originalData);
      
      // Create conversion job
      const job = await storage.createConversionJob({
        fileName: req.file.originalname,
        originalData,
        fileSize: req.file.size,
        timestampFormat,
      });

      // Process conversion
      try {
        const convertedData = convertTelemetryData(originalData);
        
        await storage.updateConversionJob(job.id, {
          convertedData,
          status: "completed",
        });

        res.json({
          jobId: job.id,
          status: "completed",
          originalFormat: timestampFormat,
          convertedData,
        });
      } catch (conversionError) {
        await storage.updateConversionJob(job.id, {
          status: "failed",
          errorMessage: conversionError instanceof Error ? conversionError.message : "Conversion failed",
        });

        res.status(500).json({
          jobId: job.id,
          status: "failed",
          message: conversionError instanceof Error ? conversionError.message : "Conversion failed",
        });
      }
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Get conversion job status
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getConversionJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json(job);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Get all conversion jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllConversionJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Delete conversion job
  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const deleted = await storage.deleteConversionJob(jobId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

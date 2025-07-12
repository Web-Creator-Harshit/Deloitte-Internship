export function convertISOToMilliseconds(timestamp: string): number {
  return new Date(timestamp).getTime();
}

export function detectTimestampFormat(data: any): "iso" | "milliseconds" | "unknown" {
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

export function convertTelemetryData(data: any): any {
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

export function validateTelemetryData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object');
    return { valid: false, errors };
  }
  
  if (!data.telemetry || !Array.isArray(data.telemetry)) {
    errors.push('Data must contain a telemetry array');
    return { valid: false, errors };
  }
  
  if (data.telemetry.length === 0) {
    errors.push('Telemetry array cannot be empty');
    return { valid: false, errors };
  }
  
  // Check each telemetry entry
  data.telemetry.forEach((entry: any, index: number) => {
    if (!entry || typeof entry !== 'object') {
      errors.push(`Telemetry entry ${index} must be an object`);
      return;
    }
    
    if (!entry.timestamp) {
      errors.push(`Telemetry entry ${index} must have a timestamp`);
      return;
    }
    
    if (typeof entry.timestamp !== 'string' && typeof entry.timestamp !== 'number') {
      errors.push(`Telemetry entry ${index} timestamp must be a string or number`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

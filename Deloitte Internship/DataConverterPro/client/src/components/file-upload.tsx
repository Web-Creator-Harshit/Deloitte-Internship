import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type ConversionJob } from "@shared/schema";

interface FileUploadProps {
  selectedFiles: File[];
  onFilesSelected: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  onConversionComplete: (job: ConversionJob) => void;
}

export function FileUpload({ 
  selectedFiles, 
  onFilesSelected, 
  onFileRemove, 
  onConversionComplete 
}: FileUploadProps) {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const convertMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiRequest('POST', '/api/convert', formData);
      return response.json();
    },
    onSuccess: (data) => {
      onConversionComplete(data);
      toast({
        title: "Conversion successful",
        description: `File converted from ${data.originalFormat} format`,
      });
    },
    onError: (error) => {
      toast({
        title: "Conversion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const jsonFiles = acceptedFiles.filter(file => 
      file.type === 'application/json' || file.name.endsWith('.json')
    );
    
    if (jsonFiles.length !== acceptedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload only JSON files",
        variant: "destructive",
      });
    }
    
    if (jsonFiles.length > 0) {
      onFilesSelected([...selectedFiles, ...jsonFiles]);
    }
  }, [selectedFiles, onFilesSelected, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const detectFileFormat = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          if (content.telemetry && content.telemetry.length > 0) {
            const firstTimestamp = content.telemetry[0].timestamp;
            if (typeof firstTimestamp === 'string' && firstTimestamp.includes('T')) {
              resolve('ISO format');
            } else if (typeof firstTimestamp === 'number') {
              resolve('Milliseconds format');
            }
          }
          resolve('Unknown format');
        } catch {
          resolve('Invalid JSON');
        }
      };
      reader.readAsText(file);
    });
  };

  const handleStartConversion = async () => {
    for (const file of selectedFiles) {
      await convertMutation.mutateAsync(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Upload className="text-blue-500 mr-2 h-5 w-5" />
          Upload JSON Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive || isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-lg font-medium text-slate-700 mb-2">
            Drop your JSON files here
          </p>
          <p className="text-sm text-slate-500 mb-4">or click to browse</p>
          <Button className="bg-blue-500 hover:bg-blue-600">
            Choose Files
          </Button>
          <p className="text-xs text-slate-400 mt-3">
            Supports: data-1.json, data-2.json formats
          </p>
        </div>

        {/* File List */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            {selectedFiles.map((file, index) => (
              <FileItem
                key={index}
                file={file}
                onRemove={() => onFileRemove(index)}
              />
            ))}
            
            {selectedFiles.length > 0 && (
              <Button
                onClick={handleStartConversion}
                disabled={convertMutation.isPending}
                className="w-full bg-blue-500 hover:bg-blue-600 mt-4"
              >
                {convertMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Start Conversion
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FileItemProps {
  file: File;
  onRemove: () => void;
}

function FileItem({ file, onRemove }: FileItemProps) {
  const [format, setFormat] = useState<string>('Analyzing...');

  useState(() => {
    const detectFormat = async () => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          if (content.telemetry && content.telemetry.length > 0) {
            const firstTimestamp = content.telemetry[0].timestamp;
            if (typeof firstTimestamp === 'string' && firstTimestamp.includes('T')) {
              setFormat('ISO format');
            } else if (typeof firstTimestamp === 'number') {
              setFormat('Milliseconds format');
            } else {
              setFormat('Unknown format');
            }
          } else {
            setFormat('Invalid structure');
          }
        } catch {
          setFormat('Invalid JSON');
        }
      };
      reader.readAsText(file);
    };
    
    detectFormat();
  });

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <FileText className="text-blue-500 h-5 w-5" />
        <div>
          <p className="text-sm font-medium text-slate-900">{file.name}</p>
          <p className="text-xs text-slate-500">
            {format} • {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
          Ready
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-slate-400 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { DataPreview } from "@/components/data-preview";
import { ConversionStatus } from "@/components/conversion-status";
import { WorkflowSteps } from "@/components/workflow-steps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Archive, Play, ArrowRightLeft, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type ConversionJob } from "@shared/schema";

export default function Converter() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [conversionJobs, setConversionJobs] = useState<ConversionJob[]>([]);
  const [validateJson, setValidateJson] = useState(true);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState<'original' | 'converted'>('original');
  const [isCreatingZip, setIsCreatingZip] = useState(false);

  const { data: jobs, refetch } = useQuery({
    queryKey: ['/api/jobs'],
    enabled: conversionJobs.length > 0,
  });

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setCurrentStep(2);
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setCurrentStep(1);
    }
  };

  const handleConversionComplete = (job: ConversionJob) => {
    setConversionJobs(prev => [...prev, job]);
    setCurrentStep(3);
    refetch();
  };

  const downloadFile = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = async () => {
    if (!jobs || jobs.length === 0) return;
    
    setIsCreatingZip(true);
    
    try {
      // Dynamic import to avoid bundling JSZip if not needed
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Add each converted file to the zip
      jobs.forEach((job: ConversionJob) => {
        if (job.convertedData && job.status === 'completed') {
          const fileName = `converted-${job.fileName}`;
          zip.file(fileName, JSON.stringify(job.convertedData, null, 2));
        }
      });
      
      // Generate and download the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-telemetry-data-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
    } finally {
      setIsCreatingZip(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <ArrowRightLeft className="text-blue-500 h-5 w-5" />
              <h1 className="text-xl font-semibold text-slate-900">Telemetry Data Converter</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500">Convert ISO timestamps to milliseconds</span>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workflow Steps */}
        <WorkflowSteps currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Controls */}
          <div className="space-y-6">
            <FileUpload
              selectedFiles={selectedFiles}
              onFilesSelected={handleFilesSelected}
              onFileRemove={handleFileRemove}
              onConversionComplete={handleConversionComplete}
            />

            {/* Conversion Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Play className="text-blue-500 mr-2 h-5 w-5" />
                  Conversion Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Output Format
                  </label>
                  <Select defaultValue="unified">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unified">Unified Format (Milliseconds)</SelectItem>
                      <SelectItem value="iso" disabled>ISO Format (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validate"
                    checked={validateJson}
                    onCheckedChange={(checked) => setValidateJson(checked as boolean)}
                  />
                  <label htmlFor="validate" className="text-sm text-slate-700">
                    Validate JSON structure
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview and Results */}
          <div className="space-y-6">
            <DataPreview
              data={previewData}
              mode={previewMode}
              onModeChange={setPreviewMode}
              selectedFiles={selectedFiles}
              onDataChange={setPreviewData}
            />

            <ConversionStatus jobs={conversionJobs} />

            {/* Download Results */}
            {jobs && jobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Download className="text-blue-500 mr-2 h-5 w-5" />
                    Download Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {jobs.map((job: ConversionJob) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-green-500">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            converted-{job.fileName}
                          </p>
                          <p className="text-xs text-slate-500">
                            Unified format • {Math.round(job.fileSize / 1024 * 1.1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => downloadFile(job.convertedData, `converted-${job.fileName}`)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}

                  <Button
                    className="w-full bg-slate-500 hover:bg-slate-600"
                    onClick={downloadAllAsZip}
                    disabled={isCreatingZip}
                  >
                    {isCreatingZip ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating ZIP...
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4 mr-2" />
                        Download All as ZIP
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-slate-500">
            <p>Telemetry Data Converter • Convert between ISO timestamps and milliseconds</p>
            <p className="mt-2">
              <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">Documentation</a> • 
              <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">API Reference</a> • 
              <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">Support</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

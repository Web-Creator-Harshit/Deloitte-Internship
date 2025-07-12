import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Loader2, Info } from "lucide-react";
import { type ConversionJob } from "@shared/schema";

interface ConversionStatusProps {
  jobs: ConversionJob[];
}

export function ConversionStatus({ jobs }: ConversionStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500 h-5 w-5" />;
      case 'failed':
        return <AlertCircle className="text-red-500 h-5 w-5" />;
      case 'processing':
        return <Loader2 className="text-blue-500 h-5 w-5 animate-spin" />;
      default:
        return <Info className="text-blue-500 h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-800';
      case 'failed':
        return 'bg-red-50 text-red-800';
      case 'processing':
        return 'bg-blue-50 text-blue-800';
      default:
        return 'bg-slate-50 text-slate-800';
    }
  };

  const getStatusMessage = (job: ConversionJob) => {
    switch (job.status) {
      case 'completed':
        return `${job.fileName} processed successfully`;
      case 'failed':
        return `Failed to process ${job.fileName}`;
      case 'processing':
        return `Processing ${job.fileName}...`;
      default:
        return `${job.fileName} queued for processing`;
    }
  };

  const getStatusDetails = (job: ConversionJob) => {
    switch (job.status) {
      case 'completed':
        const entryCount = job.convertedData?.telemetry?.length || 0;
        return `Converted ${entryCount} timestamp entries`;
      case 'failed':
        return job.errorMessage || 'Unknown error occurred';
      case 'processing':
        return 'Converting timestamps to milliseconds';
      default:
        return 'Waiting to start';
    }
  };

  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const totalJobs = jobs.length;
  const progressPercentage = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Info className="text-blue-500 mr-2 h-5 w-5" />
          Conversion Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Status Messages */}
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <Info className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No conversion jobs yet</p>
              <p className="text-sm">Upload files to start converting</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className={`flex items-center space-x-3 p-3 rounded-lg ${getStatusColor(job.status)}`}
              >
                {getStatusIcon(job.status)}
                <div>
                  <p className="text-sm font-medium">{getStatusMessage(job)}</p>
                  <p className="text-xs">{getStatusDetails(job)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Progress Bar */}
        {totalJobs > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Overall Progress</span>
              <span className="text-sm text-slate-600">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

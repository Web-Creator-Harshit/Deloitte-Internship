import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface DataPreviewProps {
  data: any;
  mode: 'original' | 'converted';
  onModeChange: (mode: 'original' | 'converted') => void;
  selectedFiles: File[];
  onDataChange: (data: any) => void;
}

export function DataPreview({ 
  data, 
  mode, 
  onModeChange, 
  selectedFiles, 
  onDataChange 
}: DataPreviewProps) {
  const [originalData, setOriginalData] = useState<any>(null);
  const [convertedData, setConvertedData] = useState<any>(null);

  useEffect(() => {
    if (selectedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          setOriginalData(content);
          onDataChange(content);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(selectedFiles[0]);
    }
  }, [selectedFiles, onDataChange]);

  const displayData = mode === 'original' ? originalData : convertedData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Eye className="text-blue-500 mr-2 h-5 w-5" />
          Data Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 bg-slate-100 p-1 rounded-lg">
          <Button
            variant={mode === 'original' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('original')}
            className={`flex-1 ${
              mode === 'original' 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Original
          </Button>
          <Button
            variant={mode === 'converted' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('converted')}
            className={`flex-1 ${
              mode === 'converted' 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Converted
          </Button>
        </div>

        {/* Preview Content */}
        <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-auto">
          <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap">
            {displayData ? JSON.stringify(displayData, null, 2) : (
              selectedFiles.length === 0 
                ? 'No files selected' 
                : 'Loading...'
            )}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

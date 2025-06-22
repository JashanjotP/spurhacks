"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, X, Database, FileSearch, RefreshCw } from "lucide-react";

export default function TestUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadResults([]);

    try {
      // Use a test business ID
      const testBusinessId = "test-business-123";
      const testUserId = "test-user-123";
      
      console.log("Starting file processing...");
      const results = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('businessId', testBusinessId);
        formData.append('userId', testUserId);
        formData.append('filename', file.name);
        
        try {
          const response = await fetch('/api/parse-pdf', {
            method: 'POST',
            body: formData,
          });
          
          const result = await response.json();
          if (response.ok) {
            console.log('File processed successfully:', result);
            results.push({
              filename: file.name,
              success: true,
              data: result.data
            });
          } else {
            console.error('Error processing file:', result.message);
            results.push({
              filename: file.name,
              success: false,
              error: result.message
            });
          }
        } catch (error) {
          console.error('Upload failed:', error);
          results.push({
            filename: file.name,
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed'
          });
        }
      }
      
      setUploadResults(results);
      console.log("Processing completed:", results);
      
    } catch (err) {
      console.error("Processing failed:", err);
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">File Processing Test</h1>
          <p className="text-slate-300">
            Test file processing with pdf-parse and storage in documents/document_chunks tables.
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Process Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-lg text-slate-300 mb-2">
                Select files to process
              </p>
              <p className="text-sm text-slate-400 mb-4">
                Supports PDF files (max 10MB each)
              </p>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Choose Files
                </Button>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-medium">Selected Files:</h4>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-slate-400 text-sm">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-700"
            >
              {isUploading ? "Processing..." : "Process Files"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert className="bg-red-900/20 border-red-800">
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {uploadResults.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Processing Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uploadResults.map((result, index) => (
                  <div key={index} className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{result.filename}</h4>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">Success</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-sm">Failed</span>
                          </>
                        )}
                      </div>
                    </div>
                    {result.success && result.data && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Document ID:</span>
                          <span className="text-white ml-2">{result.data.documentId}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Chunks Created:</span>
                          <span className="text-white ml-2">{result.data.chunksCreated}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Total Characters:</span>
                          <span className="text-white ml-2">{result.data.totalCharacters}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">File Size:</span>
                          <span className="text-white ml-2">
                            {(result.data.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    )}
                    {!result.success && result.error && (
                      <div className="text-red-400 text-sm mt-2">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 
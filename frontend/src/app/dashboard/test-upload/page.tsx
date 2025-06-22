"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, X } from "lucide-react";
import { fileUploadService } from "@/lib/supabase/file-upload-service";

export default function TestUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [storageContents, setStorageContents] = useState<any[]>([]);

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
      
      console.log("Starting file upload test...");
      const results = await fileUploadService.uploadFiles(files, testBusinessId);
      
      setUploadResults(results);
      console.log("Upload completed:", results);
      
      // Check storage contents after upload
      await checkStorageContents();
      
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const checkStorageContents = async () => {
    try {
      const contents = await fileUploadService.listStorageContents();
      setStorageContents(contents || []);
      console.log("Storage contents:", contents);
    } catch (err) {
      console.error("Failed to list storage contents:", err);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">File Upload Test</h1>
          <p className="text-slate-300">
            Test file uploads to Supabase Storage and check if files are stored correctly.
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Upload Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-lg text-slate-300 mb-2">
                Select files to upload
              </p>
              <p className="text-sm text-slate-400 mb-4">
                Supports PDF, DOC, DOCX, TXT (max 10MB each)
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
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
                <h4 className="font-semibold text-white">Selected Files:</h4>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span className="text-slate-300">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
              <Button
                onClick={checkStorageContents}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Check Storage
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="border-red-700 bg-red-900/20">
            <AlertDescription className="text-red-200">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {uploadResults.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                Upload Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uploadResults.map((result, index) => (
                  <div key={index} className="p-3 bg-slate-800 rounded">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-slate-300 font-medium">{result.filename}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      ID: {result.id} | Size: {(result.file_size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {storageContents.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Storage Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {storageContents.map((item, index) => (
                  <div key={index} className="p-3 bg-slate-800 rounded">
                    <div className="text-slate-300">{item.name}</div>
                    <div className="text-xs text-slate-400">
                      Size: {item.metadata?.size ? (item.metadata.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}
                    </div>
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
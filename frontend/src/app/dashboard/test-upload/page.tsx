"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, X, Database, HardDrive, RefreshCw } from "lucide-react";
import { fileUploadService } from "@/lib/supabase/file-upload-service";

export default function TestUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [storageContents, setStorageContents] = useState<any[]>([]);
  const [databaseContents, setDatabaseContents] = useState<any[]>([]);
  const [isLoadingStorage, setIsLoadingStorage] = useState(false);
  const [isLoadingDatabase, setIsLoadingDatabase] = useState(false);

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
      
      // Check storage and database contents after upload
      await checkStorageContents();
      await checkDatabaseContents();
      
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const checkStorageContents = async () => {
    setIsLoadingStorage(true);
    try {
      const contents = await fileUploadService.listStorageContents();
      setStorageContents(contents || []);
      console.log("Storage contents:", contents);
    } catch (err) {
      console.error("Failed to list storage contents:", err);
      setError(err instanceof Error ? err.message : "Failed to list storage");
    } finally {
      setIsLoadingStorage(false);
    }
  };

  const checkDatabaseContents = async () => {
    setIsLoadingDatabase(true);
    try {
      const contents = await fileUploadService.listDatabaseDocuments();
      setDatabaseContents(contents || []);
      console.log("Database contents:", contents);
    } catch (err) {
      console.error("Failed to list database contents:", err);
      setError(err instanceof Error ? err.message : "Failed to list database");
    } finally {
      setIsLoadingDatabase(false);
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
            Test file uploads to Supabase Storage (files bucket) and database without vectorization.
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Files
            </CardTitle>
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
              {isUploading ? "Uploading..." : "Upload Files"}
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
                Upload Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uploadResults.map((result, index) => (
                  <div key={index} className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{result.filename}</h4>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-400 text-sm">DB: {result.id}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Type:</span>
                        <span className="text-white ml-2">{result.file_type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Size:</span>
                        <span className="text-white ml-2">
                          {(result.file_size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Content Length:</span>
                        <span className="text-white ml-2">{result.content.length} chars</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Uploaded:</span>
                        <span className="text-white ml-2">
                          {new Date(result.uploaded_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-400" />
                Storage Contents (files bucket)
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkStorageContents}
                  disabled={isLoadingStorage}
                  className="ml-auto"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingStorage ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {storageContents.length === 0 ? (
                  <p className="text-slate-400 text-sm">No files in storage</p>
                ) : (
                  storageContents.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-slate-400 text-sm">
                            {item.metadata?.size ? `${(item.metadata.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                      <span className="text-slate-400 text-sm">
                        {new Date(item.updated_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-green-400" />
                Database Contents (documents table)
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkDatabaseContents}
                  disabled={isLoadingDatabase}
                  className="ml-auto"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingDatabase ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {databaseContents.length === 0 ? (
                  <p className="text-slate-400 text-sm">No documents in database</p>
                ) : (
                  databaseContents.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-white font-medium">{item.filename}</p>
                          <p className="text-slate-400 text-sm">
                            {(item.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <span className="text-slate-400 text-sm">
                        {new Date(item.uploaded_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
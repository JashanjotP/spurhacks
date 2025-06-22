"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, X, Database, FileSearch, RefreshCw } from "lucide-react";
import { fileUploadService } from "@/lib/supabase/file-upload-service";

export default function TestUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [databaseContents, setDatabaseContents] = useState<any[]>([]);
  const [chunksContents, setChunksContents] = useState<any[]>([]);
  const [isLoadingDatabase, setIsLoadingDatabase] = useState(false);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);

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
      
      console.log("Starting file processing...");
      const results = await fileUploadService.uploadFiles(files, testBusinessId);
      
      setUploadResults(results);
      console.log("Processing completed:", results);
      
      // Check database contents after upload
      await checkDatabaseContents();
      await checkChunksContents();
      
    } catch (err) {
      console.error("Processing failed:", err);
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsUploading(false);
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

  const checkChunksContents = async () => {
    setIsLoadingChunks(true);
    try {
      const contents = await fileUploadService.listDocumentChunks();
      setChunksContents(contents || []);
      console.log("Chunks contents:", contents);
    } catch (err) {
      console.error("Failed to list chunks contents:", err);
      setError(err instanceof Error ? err.message : "Failed to list chunks");
    } finally {
      setIsLoadingChunks(false);
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
                        <span className="text-slate-400">Chunks Created:</span>
                        <span className="text-white ml-2">{result.chunks_count}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Processed:</span>
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
                <Database className="w-5 h-5 text-green-400" />
                Documents Table
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
                            {(item.file_size / 1024 / 1024).toFixed(2)} MB • {item.chunks_count || 0} chunks
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

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-blue-400" />
                Document Chunks Table
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkChunksContents}
                  disabled={isLoadingChunks}
                  className="ml-auto"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingChunks ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chunksContents.length === 0 ? (
                  <p className="text-slate-400 text-sm">No chunks in database</p>
                ) : (
                  chunksContents.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-white font-medium">Chunk {item.chunk_index}</p>
                          <p className="text-slate-400 text-sm">
                            {item.content.length} chars • Doc: {item.document_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <span className="text-slate-400 text-sm">
                        {new Date(item.created_at).toLocaleString()}
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
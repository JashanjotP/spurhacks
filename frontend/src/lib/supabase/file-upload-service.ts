import { createClient } from './client';

const supabase = createClient();

export interface UploadedFile {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  content: string;
  uploaded_at: string;
}

export class FileUploadService {
  constructor() {
    console.log('📁 FileUploadService initialized');
  }

  async uploadFiles(files: File[], businessId: string): Promise<UploadedFile[]> {
    const uploadedFiles: UploadedFile[] = [];

    console.log(`🚀 Starting upload process for ${files.length} files`);
    console.log(`📁 Business ID: ${businessId}`);
    console.log(`📊 Files to upload:`, files.map(f => ({ name: f.name, size: f.size, type: f.type })));

    // First, ensure the storage bucket exists
    console.log(`🔍 Checking storage bucket...`);
    await this.ensureStorageBucket();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n📤 Processing file ${i + 1}/${files.length}: ${file.name}`);
      
      try {
        console.log(`📖 Reading file content...`);
        const startTime = Date.now();
        const content = await this.readFileContent(file);
        const readTime = Date.now() - startTime;
        console.log(`✅ File content read in ${readTime}ms, size: ${content.length} characters`);
        
        // Upload to Supabase Storage
        const storagePath = `${businessId}/${file.name}`;
        console.log(`☁️ Uploading to storage path: ${storagePath}`);
        console.log(`📦 File size: ${file.size} bytes`);
        
        const uploadStartTime = Date.now();
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        const uploadTime = Date.now() - uploadStartTime;
        console.log(`⏱️ Storage upload took ${uploadTime}ms`);

        if (uploadError) {
          console.error('❌ Storage upload error:', uploadError);
          throw new Error(`Failed to upload file: ${uploadError.message}`);
        }

        console.log(`✅ File uploaded successfully to storage:`, uploadData);

        // Create document record in database
        console.log(`💾 Creating database record...`);
        const dbStartTime = Date.now();
        const { data: documentData, error: documentError } = await supabase
          .from('documents')
          .insert({
            business_id: businessId,
            filename: file.name,
            file_type: file.type || this.getFileExtension(file.name),
            file_size: file.size,
            content: content,
          })
          .select()
          .single();

        const dbTime = Date.now() - dbStartTime;
        console.log(`⏱️ Database insert took ${dbTime}ms`);

        if (documentError) {
          console.error('❌ Database insert error:', documentError);
          throw new Error(`Failed to create document record: ${documentError.message}`);
        }

        console.log(`✅ Document record created:`, documentData);

        uploadedFiles.push({
          id: documentData.id,
          filename: documentData.filename,
          file_type: documentData.file_type,
          file_size: documentData.file_size,
          content: documentData.content,
          uploaded_at: documentData.uploaded_at,
        });

        const totalTime = Date.now() - startTime;
        console.log(`🎉 File ${file.name} completed in ${totalTime}ms total`);

      } catch (error) {
        console.error(`❌ Error uploading file ${file.name}:`, error);
        throw error;
      }
    }

    console.log(`\n🎊 All files uploaded successfully! Total files: ${uploadedFiles.length}`);
    return uploadedFiles;
  }

  private async ensureStorageBucket(): Promise<void> {
    try {
      // Check if the bucket exists by trying to list files
      const { data, error } = await supabase.storage
        .from('documents')
        .list('', { limit: 1 });

      if (error) {
        console.error('Storage bucket check failed:', error);
        throw new Error(`Storage bucket 'documents' does not exist or is not accessible. Please run the storage setup script.`);
      }

      console.log('Storage bucket "documents" is accessible');
    } catch (error) {
      console.error('Error checking storage bucket:', error);
      throw error;
    }
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file content'));
      };

      if (file.type.includes('text') || file.name.endsWith('.txt')) {
        reader.readAsText(file);
      } else {
        // For other file types, read as base64 for now
        // In a real implementation, you'd want to extract text from PDFs, DOCs, etc.
        reader.readAsDataURL(file);
      }
    });
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'unknown';
  }

  async getDocumentsByBusiness(businessId: string): Promise<UploadedFile[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('business_id', businessId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data || [];
  }

  async deleteDocument(documentId: string): Promise<void> {
    // Get document info first
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('filename, business_id')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch document: ${fetchError.message}`);
    }

    // Delete from storage
    const storagePath = `${document.business_id}/${document.filename}`;
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([storagePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      throw new Error(`Failed to delete document: ${dbError.message}`);
    }
  }

  // Debug method to check storage bucket contents
  async listStorageContents(businessId?: string): Promise<any> {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .list(businessId || '', { limit: 100 });

      if (error) {
        console.error('Error listing storage contents:', error);
        throw error;
      }

      console.log('Storage contents:', data);
      return data;
    } catch (error) {
      console.error('Error listing storage:', error);
      throw error;
    }
  }
}

export const fileUploadService = new FileUploadService(); 
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
    // First, verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Authentication error:', authError);
      throw new Error('User must be authenticated to upload files');
    }
    console.log('✅ User authenticated:', user.id);

    const uploadedFiles: UploadedFile[] = [];

    console.log(`🚀 Starting upload process for ${files.length} files`);
    console.log(`📁 Business ID: ${businessId}`);
    console.log(`👤 User ID: ${user.id}`);
    console.log(`📊 Files to upload:`, files.map(f => ({ name: f.name, size: f.size, type: f.type })));

    // Ensure the storage bucket exists
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
        
        // Upload to Supabase Storage (files bucket)
        const storagePath = `${businessId}/${file.name}`;
        console.log(`☁️ Uploading to storage bucket 'files' at path: ${storagePath}`);
        console.log(`📦 File size: ${file.size} bytes`);
        
        const uploadStartTime = Date.now();
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('files') // Changed from 'documents' to 'files'
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        const uploadTime = Date.now() - uploadStartTime;
        console.log(`⏱️ Storage upload took ${uploadTime}ms`);

        if (uploadError) {
          console.error('❌ Storage upload error:', uploadError);
          throw new Error(`Failed to upload file to storage: ${uploadError.message}`);
        }

        console.log(`✅ File uploaded successfully to storage bucket:`, uploadData);

        // Create document record in database table (also named 'documents')
        console.log(`💾 Creating database record in documents table...`);
        const dbStartTime = Date.now();
        
        const insertData = {
          user_id: user.id, // Add user_id to fix RLS issue
          business_id: businessId,
          filename: file.name,
          file_type: file.type || this.getFileExtension(file.name),
          file_size: file.size,
          content: content,
        };
        
        console.log('📝 Inserting data:', insertData);
        
        const { data: documentData, error: documentError } = await supabase
          .from('documents') // This is your database table
          .insert(insertData)
          .select()
          .single();

        const dbTime = Date.now() - dbStartTime;
        console.log(`⏱️ Database insert took ${dbTime}ms`);

        if (documentError) {
          console.error('❌ Database insert error:', documentError);
          console.error('📋 Error details:', {
            code: documentError.code,
            message: documentError.message,
            details: documentError.details,
            hint: documentError.hint
          });
          
          // If it's an RLS error, provide specific guidance
          if (documentError.message.includes('row-level security policy')) {
            throw new Error(`Database permission error: The current user doesn't have permission to insert into the documents table. Please check your Row Level Security policies.`);
          }
          
          throw new Error(`Failed to create document record: ${documentError.message}`);
        }

        console.log(`✅ Document record created in database:`, documentData);

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
        
        // Clean up storage if database insert failed
        if (error instanceof Error && error.message.includes('Database permission error')) {
          console.log('🧹 Cleaning up storage file due to database error...');
          const storagePath = `${businessId}/${file.name}`;
          await supabase.storage.from('files').remove([storagePath]);
        }
        
        throw error;
      }
    }

    console.log(`\n🎊 All files uploaded successfully! Total files: ${uploadedFiles.length}`);
    return uploadedFiles;
  }

  private async ensureStorageBucket(): Promise<void> {
    try {
      // Check if the storage bucket 'files' exists by trying to list files
      const { data, error } = await supabase.storage
        .from('files') // Changed from 'documents' to 'files'
        .list('', { limit: 1 });

      if (error) {
        console.error('❌ Storage bucket check failed:', error);
        throw new Error(`Storage bucket 'files' does not exist or is not accessible. Error: ${error.message}`);
      }

      console.log('✅ Storage bucket "files" is accessible');
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
        // For other file types, read as base64
        reader.readAsDataURL(file);
      }
    });
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'unknown';
  }

  async getDocumentsByBusiness(businessId: string): Promise<UploadedFile[]> {
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to fetch documents');
    }

    const { data, error } = await supabase
      .from('documents') // Database table
      .select('*')
      .eq('business_id', businessId)
      .eq('user_id', user.id) // Add user_id filter for RLS
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data || [];
  }

  async deleteDocument(documentId: string): Promise<void> {
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to delete documents');
    }

    // Get document info first from database table
    const { data: document, error: fetchError } = await supabase
      .from('documents') // Database table
      .select('filename, business_id')
      .eq('id', documentId)
      .eq('user_id', user.id) // Add user_id filter for RLS
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch document: ${fetchError.message}`);
    }

    // Delete from storage bucket
    const storagePath = `${document.business_id}/${document.filename}`;
    console.log(`🗑️ Deleting from storage bucket 'files' at path: ${storagePath}`);
    
    const { error: storageError } = await supabase.storage
      .from('files') // Changed from 'documents' to 'files'
      .remove([storagePath]);

    if (storageError) {
      console.error('❌ Storage delete error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database table
    console.log(`🗑️ Deleting from database table 'documents'`);
    const { error: dbError } = await supabase
      .from('documents') // Database table
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id); // Add user_id filter for RLS

    if (dbError) {
      throw new Error(`Failed to delete document from database: ${dbError.message}`);
    }

    console.log(`✅ Document deleted successfully from both storage and database`);
  }

  // Debug method to check storage bucket contents
  async listStorageContents(businessId?: string): Promise<any> {
    try {
      const { data, error } = await supabase.storage
        .from('files') // Changed from 'documents' to 'files'
        .list(businessId || '', { limit: 100 });

      if (error) {
        console.error('Error listing storage contents:', error);
        throw error;
      }

      console.log('Storage bucket contents:', data);
      return data;
    } catch (error) {
      console.error('Error listing storage:', error);
      throw error;
    }
  }

  // Debug method to check database table contents
  async listDatabaseDocuments(businessId?: string): Promise<any> {
    try {
      // Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User must be authenticated to list documents');
      }

      let query = supabase.from('documents').select('*'); // Database table
      
      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      // Add user_id filter for RLS
      query = query.eq('user_id', user.id);

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error listing database documents:', error);
        throw error;
      }

      console.log('Database table contents:', data);
      return data;
    } catch (error) {
      console.error('Error listing database documents:', error);
      throw error;
    }
  }
}

export const fileUploadService = new FileUploadService();
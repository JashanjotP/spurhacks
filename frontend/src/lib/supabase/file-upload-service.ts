import { createClient } from './client';
import pdfParse from 'pdf-parse/lib/pdf-parse';

const supabase = createClient();

export interface UploadedFile {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  content: string;
  uploaded_at: string;
  chunks_count: number;
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

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n📤 Processing file ${i + 1}/${files.length}: ${file.name}`);
      
      try {
        console.log(`📖 Extracting text content...`);
        const startTime = Date.now();
        const content = await this.extractTextContent(file);
        const extractTime = Date.now() - startTime;
        console.log(`✅ Text extracted in ${extractTime}ms, size: ${content.length} characters`);

        if (content.length === 0) {
          console.warn(`⚠️ No text content extracted from ${file.name}`);
        }

        // Create document record in database
        console.log(`💾 Creating document record in database...`);
        const dbStartTime = Date.now();
        
        const insertData = {
          user_id: user.id,
          business_id: businessId,
          filename: file.name,
          file_type: file.type || this.getFileExtension(file.name),
          file_size: file.size,
          content: content
        };
        
        console.log('📝 Inserting document data:', {
          ...insertData,
          content_length: insertData.content.length
        });
        
        const { data: documentData, error: documentError } = await supabase
          .from('documents')
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
          
          if (documentError.message.includes('row-level security policy')) {
            throw new Error(`Database permission error: The current user doesn't have permission to insert into the documents table. Please check your Row Level Security policies.`);
          }
          
          throw new Error(`Failed to create document record: ${documentError.message}`);
        }

        console.log(`✅ Document record created in database:`, documentData);

        // Create document chunks
        console.log(`✂️ Creating document chunks...`);
        const chunksStartTime = Date.now();
        const chunks = this.createChunks(content);
        console.log(`📦 Created ${chunks.length} chunks from content`);

        const chunkData = chunks.map((chunk, index) => ({
          document_id: documentData.id,
          user_id: user.id,
          business_id: businessId,
          chunk_index: index,
          content: chunk,
          metadata: {
            chunk_size: chunk.length,
            total_chunks: chunks.length,
            chunk_index: index,
            original_filename: file.name
          }
        }));

        const { error: chunksError } = await supabase
          .from('document_chunks')
          .insert(chunkData);

        const chunksTime = Date.now() - chunksStartTime;
        console.log(`⏱️ Chunks insert took ${chunksTime}ms`);

        if (chunksError) {
          console.error('❌ Chunks insert error:', chunksError);
          // Don't fail the upload if chunks fail, but log the error
          console.warn('⚠️ Document uploaded but chunks creation failed');
        } else {
          console.log(`✅ Created ${chunks.length} document chunks`);
        }

        uploadedFiles.push({
          id: documentData.id,
          filename: documentData.filename,
          file_type: documentData.file_type,
          file_size: documentData.file_size,
          content: documentData.content,
          uploaded_at: documentData.uploaded_at,
          chunks_count: chunks.length
        });

        const totalTime = Date.now() - startTime;
        console.log(`🎉 File ${file.name} completed in ${totalTime}ms total`);

      } catch (error) {
        console.error(`❌ Error processing file ${file.name}:`, error);
        throw error;
      }
    }

    console.log(`\n🎊 All files processed successfully! Total files: ${uploadedFiles.length}`);
    return uploadedFiles;
  }

  private async extractTextContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          if (file.type.includes('text') || file.name.endsWith('.txt')) {
            // For text files, read as text
            const textReader = new FileReader();
            textReader.onload = (e) => {
              const content = e.target?.result as string;
              resolve(content);
            };
            textReader.onerror = () => reject(new Error('Failed to read text file'));
            textReader.readAsText(file);
          } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            // For PDF files, use pdf-parse
            try {
              const uint8Array = new Uint8Array(arrayBuffer);
              const buffer = Buffer.from(uint8Array);
              const data = await pdfParse(buffer);
              resolve(data.text);
            } catch (pdfError) {
              console.error('PDF parsing error:', pdfError);
              reject(new Error(`Failed to parse PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`));
            }
          } else {
            // For other file types, try to read as text or return empty
            console.warn(`Unsupported file type: ${file.type}. Attempting to read as text...`);
            try {
              const textReader = new FileReader();
              textReader.onload = (e) => {
                const content = e.target?.result as string;
                resolve(content);
              };
              textReader.onerror = () => {
                console.warn(`Could not read file ${file.name} as text`);
                resolve(''); // Return empty string for unsupported files
              };
              textReader.readAsText(file);
            } catch (error) {
              console.warn(`Could not process file ${file.name}`);
              resolve(''); // Return empty string for unsupported files
            }
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file content'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  private createChunks(content: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    if (content.length === 0) {
      return [];
    }

    const chunks: string[] = [];
    let start = 0;
    
    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      const chunk = content.slice(start, end);
      chunks.push(chunk);
      start = end - overlap;
    }
    
    return chunks;
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
      .from('documents')
      .select(`
        *,
        document_chunks (count)
      `)
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return (data || []).map(doc => ({
      id: doc.id,
      filename: doc.filename,
      file_type: doc.file_type,
      file_size: doc.file_size,
      content: doc.content,
      uploaded_at: doc.uploaded_at,
      chunks_count: doc.document_chunks?.length || 0
    }));
  }

  async deleteDocument(documentId: string): Promise<void> {
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to delete documents');
    }

    // Get document info first from database table
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('filename, business_id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch document: ${fetchError.message}`);
    }

    // Delete from database (this will cascade to document_chunks)
    console.log(`🗑️ Deleting document and chunks from database`);
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (dbError) {
      throw new Error(`Failed to delete document from database: ${dbError.message}`);
    }

    console.log(`✅ Document and chunks deleted successfully from database`);
  }

  // Debug method to check database table contents
  async listDatabaseDocuments(businessId?: string): Promise<any> {
    try {
      // Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User must be authenticated to list documents');
      }

      let query = supabase.from('documents').select(`
        *,
        document_chunks (count)
      `);
      
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

  // Debug method to check document chunks
  async listDocumentChunks(documentId?: string): Promise<any> {
    try {
      // Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User must be authenticated to list chunks');
      }

      let query = supabase.from('document_chunks').select('*');
      
      if (documentId) {
        query = query.eq('document_id', documentId);
      }

      // Add user_id filter for RLS
      query = query.eq('user_id', user.id);

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error listing document chunks:', error);
        throw error;
      }

      console.log('Document chunks contents:', data);
      return data;
    } catch (error) {
      console.error('Error listing document chunks:', error);
      throw error;
    }
  }
}

export const fileUploadService = new FileUploadService();
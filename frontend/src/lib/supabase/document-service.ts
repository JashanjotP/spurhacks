import { createClient } from './client';

const supabase = createClient();

export interface Document {
  id: string;
  user_id: string;
  business_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  content: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export class DocumentService {
  constructor() {
    console.log('📄 DocumentService initialized');
  }

  async getDocumentsByBusiness(businessId: string): Promise<Document[]> {
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

  async getDocumentById(documentId: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      throw new Error(`Failed to fetch document: ${error.message}`);
    }

    return data;
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

  async getDocumentStats(businessId: string) {
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id, file_size')
      .eq('business_id', businessId);

    if (docError) {
      throw new Error(`Failed to fetch document stats: ${docError.message}`);
    }

    const totalSize = documents?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0;

    return {
      totalDocuments: documents?.length || 0,
      totalSize: totalSize,
      averageSize: documents?.length ? totalSize / documents.length : 0,
    };
  }

  async searchDocuments(query: string, businessId: string, limit: number = 5): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('business_id', businessId)
      .or(`filename.ilike.%${query}%,content.ilike.%${query}%`)
      .order('uploaded_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching documents:', error);
      throw new Error(`Failed to search documents: ${error.message}`);
    }

    return data || [];
  }
}

export const documentService = new DocumentService(); 
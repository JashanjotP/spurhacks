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
  chunks_count?: number;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  user_id: string;
  business_id: string;
  chunk_index: number;
  content: string;
  metadata: any;
  created_at: string;
}

export class DocumentService {
  constructor() {
    console.log('📄 DocumentService initialized');
  }

  async getDocumentsByBusiness(businessId: string): Promise<Document[]> {
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
      ...doc,
      chunks_count: doc.document_chunks?.length || 0
    }));
  }

  async getDocumentById(documentId: string): Promise<Document | null> {
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
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      throw new Error(`Failed to fetch document: ${error.message}`);
    }

    return data ? {
      ...data,
      chunks_count: data.document_chunks?.length || 0
    } : null;
  }

  async getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to fetch document chunks');
    }

    const { data, error } = await supabase
      .from('document_chunks')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', user.id)
      .order('chunk_index', { ascending: true });

    if (error) {
      console.error('Error fetching document chunks:', error);
      throw new Error(`Failed to fetch document chunks: ${error.message}`);
    }

    return data || [];
  }

  async deleteDocument(documentId: string): Promise<void> {
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to delete documents');
    }

    // Get document info first
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
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (dbError) {
      throw new Error(`Failed to delete document: ${dbError.message}`);
    }
  }

  async getDocumentStats(businessId: string) {
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to fetch document stats');
    }

    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id, file_size')
      .eq('business_id', businessId)
      .eq('user_id', user.id);

    if (docError) {
      throw new Error(`Failed to fetch document stats: ${docError.message}`);
    }

    const { data: chunks, error: chunkError } = await supabase
      .from('document_chunks')
      .select('id')
      .eq('business_id', businessId)
      .eq('user_id', user.id);

    if (chunkError) {
      throw new Error(`Failed to fetch chunk stats: ${chunkError.message}`);
    }

    const totalSize = documents?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0;

    return {
      totalDocuments: documents?.length || 0,
      totalChunks: chunks?.length || 0,
      totalSize: totalSize,
      averageSize: documents?.length ? totalSize / documents.length : 0,
    };
  }

  async searchDocuments(query: string, businessId: string, limit: number = 5): Promise<Document[]> {
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to search documents');
    }

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        document_chunks (count)
      `)
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .or(`filename.ilike.%${query}%,content.ilike.%${query}%`)
      .order('uploaded_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching documents:', error);
      throw new Error(`Failed to search documents: ${error.message}`);
    }

    return (data || []).map(doc => ({
      ...doc,
      chunks_count: doc.document_chunks?.length || 0
    }));
  }

  async searchChunks(query: string, businessId: string, limit: number = 10): Promise<DocumentChunk[]> {
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to search chunks');
    }

    const { data, error } = await supabase
      .from('document_chunks')
      .select('*')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .or(`content.ilike.%${query}%`)
      .order('chunk_index', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error searching chunks:', error);
      throw new Error(`Failed to search chunks: ${error.message}`);
    }

    return data || [];
  }
}

export const documentService = new DocumentService(); 
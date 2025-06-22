import { createClient } from './client';

const supabase = createClient();

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  similarity: number;
  metadata: any;
}

export interface SearchResult {
  success: boolean;
  results: DocumentChunk[];
  query: string;
  businessId: string;
  count: number;
}

export class DocumentService {
  private static instance: DocumentService;

  private constructor() {}

  public static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  async searchDocuments(query: string, businessId: string, limit: number = 5): Promise<SearchResult> {
    try {
      const response = await fetch('/api/documents/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          businessId,
          limit,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  async getDocumentsByBusiness(businessId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        document_chunks (
          id,
          chunk_index,
          content,
          metadata
        )
      `)
      .eq('business_id', businessId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data || [];
  }

  async getDocumentChunks(documentId: string) {
    const { data, error } = await supabase
      .from('document_chunks')
      .select('*')
      .eq('document_id', documentId)
      .order('chunk_index', { ascending: true });

    if (error) {
      console.error('Error fetching document chunks:', error);
      throw new Error(`Failed to fetch document chunks: ${error.message}`);
    }

    return data || [];
  }

  async deleteDocument(documentId: string) {
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
    const storagePath = `documents/${document.business_id}/${document.filename}`;
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([storagePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database (this will cascade to document_chunks)
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
      .select('id')
      .eq('business_id', businessId);

    if (docError) {
      throw new Error(`Failed to fetch document stats: ${docError.message}`);
    }

    const { data: chunks, error: chunkError } = await supabase
      .from('document_chunks')
      .select('id')
      .eq('business_id', businessId);

    if (chunkError) {
      throw new Error(`Failed to fetch chunk stats: ${chunkError.message}`);
    }

    return {
      totalDocuments: documents?.length || 0,
      totalChunks: chunks?.length || 0,
    };
  }
}

export const documentService = DocumentService.getInstance(); 
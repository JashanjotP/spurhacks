import { createClient } from './client';
import { User } from '@supabase/supabase-js';

export interface OnboardingData {
  agentType: "faq" | "booking" | "order" | "";
  businessName: string;
  businessType: string;
  uploadedFiles: File[];
  uploadedFileResults: any[];
  businessHours: {
    start: string;
    end: string;
    timezone: string;
  };
  greeting: string;
  phoneNumber: string;
}

export interface OnboardingSession {
  id: string;
  user_id: string;
  business_id?: string;
  current_step: number;
  completed: boolean;
  onboarding_data: Partial<OnboardingData>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  business_type: string;
  agent_type: string;
  business_hours: {
    start: string;
    end: string;
    timezone: string;
  };
  greeting: string;
  phone_number: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

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

export interface DocumentChunk {
  id: string;
  document_id: string;
  user_id: string;
  business_id: string;
  chunk_index: number;
  content: string;
  embedding?: number[];
  metadata: Record<string, any>;
  created_at: string;
}

class SupabaseOnboardingService {
  private supabase = createClient();
  private demoUserId = "demo-user-123"; // Fallback user ID for testing

  /**
   * Get current authenticated user or use demo user
   */
  private async getCurrentUser(): Promise<User | { id: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        return user;
      }
    } catch (error) {
      console.log('No authenticated user, using demo user');
    }
    
    // Return demo user for testing when authentication is disabled
    return { id: this.demoUserId };
  }

  /**
   * Create a new onboarding session
   */
  async createOnboardingSession(): Promise<string | null> {
    try {
      const user = await this.getCurrentUser();

      const { data, error } = await this.supabase
        .from('onboarding_sessions')
        .insert({
          user_id: user.id,
          current_step: 0,
          completed: false,
          onboarding_data: {}
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating onboarding session:', error);
      return null;
    }
  }

  /**
   * Get current onboarding session
   */
  async getCurrentSession(): Promise<OnboardingSession | null> {
    try {
      const user = await this.getCurrentUser();

      const { data, error } = await this.supabase
        .from('onboarding_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Create a temporary business ID for the session (for file uploads)
   */
  async createTemporaryBusinessId(sessionId: string, businessName: string, businessType: string): Promise<string | null> {
    try {
      console.log(`🔧 Creating temporary business ID for session: ${sessionId}`);
      console.log(`📝 Business name: ${businessName}, type: ${businessType}`);
      
      const user = await this.getCurrentUser();
      console.log(`👤 User ID: ${user.id}`);
      
      // Generate a temporary business ID
      const tempBusinessId = `temp-${this.generateBusinessId()}`;
      console.log(`🆔 Generated temp business ID: ${tempBusinessId}`);
      
      // Update the session with the temporary business ID
      console.log(`💾 Updating session with temp business ID...`);
      const { data, error } = await this.supabase
        .from('onboarding_sessions')
        .update({
          business_id: tempBusinessId,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select('business_id');

      if (error) {
        console.error('❌ Database error updating session:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log(`✅ Session updated successfully:`, data);
      console.log(`✅ Created temporary business ID: ${tempBusinessId} for session: ${sessionId}`);
      return tempBusinessId;
    } catch (error) {
      console.error('❌ Error creating temporary business ID:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error stringified:', JSON.stringify(error, null, 2));
      return null;
    }
  }

  /**
   * Update onboarding step and data
   */
  async updateOnboardingStep(sessionId: string, step: number, data: Partial<OnboardingData>): Promise<boolean> {
    try {
      // If this is step 2 (business info) and we don't have a business_id yet, create one
      if (step === 2 && data.businessName && data.businessType) {
        const session = await this.getCurrentSession();
        if (session && !session.business_id) {
          await this.createTemporaryBusinessId(sessionId, data.businessName, data.businessType);
        }
      }

      const { error } = await this.supabase
        .from('onboarding_sessions')
        .update({
          current_step: step,
          onboarding_data: data,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      return false;
    }
  }

  /**
   * Complete onboarding and create business record
   */
  async completeOnboarding(sessionId: string, finalData: OnboardingData): Promise<Business | null> {
    try {
      const user = await this.getCurrentUser();

      // Get the current session to check for temporary business ID
      const session = await this.getCurrentSession();
      const tempBusinessId = session?.business_id;

      // Generate phone number if not provided
      const phoneNumber = finalData.phoneNumber || this.generatePhoneNumber();

      // Generate final business ID
      const businessId = this.generateBusinessId();

      console.log(`🔄 Completing onboarding - Temp Business ID: ${tempBusinessId}, Final Business ID: ${businessId}`);

      // Start transaction by creating business first
      const { data: business, error: businessError } = await this.supabase
        .from('businesses')
        .insert({
          id: businessId, // Use the generated business ID
          user_id: user.id,
          name: finalData.businessName,
          business_type: finalData.businessType,
          agent_type: finalData.agentType,
          business_hours: finalData.businessHours,
          greeting: finalData.greeting,
          phone_number: phoneNumber,
          website_url: null
        })
        .select('*')
        .single();

      if (businessError) throw businessError;

      // If there was a temporary business ID, migrate documents to the final business ID
      if (tempBusinessId && tempBusinessId.startsWith('temp-')) {
        console.log(`📁 Migrating documents from temp business ID to final business ID`);
        
        // Update documents
        const { error: docError } = await this.supabase
          .from('documents')
          .update({ business_id: businessId })
          .eq('business_id', tempBusinessId);

        if (docError) {
          console.error('Error migrating documents:', docError);
        }

        // Update document chunks
        const { error: chunkError } = await this.supabase
          .from('document_chunks')
          .update({ business_id: businessId })
          .eq('business_id', tempBusinessId);

        if (chunkError) {
          console.error('Error migrating document chunks:', chunkError);
        }

        console.log(`✅ Documents migrated successfully`);
      }

      // Update onboarding session as completed
      const { error: sessionError } = await this.supabase
        .from('onboarding_sessions')
        .update({
          completed: true,
          business_id: business.id,
          onboarding_data: finalData,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      console.log(`🎉 Onboarding completed successfully for business: ${business.id}`);
      return business;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return null;
    }
  }

  /**
   * Generate a unique business ID
   */
  private generateBusinessId(): string {
    // Generate a timestamp-based ID with random suffix
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `biz_${timestamp}_${randomSuffix}`;
  }

  /**
   * Get all businesses for current user
   */
  async getUserBusinesses(): Promise<Business[]> {
    try {
      const user = await this.getCurrentUser();

      const { data, error } = await this.supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user businesses:', error);
      return [];
    }
  }

  /**
   * Get business by ID
   */
  async getBusiness(businessId: string): Promise<Business | null> {
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting business:', error);
      return null;
    }
  }

  /**
   * Upload document and create chunks
   */
  async uploadDocument(
    businessId: string, 
    file: File, 
    content: string,
    chunks: Array<{ content: string; index: number; embedding?: number[] }>
  ): Promise<Document | null> {
    try {
      const user = await this.getCurrentUser();

      // Create document record
      const { data: document, error: docError } = await this.supabase
        .from('documents')
        .insert({
          user_id: user.id,
          business_id: businessId,
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          content: content
        })
        .select('*')
        .single();

      if (docError) throw docError;

      // Create document chunks
      const chunkData = chunks.map(chunk => ({
        document_id: document.id,
        user_id: user.id,
        business_id: businessId,
        chunk_index: chunk.index,
        content: chunk.content,
        embedding: chunk.embedding,
        metadata: {}
      }));

      const { error: chunksError } = await this.supabase
        .from('document_chunks')
        .insert(chunkData);

      if (chunksError) throw chunksError;

      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  }

  /**
   * Search documents for a business
   */
  async searchBusinessDocuments(
    businessId: string, 
    queryEmbedding: number[], 
    matchThreshold: number = 0.7, 
    matchCount: number = 5
  ): Promise<Array<{ id: string; content: string; similarity: number; metadata: any; filename: string }>> {
    try {
      const { data, error } = await this.supabase
        .rpc('search_business_documents', {
          business_uuid: businessId,
          query_embedding: queryEmbedding,
          match_threshold: matchThreshold,
          match_count: matchCount
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  /**
   * Get all documents for a business
   */
  async getBusinessDocuments(businessId: string): Promise<Document[]> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting business documents:', error);
      return [];
    }
  }

  /**
   * Delete business and all related data
   */
  async deleteBusiness(businessId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting business:', error);
      return false;
    }
  }

  /**
   * Generate a mock phone number
   */
  private generatePhoneNumber(): string {
    const areaCodes = ['555', '444', '333'];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const prefix = Math.floor(Math.random() * 900 + 100).toString();
    const line = Math.floor(Math.random() * 9000 + 1000).toString();
    return `+1 (${areaCode}) ${prefix}-${line}`;
  }

  /**
   * Export all data for current user
   */
  async exportUserData(): Promise<{ businesses: Business[]; sessions: OnboardingSession[]; documents: Document[] }> {
    try {
      const user = await this.getCurrentUser();

      const [businesses, sessions, documents] = await Promise.all([
        this.getUserBusinesses(),
        this.getAllSessions(),
        this.getAllDocuments()
      ]);

      return { businesses, sessions, documents };
    } catch (error) {
      console.error('Error exporting user data:', error);
      return { businesses: [], sessions: [], documents: [] };
    }
  }

  /**
   * Get all sessions for current user
   */
  private async getAllSessions(): Promise<OnboardingSession[]> {
    try {
      const user = await this.getCurrentUser();

      const { data, error } = await this.supabase
        .from('onboarding_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  /**
   * Get all documents for current user
   */
  private async getAllDocuments(): Promise<Document[]> {
    try {
      const user = await this.getCurrentUser();

      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }
}

// Export singleton instance
export const supabaseOnboardingService = new SupabaseOnboardingService(); 
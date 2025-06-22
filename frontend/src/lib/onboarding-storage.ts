/**
 * Frontend onboarding data storage utility
 * Handles local storage of onboarding data and session management
 */

export interface OnboardingData {
  agentType: "faq" | "booking" | "order" | "";
  businessName: string;
  businessType: string;
  knowledgeSource: "upload" | "url" | "";
  uploadedFiles: File[];
  websiteUrl: string;
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
  userId: string;
  currentStep: number;
  completed: boolean;
  onboardingData: Partial<OnboardingData>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Business {
  id: string;
  userId: string;
  name: string;
  businessType: string;
  agentType: string;
  businessHours: {
    start: string;
    end: string;
    timezone: string;
  };
  greeting: string;
  phoneNumber: string;
  websiteUrl?: string;
  createdAt: string;
  updatedAt: string;
}

class OnboardingStorage {
  private readonly SESSION_KEY = 'onboarding_sessions';
  private readonly BUSINESSES_KEY = 'user_businesses';
  private readonly CURRENT_SESSION_KEY = 'current_onboarding_session';

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get current timestamp
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Create a new onboarding session
   */
  createOnboardingSession(userId: string): string {
    const sessionId = this.generateId();
    const session: OnboardingSession = {
      id: sessionId,
      userId,
      currentStep: 0,
      completed: false,
      onboardingData: {},
      createdAt: this.getTimestamp(),
      updatedAt: this.getTimestamp(),
    };

    // Save session
    this.saveSession(session);
    
    // Set as current session
    localStorage.setItem(this.CURRENT_SESSION_KEY, sessionId);
    
    return sessionId;
  }

  /**
   * Get current onboarding session
   */
  getCurrentSession(): OnboardingSession | null {
    const sessionId = localStorage.getItem(this.CURRENT_SESSION_KEY);
    if (!sessionId) return null;
    
    return this.getSession(sessionId);
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): OnboardingSession | null {
    try {
      const sessions = this.getAllSessions();
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Update onboarding step and data
   */
  updateOnboardingStep(sessionId: string, step: number, data: Partial<OnboardingData>): boolean {
    try {
      const session = this.getSession(sessionId);
      if (!session) return false;

      session.currentStep = step;
      session.onboardingData = { ...session.onboardingData, ...data };
      session.updatedAt = this.getTimestamp();

      this.saveSession(session);
      return true;
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      return false;
    }
  }

  /**
   * Complete onboarding and create business record
   */
  completeOnboarding(sessionId: string, finalData: OnboardingData): Business | null {
    try {
      const session = this.getSession(sessionId);
      if (!session) return null;

      // Generate phone number if not provided
      const phoneNumber = finalData.phoneNumber || this.generatePhoneNumber();

      // Create business record
      const business: Business = {
        id: this.generateId(),
        userId: session.userId,
        name: finalData.businessName,
        businessType: finalData.businessType,
        agentType: finalData.agentType,
        businessHours: finalData.businessHours,
        greeting: finalData.greeting,
        phoneNumber,
        websiteUrl: finalData.websiteUrl || undefined,
        createdAt: this.getTimestamp(),
        updatedAt: this.getTimestamp(),
      };

      // Save business
      this.saveBusiness(business);

      // Mark session as completed
      session.completed = true;
      session.onboardingData = finalData;
      session.completedAt = this.getTimestamp();
      session.updatedAt = this.getTimestamp();
      this.saveSession(session);

      // Clear current session
      localStorage.removeItem(this.CURRENT_SESSION_KEY);

      return business;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return null;
    }
  }

  /**
   * Get all businesses for a user
   */
  getUserBusinesses(userId: string): Business[] {
    try {
      const businesses = this.getAllBusinesses();
      return businesses.filter(b => b.userId === userId);
    } catch (error) {
      console.error('Error getting user businesses:', error);
      return [];
    }
  }

  /**
   * Get all onboarding sessions
   */
  getAllSessions(): OnboardingSession[] {
    try {
      const data = localStorage.getItem(this.SESSION_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  /**
   * Get all businesses
   */
  getAllBusinesses(): Business[] {
    try {
      const data = localStorage.getItem(this.BUSINESSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting businesses:', error);
      return [];
    }
  }

  /**
   * Save session to localStorage
   */
  private saveSession(session: OnboardingSession): void {
    try {
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Save business to localStorage
   */
  private saveBusiness(business: Business): void {
    try {
      const businesses = this.getAllBusinesses();
      const existingIndex = businesses.findIndex(b => b.id === business.id);
      
      if (existingIndex >= 0) {
        businesses[existingIndex] = business;
      } else {
        businesses.push(business);
      }

      localStorage.setItem(this.BUSINESSES_KEY, JSON.stringify(businesses));
    } catch (error) {
      console.error('Error saving business:', error);
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
   * Clear all onboarding data (for testing/reset)
   */
  clearAllData(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.BUSINESSES_KEY);
    localStorage.removeItem(this.CURRENT_SESSION_KEY);
  }

  /**
   * Export data for backup or migration
   */
  exportData(): { sessions: OnboardingSession[], businesses: Business[] } {
    return {
      sessions: this.getAllSessions(),
      businesses: this.getAllBusinesses(),
    };
  }

  /**
   * Import data from backup
   */
  importData(data: { sessions: OnboardingSession[], businesses: Business[] }): boolean {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(data.sessions));
      localStorage.setItem(this.BUSINESSES_KEY, JSON.stringify(data.businesses));
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const onboardingStorage = new OnboardingStorage(); 
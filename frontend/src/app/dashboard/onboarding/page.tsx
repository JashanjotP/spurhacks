"use client";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { supabaseOnboardingService, OnboardingData, Business } from "@/lib/supabase/onboarding-service";

export default function Onboarding() {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [completedData, setCompletedData] = useState<OnboardingData | null>(null);
  const [businessData, setBusinessData] = useState<Business | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize onboarding session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Check for existing session
        const currentSession = await supabaseOnboardingService.getCurrentSession();
        
        if (currentSession) {
          setSessionId(currentSession.id);
        } else {
          // Create new session
          const newSessionId = await supabaseOnboardingService.createOnboardingSession();
          if (newSessionId) {
            setSessionId(newSessionId);
          } else {
            setError("Failed to create onboarding session. Please check your authentication.");
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        setError("Failed to initialize onboarding session.");
      }
    };

    initializeSession();
  }, []);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    // Log the completed data for testing purposes
    console.log("Onboarding completed with data:", data);
    
    // Show loading screen
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Complete onboarding and create business record
      if (sessionId) {
        const business = await supabaseOnboardingService.completeOnboarding(sessionId, data);
        
        if (business) {
          setBusinessData(business);
          setCompletedData(data);
          setIsCompleted(true);
          
          // Log the saved data
          console.log("Business created:", business);
          
          // Simulate a delay before redirecting
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        } else {
          throw new Error("Failed to create business record");
        }
      } else {
        throw new Error("No active session found");
      }
    } catch (error) {
      console.error('Error in onboarding completion:', error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      // Still show completion but with error message
      setCompletedData(data);
      setIsCompleted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen 
        message="Saving your AI voice agent configuration..." 
        showProgress={true}
        progress={75}
      />
    );
  }

  if (isCompleted && completedData && businessData) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Alert className="border-green-700 bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-200">
              <strong>Onboarding completed successfully!</strong> You will be redirected to the dashboard in a few seconds.
              <br />
              <br />
              <strong>Summary:</strong>
              <br />
              <div className="bg-slate-800 rounded-lg p-4 text-left space-y-2">
                <p className="text-slate-300">• <strong>Business:</strong> {completedData.businessName}</p>
                <p className="text-slate-300">• <strong>Type:</strong> {completedData.businessType}</p>
                <p className="text-slate-300">• <strong>Phone:</strong> {completedData.phoneNumber}</p>
                {completedData.uploadedFileResults && completedData.uploadedFileResults.length > 0 && (
                  <p className="text-slate-300">
                    • <strong>Files:</strong> {completedData.uploadedFileResults.length} file(s) uploaded successfully
                  </p>
                )}
              </div>
              <br />
              <br />
              <strong>Database Info:</strong>
              <br />
              • Session ID: {sessionId}
              <br />
              • Business ID: {businessData.id}
              <br />
              • Created: {new Date(businessData.created_at).toLocaleString()}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isCompleted && completedData && !businessData) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Alert className="border-yellow-700 bg-yellow-900/20">
            <CheckCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200">
              <strong>Onboarding completed locally!</strong> {error || "There was an issue saving the business record."}
              <br />
              <br />
              <strong>Summary:</strong>
              <br />
              <div className="bg-slate-800 rounded-lg p-4 text-left space-y-2">
                <p className="text-slate-300">• <strong>Business:</strong> {completedData.businessName}</p>
                <p className="text-slate-300">• <strong>Type:</strong> {completedData.businessType}</p>
                <p className="text-slate-300">• <strong>Phone:</strong> {completedData.phoneNumber}</p>
                {completedData.uploadedFileResults && completedData.uploadedFileResults.length > 0 && (
                  <p className="text-slate-300">
                    • <strong>Files:</strong> {completedData.uploadedFileResults.length} file(s) uploaded successfully
                  </p>
                )}
              </div>
              <br />
              <br />
              <em>Note: Data was saved locally but business record creation failed.</em>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (error && !sessionId) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-2xl mx-auto">
          <Alert className="border-red-700 bg-red-900/20">
            <AlertDescription className="text-red-200">
              <strong>Error:</strong> {error}
              <br />
              <br />
              Please check your authentication and try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <>
      <OnboardingWizard onComplete={handleOnboardingComplete} />
    </>
  );
}
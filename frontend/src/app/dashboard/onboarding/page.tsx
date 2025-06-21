"use client";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface OnboardingData {
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

export default function Onboarding() {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedData, setCompletedData] = useState<OnboardingData | null>(null);

  const handleOnboardingComplete = (data: OnboardingData) => {
    // Log the completed data for testing purposes
    console.log("Onboarding completed with data:", data);
    
    // Store the data (in a real app, this would be saved to a database)
    setCompletedData(data);
    setIsCompleted(true);
    
    // Simulate a delay before redirecting (optional)
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  };

  if (isCompleted && completedData) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-2xl mx-auto">
          <Alert className="border-green-700 bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-200">
              <strong>Onboarding completed successfully!</strong> You will be redirected to the dashboard in a few seconds.
              <br />
              <br />
              <strong>Summary:</strong>
              <br />
              • Agent Type: {completedData.agentType} Agent
              <br />
              • Business: {completedData.businessName}
              <br />
              • Phone Number: {completedData.phoneNumber}
              <br />
              • Business Hours: {completedData.businessHours.start} - {completedData.businessHours.end}
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
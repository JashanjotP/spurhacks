"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bot,
  Calendar,
  ShoppingCart,
  Upload,
  FileText,
  Phone,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X,
} from "lucide-react";
import { supabaseOnboardingService } from "@/lib/supabase/onboarding-service";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface OnboardingData {
  agentType: "faq" | "booking" | "order" | "";
  businessName: string;
  businessType: string;
  uploadedFiles: File[];
  uploadedFileResults: any[]; // Store upload results separately
  businessHours: {
    start: string;
    end: string;
    timezone: string;
  };
  greeting: string;
  phoneNumber: string;
}

interface AgentTypeCardProps {
  type: "faq" | "booking" | "order";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  isSelected: boolean;
  onSelect: () => void;
}

const AgentTypeCard: React.FC<AgentTypeCardProps> = ({
  type,
  title,
  description,
  icon: Icon,
  features,
  isSelected,
  onSelect,
}) => (
  <Card
    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
      isSelected
        ? "border-blue-500 bg-blue-900/20 shadow-lg ring-2 ring-blue-500/20"
        : "border-slate-700 bg-slate-800 hover:border-blue-400 hover:bg-slate-700"
    }`}
    onClick={onSelect}
  >
    <CardHeader className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <CardTitle className="text-xl text-white">{title}</CardTitle>
      <CardDescription className="text-slate-300">{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-slate-300">
            <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
            {feature}
          </li>
        ))}
      </ul>
      {isSelected && (
        <Badge className="mt-4 w-full justify-center bg-blue-600 hover:bg-blue-700">
          Selected
        </Badge>
      )}
    </CardContent>
  </Card>
);

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [data, setData] = useState<OnboardingData>({
    agentType: "",
    businessName: "",
    businessType: "",
    uploadedFiles: [],
    uploadedFileResults: [],
    businessHours: {
      start: "09:00",
      end: "17:00",
      timezone: "America/New_York",
    },
    greeting: "",
    phoneNumber: "",
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Get current authenticated user
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        // Try to get existing session first
        let session = await supabaseOnboardingService.getCurrentSession();
        
        if (!session) {
          // Create new session if none exists
          const newSessionId = await supabaseOnboardingService.createOnboardingSession();
          if (newSessionId) {
            setSessionId(newSessionId);
          } else {
            console.error('Failed to create onboarding session');
          }
        } else {
          setSessionId(session.id);
          // Restore data from existing session
          if (session.onboarding_data) {
            setData(prevData => ({
              ...prevData,
              ...session.onboarding_data
            }));
            setCurrentStep(session.current_step || 0);
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        setSaveError('Failed to initialize onboarding session');
      }
    };

    initializeSession();
  }, []);

  // Save data to Supabase after each step
  const saveStepData = async (stepData: Partial<OnboardingData>, step: number) => {
    if (!sessionId) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      
      const success = await supabaseOnboardingService.updateOnboardingStep(
        sessionId,
        step,
        stepData
      );
      
      if (!success) {
        throw new Error('Failed to save step data');
      }
      
      console.log(`Step ${step} data saved successfully`);
    } catch (error) {
      console.error('Error saving step data:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save data');
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    "Welcome",
    "Agent Type",
    "Business Info",
    "Upload Files",
    "Configuration",
    "Phone Number",
    "Complete",
  ];

  const agentTypes = [
    {
      type: "faq" as const,
      title: "FAQ Agent",
      description: "Answer customer questions using your business knowledge",
      icon: Bot,
      features: [
        "24/7 customer support",
        "Instant FAQ responses",
        "Knowledge base integration",
        "Call transcripts",
      ],
    },
    {
      type: "booking" as const,
      title: "Booking Agent",
      description: "Schedule appointments and manage your calendar",
      icon: Calendar,
      features: [
        "Calendar integration",
        "Appointment scheduling",
        "Availability checking",
        "Booking confirmations",
      ],
    },
    {
      type: "order" as const,
      title: "Order Agent",
      description: "Take orders and manage inventory",
      icon: ShoppingCart,
      features: [
        "Voice-driven ordering",
        "Inventory management",
        "Order confirmations",
        "Payment processing",
      ],
    },
  ];

  const businessTypes = [
    "Restaurant",
    "Medical Practice",
    "Service Business",
    "Retail Store",
    "Consulting",
    "Real Estate",
    "Other",
  ];

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Phoenix",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // Save current step data before proceeding
      await saveStepData(data, currentStep);
      
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!sessionId) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      // Complete onboarding with final data
      const business = await supabaseOnboardingService.completeOnboarding(sessionId, data);

      if (!business) {
        throw new Error('Failed to complete onboarding');
      }

      const finalData = {
        ...data,
        businessId: business.id
      };

      console.log('Onboarding completed successfully:', finalData);
      
      onComplete(finalData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to complete onboarding');
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.agentType !== "";
      case 2:
        return data.businessName && data.businessType;
      case 3:
        return data.uploadedFiles.length > 0;
      case 4:
        return data.greeting;
      default:
        return true;
    }
  };

  // Auto-save when data changes (debounced)
  useEffect(() => {
    if (!sessionId || currentStep === 0) return;

    const timeoutId = setTimeout(() => {
      saveStepData(data, currentStep);
    }, 1000); // Save after 1 second of no changes

    return () => clearTimeout(timeoutId);
  }, [data, sessionId, currentStep]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    
    // Check if user is authenticated
    if (!currentUser) {
      console.error('No authenticated user found');
      return;
    }
    
    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      const validTypes = ['.pdf'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return validTypes.includes(fileExtension) && file.size <= 10 * 1024 * 1024;
    });
    
    // Add valid files to state
    setData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...validFiles]
    }));
    
    // Process each file
    const uploadResults: Array<{
      filename: string;
      success: boolean;
      data?: any;
      error?: string;
    }> = [];
    
    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('businessId', sessionId || 'temp-business'); // Use sessionId as businessId
      formData.append('userId', currentUser.id); // Use actual authenticated user ID
      formData.append('filename', file.name);
      
      try {
        const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        if (response.ok) {
          console.log('File processed successfully:', result);
          uploadResults.push({
            filename: file.name,
            success: true,
            data: result.data
          });
        } else {
          console.error('Error processing file:', result.message);
          uploadResults.push({
            filename: file.name,
            success: false,
            error: result.message
          });
        }
      } catch (error) {
        console.error('Upload failed:', error);
        uploadResults.push({
          filename: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        });
      }
    }
    
    // Store upload results
    setData(prev => ({
      ...prev,
      uploadedFileResults: [...prev.uploadedFileResults, ...uploadResults]
    }));
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    setData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4 text-white">
                Welcome to VoiceAgent.ai!
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Let's set up your first AI voice agent in just a few minutes.
                Your agent will be ready to handle customer calls 24/7,
                providing instant support and never missing an opportunity.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Choose Agent Type</h3>
                <p className="text-sm text-slate-400">
                  Select the perfect agent for your business needs
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Upload Files</h3>
                <p className="text-sm text-slate-400">
                  Train your agent with your business information
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Get Phone Number</h3>
                <p className="text-sm text-slate-400">
                  Receive a dedicated number for your agent
                </p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">
                Choose Your Agent Type
              </h2>
              <p className="text-slate-300">
                Select the type of AI agent that best fits your business needs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {agentTypes.map((agent) => (
                <AgentTypeCard
                  key={agent.type}
                  {...agent}
                  isSelected={data.agentType === agent.type}
                  onSelect={() => setData({ ...data, agentType: agent.type })}
                />
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">
                Tell Us About Your Business
              </h2>
              <p className="text-slate-300">
                Help us customize your agent for your specific business
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName" className="text-white">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Enter your business name"
                  value={data.businessName}
                  onChange={(e) =>
                    setData({ ...data, businessName: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="businessType" className="text-white">Business Type</Label>
                <Select
                  value={data.businessType}
                  onValueChange={(value) =>
                    setData({ ...data, businessType: value })
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">
                Upload Your Knowledge Base
              </h2>
              <p className="text-slate-300">
                Upload files containing your business information to train your AI agent
              </p>
            </div>
            <div className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-slate-600 hover:border-slate-500"
                }`}
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-lg text-slate-300 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-sm text-slate-400">
                  Supports PDF, DOC, DOCX, TXT (max 10MB each)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>

              {data.uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Selected Files:</h4>
                  <div className="space-y-2">
                    {data.uploadedFiles.map((file, index) => {
                      const uploadResult = data.uploadedFileResults.find(r => r.filename === file.name);
                      return (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-slate-300 font-medium">{file.name}</p>
                              <p className="text-xs text-slate-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {uploadResult ? (
                              <div className="flex items-center space-x-1 text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-xs">Uploaded</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-yellow-400">
                                <div className="h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs">Uploading...</span>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {data.uploadedFileResults.length > 0 && (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <h4 className="font-semibold text-green-300">Upload Status</h4>
                  </div>
                  <p className="text-sm text-green-200">
                    {data.uploadedFileResults.length} file(s) uploaded successfully and are being processed for vector embeddings.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">
                Configure Your Agent
              </h2>
              <p className="text-slate-300">
                Set up how your agent will greet and interact with callers
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="greeting" className="text-white">Agent Greeting</Label>
                <Textarea
                  id="greeting"
                  placeholder="Hello! Welcome to [Business Name]. I'm your AI assistant. How can I help you today?"
                  value={data.greeting}
                  onChange={(e) =>
                    setData({ ...data, greeting: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 min-h-[100px]"
                />
                <p className="text-xs text-slate-400 mt-1">
                  This is how your agent will greet callers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startTime" className="text-white">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={data.businessHours.start}
                    onChange={(e) =>
                      setData({
                        ...data,
                        businessHours: {
                          ...data.businessHours,
                          start: e.target.value,
                        },
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-white">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={data.businessHours.end}
                    onChange={(e) =>
                      setData({
                        ...data,
                        businessHours: {
                          ...data.businessHours,
                          end: e.target.value,
                        },
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone" className="text-white">Timezone</Label>
                  <Select
                    value={data.businessHours.timezone}
                    onValueChange={(value) =>
                      setData({
                        ...data,
                        businessHours: {
                          ...data.businessHours,
                          timezone: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz} className="text-white hover:bg-slate-700">
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">
                Phone Number Setup
              </h2>
              <p className="text-slate-300">
                We'll provide you with a dedicated phone number for your AI agent
              </p>
            </div>
            <div className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Phone className="mr-2 h-5 w-5 text-blue-400" />
                    Your Dedicated Number
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    This number will be assigned to your AI agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      +1 (555) XXX-XXXX
                    </div>
                    <p className="text-slate-400">
                      Number will be assigned upon completion
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• Your phone number will be activated within 24 hours</li>
                  <li>• You'll receive setup instructions via email</li>
                  <li>• Your agent will be ready to take calls</li>
                  <li>• You can monitor calls from your dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white">Onboarding Complete!</h3>
            <p className="text-slate-300">
              Your AI voice agent is ready to be configured. Here's what was set up:
            </p>
            <div className="bg-slate-800 rounded-lg p-4 text-left space-y-2">
              <p className="text-slate-300">• <strong>Business:</strong> {data.businessName}</p>
              <p className="text-slate-300">• <strong>Type:</strong> {data.businessType}</p>
              <p className="text-slate-300">• <strong>Phone:</strong> {data.phoneNumber}</p>
              {data.uploadedFileResults && data.uploadedFileResults.length > 0 && (
                <p className="text-slate-300">
                  • <strong>Files:</strong> {data.uploadedFileResults.length} file(s) uploaded successfully
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-300">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-slate-300">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`text-xs ${
                  index <= currentStep ? "text-blue-400" : "text-slate-500"
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Save Status */}
        {isSaving && (
          <Alert className="border-blue-700 bg-blue-900/20 mb-4">
            <AlertDescription className="text-blue-200">
              Saving your progress...
            </AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert className="border-red-700 bg-red-900/20 mb-4">
            <AlertDescription className="text-red-200">
              Error saving data: {saveError}
            </AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8">{renderStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || isSaving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Setup
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

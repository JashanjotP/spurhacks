"use client";

import { useState } from "react";
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
  Link,
  FileText,
  Phone,
  Clock,
  Mic,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Globe,
  Building,
  BarChart3,
} from "lucide-react";

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
        ? "border-blue-500 bg-blue-50/50 shadow-lg ring-2 ring-blue-500/20"
        : "border-gray-200 hover:border-blue-300 hover:shadow-md"
    }`}
    onClick={onSelect}
  >
    <CardHeader className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            {feature}
          </li>
        ))}
      </ul>
      {isSelected && (
        <Badge className="mt-4 w-full justify-center bg-blue-500 hover:bg-blue-600">
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
  const [data, setData] = useState<OnboardingData>({
    agentType: "",
    businessName: "",
    businessType: "",
    knowledgeSource: "",
    uploadedFiles: [],
    websiteUrl: "",
    businessHours: {
      start: "09:00",
      end: "17:00",
      timezone: "America/New_York",
    },
    greeting: "",
    phoneNumber: "",
  });

  const [crawlResult, setCrawlResult] = useState<string | null>(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlError, setCrawlError] = useState<string | null>(null);

  const steps = [
    "Welcome",
    "Agent Type",
    "Business Info",
    "Knowledge Base",
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Generate a mock phone number
    const phoneNumber = `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${
      Math.floor(Math.random() * 9000) + 1000
    }`;
    onComplete({ ...data, phoneNumber });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.agentType !== "";
      case 2:
        return data.businessName && data.businessType;
      case 3:
        return (
          data.knowledgeSource &&
          (data.knowledgeSource === "url"
            ? data.websiteUrl
            : data.uploadedFiles.length > 0)
        );
      case 4:
        return data.greeting;
      default:
        return true;
    }
  };

  //   const handleCrawlWebsite = async () => {
  //     setIsCrawling(true)
  //     setCrawlError(null)
  //     setCrawlResult(null)
  //     try {
  //       const response = await fetch("http://localhost:8000/crawl", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ url: data.websiteUrl }),
  //       })
  //       const result = await response.json()
  //       if (result.status === "success") {
  //         setCrawlResult(result.data)
  //       } else {
  //         setCrawlError("Failed to crawl website.")
  //       }
  //     } catch (err) {
  //       setCrawlError("Error connecting to backend.")
  //     }
  //     setIsCrawling(false)
  //   }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Welcome to VoiceAgent.ai!
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Let's set up your first AI voice agent in just a few minutes.
                Your agent will be ready to handle customer calls 24/7,
                providing instant support and never missing an opportunity.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Choose Agent Type</h3>
                <p className="text-sm text-muted-foreground">
                  Select the perfect agent for your business needs
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Upload Knowledge</h3>
                <p className="text-sm text-muted-foreground">
                  Train your agent with your business information
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Get Phone Number</h3>
                <p className="text-sm text-muted-foreground">
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
              <h2 className="text-2xl font-bold mb-2">
                Choose Your Agent Type
              </h2>
              <p className="text-muted-foreground">
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
              <h2 className="text-2xl font-bold mb-2">
                Tell Us About Your Business
              </h2>
              <p className="text-muted-foreground">
                Help us customize your agent for your specific business
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Enter your business name"
                  value={data.businessName}
                  onChange={(e) =>
                    setData({ ...data, businessName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <Select
                  value={data.businessType}
                  onValueChange={(value) =>
                    setData({ ...data, businessType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
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
              <h2 className="text-2xl font-bold mb-2">
                Upload Your Knowledge Base
              </h2>
              <p className="text-muted-foreground">
                Provide information for your agent to learn about your business,
                products, and services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer transition-all ${
                  data.knowledgeSource === "upload"
                    ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                    : "hover:border-blue-300"
                }`}
                onClick={() => setData({ ...data, knowledgeSource: "upload" })}
              >
                <CardContent className="p-6 text-center">
                  <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Upload Files</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload PDFs, documents, or CSV files
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  data.knowledgeSource === "url"
                    ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                    : "hover:border-blue-300"
                }`}
                onClick={() => setData({ ...data, knowledgeSource: "url" })}
              >
                <CardContent className="p-6 text-center">
                  <Globe className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Website URL</h3>
                  <p className="text-sm text-muted-foreground">
                    Let us crawl your website for information
                  </p>
                </CardContent>
              </Card>
            </div>

            {data.knowledgeSource === "upload" && (
              <div className="space-y-4">
                <Label htmlFor="file-upload">Upload Files</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop files here, or click to browse
                  </p>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setData({ ...data, uploadedFiles: files });
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    Choose Files
                  </Button>
                  {data.uploadedFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Selected files:</p>
                      <ul className="text-sm text-muted-foreground">
                        {data.uploadedFiles.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.knowledgeSource === "url" && (
              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  placeholder="https://your-website.com"
                  value={data.websiteUrl}
                  onChange={(e) =>
                    setData({ ...data, websiteUrl: e.target.value })
                  }
                />
                <Button
                  className="mt-2"
                  //   onClick={handleCrawlWebsite}
                  disabled={!data.websiteUrl || isCrawling}
                >
                  {isCrawling ? "Crawling..." : "Crawl Website"}
                </Button>
                {crawlResult && (
                  <div className="mt-2 text-green-600">{crawlResult}</div>
                )}
                {crawlError && (
                  <div className="mt-2 text-red-600">{crawlError}</div>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  We'll crawl your website to extract relevant information for
                  your agent
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Configure Your Agent</h2>
              <p className="text-muted-foreground">
                Set up business hours and customize your agent's greeting
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold">
                  Business Hours
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
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
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="greeting">Agent Greeting</Label>
                <Textarea
                  id="greeting"
                  placeholder={`Hello! Thank you for calling ${
                    data.businessName || "our business"
                  }. I'm your AI assistant and I'm here to help you. How can I assist you today?`}
                  value={data.greeting}
                  onChange={(e) =>
                    setData({ ...data, greeting: e.target.value })
                  }
                  rows={4}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  This greeting will be played when customers call your agent
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Get Your Phone Number</h2>
              <p className="text-muted-foreground">
                We're setting up a dedicated phone number for your AI agent
              </p>
            </div>

            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <Phone className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Provisioning Phone Number...
                  </h3>
                  <p className="text-muted-foreground">
                    This usually takes just a few seconds
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full animate-pulse"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
            </Card>

            <Alert>
              <Phone className="h-4 w-4" />
              <AlertDescription>
                Your phone number will be ready in the next step. You can start
                receiving calls immediately after setup is complete.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                🎉 Your Agent is Ready!
              </h2>
              <p className="text-muted-foreground">
                Congratulations! Your AI voice agent has been successfully
                configured and is ready to handle calls.
              </p>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Agent Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agent Type:</span>
                  <span className="font-medium capitalize">
                    {data.agentType} Agent
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business:</span>
                  <span className="font-medium">{data.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone Number:</span>
                  <span className="font-medium font-mono">
                    +1 (555) 123-4567
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business Hours:</span>
                  <span className="font-medium">
                    {data.businessHours.start} - {data.businessHours.end}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Knowledge Source:
                  </span>
                  <span className="font-medium capitalize">
                    {data.knowledgeSource === "upload"
                      ? "Uploaded Files"
                      : "Website URL"}
                  </span>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mic className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Test Your Agent</h4>
                    <p className="text-sm text-muted-foreground">
                      Call your number to test the setup
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">View Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor calls and performance
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Setup Your AI Voice Agent</h1>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            {steps.map((step, index) => (
              <span
                key={step}
                className={`${
                  index <= currentStep ? "text-blue-600 font-medium" : ""
                }`}
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">{renderStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleComplete}
              className="flex items-center bg-green-600 hover:bg-green-700"
            >
              Complete Setup
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

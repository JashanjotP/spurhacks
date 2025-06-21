"use client"

import { useState, useEffect } from "react"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Phone, TrendingUp, Users } from "lucide-react"

interface OnboardingData {
  agentType: "faq" | "booking" | "order" | ""
  businessName: string
  businessType: string
  knowledgeSource: "upload" | "url" | ""
  uploadedFiles: File[]
  websiteUrl: string
  businessHours: {
    start: string
    end: string
    timezone: string
  }
  greeting: string
  phoneNumber: string
}

export default function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [agentData, setAgentData] = useState<OnboardingData | null>(null)

  // Check if user has completed onboarding (in real app, this would be from API/database)
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed")
    if (hasCompletedOnboarding) {
      setShowOnboarding(false)
    }
  }, [])

  const handleOnboardingComplete = (data: OnboardingData) => {
    setAgentData(data)
    setShowOnboarding(false)
    localStorage.setItem("onboarding_completed", "true")
    localStorage.setItem("agent_data", JSON.stringify(data))
  }

  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />
  }

  // Mock data for dashboard
  const stats = [
    {
      title: "Active Agents",
      value: 1,
      description: "AI agents currently active",
      icon: Bot,
    },
    {
      title: "Total Calls",
      value: 0,
      description: "Calls in the last 30 days",
      icon: Phone,
    },
    {
      title: "Avg Duration",
      value: "0:00",
      description: "Average call duration",
      icon: TrendingUp,
    },
    {
      title: "Total Agents",
      value: 1,
      description: "All configured agents",
      icon: Users,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your AI voice agents.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your AI Agent</CardTitle>
            <CardDescription>Recently configured agent ready to handle calls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {agentData && (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium">{agentData.businessName}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {agentData.agentType} Agent • {agentData.businessType}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Phone Number</h4>
                  <p className="text-sm font-mono">{agentData.phoneNumber}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Business Hours</h4>
                  <p className="text-sm text-muted-foreground">
                    {agentData.businessHours.start} - {agentData.businessHours.end}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your AI voice agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Test Your Agent</h4>
              <p className="text-sm text-muted-foreground">
                Call your agent to test the setup and ensure everything works correctly.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Update Knowledge Base</h4>
              <p className="text-sm text-muted-foreground">Add more information to improve your agent's responses.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">View Call Analytics</h4>
              <p className="text-sm text-muted-foreground">
                Monitor performance and see how your agent is helping customers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Phone, TrendingUp, Users, Brain, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface AnimatedStatsCardProps {
  title: string
  value: number | string
  description: string
  icon: React.ComponentType<{ className?: string }>
  delay?: number
}

// Animated Stats Card
const AnimatedStatsCard = ({ title, value, description, icon: Icon, delay = 0 }: AnimatedStatsCardProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedValue, setAnimatedValue] = useState(0)
  const cardRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if(cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [delay])

  useEffect(() => {
    if (isVisible && typeof value === 'number') {
      let start = 0
      const end = value
      if (end === 0) {
          setAnimatedValue(0)
          return
      }
      const duration = 1000
      const increment = end / (duration / 50)
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setAnimatedValue(end)
          clearInterval(timer)
        } else {
          setAnimatedValue(Math.floor(start))
        }
      }, 50)
      return () => clearInterval(timer)
    } else if (typeof value !== 'number') {
        setAnimatedValue(0)
    }
  }, [isVisible, value])

  return (
    <Card
      ref={cardRef}
      className={`group relative overflow-hidden border-0 bg-slate-900/70 backdrop-blur-xl hover:bg-slate-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors group-hover:scale-110 transform" />
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold text-white mb-1">
          {typeof value === 'number' ? (isVisible ? animatedValue.toLocaleString() : 0) : value}
        </div>
        <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [agentData, setAgentData] = useState<OnboardingData | null>(null)

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed")
    if (hasCompletedOnboarding) {
      setShowOnboarding(false)
      const storedData = localStorage.getItem("agent_data")
      if(storedData) {
        setAgentData(JSON.parse(storedData))
      }
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

  const stats = [
    {
      title: "Active Agents",
      value: 8,
      description: "AI agents currently active",
      icon: Bot,
    },
    {
      title: "Total Calls",
      value: 7482,
      description: "Calls in the last 30 days",
      icon: Phone,
    },
    {
      title: "Avg Duration",
      value: "6:45",
      description: "Average call duration",
      icon: TrendingUp,
    },
    {
      title: "Total Portals",
      value: 10,
      description: "All configured portals",
      icon: Users,
    },
  ]

  return (
    <div className="p-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
            Dashboard
          </h1>
        </div>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Welcome back! Here's an overview of your AI voice agents and their performance.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <AnimatedStatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              delay={index * 100}
            />
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="group relative overflow-hidden border-0 bg-slate-900/70 backdrop-blur-xl hover:bg-slate-800/80 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-white group-hover:text-blue-100 transition-colors flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-400" />
                Your AI Agent
              </CardTitle>
              <CardDescription className="text-slate-400 group-hover:text-slate-300 transition-colors">
                Recently configured agent ready to handle calls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {agentData ? (
                <div className="space-y-3">
                  <div className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm">
                    <h4 className="font-medium text-white mb-1">{agentData.businessName}</h4>
                    <p className="text-sm text-slate-400 capitalize">
                      {agentData.agentType} Agent • {agentData.businessType}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm">
                    <h4 className="font-medium text-white mb-1">Phone Number</h4>
                    <p className="text-sm font-mono text-slate-300">{agentData.phoneNumber}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm">
                    <h4 className="font-medium text-white mb-1">Business Hours</h4>
                    <p className="text-sm text-slate-400">
                      {agentData.businessHours.start} - {agentData.businessHours.end}
                    </p>
                  </div>
                </div>
              ) : <p className="text-slate-400">No agent data found. Complete onboarding to see details here.</p>}
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-slate-900/70 backdrop-blur-xl hover:bg-slate-800/80 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-white group-hover:text-blue-100 transition-colors flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-slate-400 group-hover:text-slate-300 transition-colors">
                Get started with your AI voice agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm">
                  <h4 className="font-medium text-white mb-1">Explore Portals</h4>
                  <p className="text-sm text-slate-400 mb-3">
                    View and manage all 10 AI agent portals across different business domains.
                  </p>
                  <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                    <a href="/dashboard/portals">View All Portals</a>
                  </Button>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm">
                  <h4 className="font-medium text-white mb-1">Test Your Agent</h4>
                  <p className="text-sm text-slate-400">
                    Call your agent to test the setup and ensure everything works correctly.
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm">
                  <h4 className="font-medium text-white mb-1">Update Knowledge Base</h4>
                  <p className="text-sm text-slate-400">Add more information to improve your agent's responses.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

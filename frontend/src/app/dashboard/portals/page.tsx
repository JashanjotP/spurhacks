"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Clock, Star, Activity, Settings, Play, Pause, Wrench, Search, BarChart3, Zap, Shield, Brain } from "lucide-react"

// Type definitions
interface PortalData {
  id: string
  name: string
  type: string
  description: string
  phoneNumber: string
  status: string
  businessHours: { start: string; end: string; timezone: string }
  stats: {
    totalCalls: number
    avgDuration: string
    satisfaction: number
    lastCall: string
  }
  features: string[]
  icon: string
  color: string
}

interface AnimatedStatsCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  delay?: number
}

interface FloatingOrbProps {
  delay?: number
  size?: number
  color?: string
}

// Mock data for portals
const mockPortals = [
  {
    id: "1",
    name: "Restaurant Reservations",
    type: "Booking Agent",
    description: "Handle table reservations, menu inquiries, and special requests with our AI hostess.",
    phoneNumber: "+1 (555) 123-4567",
    status: "active",
    businessHours: { start: "9:00 AM", end: "11:00 PM", timezone: "EST" },
    stats: {
      totalCalls: 1250,
      avgDuration: "2m 45s",
      satisfaction: 4.8,
      lastCall: "5 mins ago"
    },
    features: ["Multilingual Support", "Table Booking", "Menu Q&A", "Special Requests", "Waitlist Management"],
    icon: "🍽️",
    color: "bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30"
  },
  {
    id: "2",
    name: "Medical Scheduler",
    type: "Medical Support",
    description: "Book appointments, provide office hours, and answer patient questions professionally.",
    phoneNumber: "+1 (555) 234-5678",
    status: "active",
    businessHours: { start: "8:00 AM", end: "6:00 PM", timezone: "EST" },
    stats: {
      totalCalls: 892,
      avgDuration: "3m 12s",
      satisfaction: 4.9,
      lastCall: "12 mins ago"
    },
    features: ["HIPAA Compliant", "Appointment Booking", "Insurance Verification", "Prescription Refills"],
    icon: "🏥",
    color: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
  },
  {
    id: "3",
    name: "Tech Support Hub",
    type: "Technical Support",
    description: "First-line technical support with troubleshooting and ticket creation capabilities.",
    phoneNumber: "+1 (555) 345-6789",
    status: "maintenance",
    businessHours: { start: "24/7", end: "", timezone: "UTC" },
    stats: {
      totalCalls: 2103,
      avgDuration: "4m 32s",
      satisfaction: 4.6,
      lastCall: "1 hour ago"
    },
    features: ["24/7 Support", "Ticket Creation", "Knowledge Base", "Escalation Routing"],
    icon: "🔧",
    color: "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
  },
  {
    id: "4",
    name: "E-commerce Assistant",
    type: "E-commerce",
    description: "Handle order inquiries, returns, and product information for your online store.",
    phoneNumber: "+1 (555) 456-7890",
    status: "active",
    businessHours: { start: "6:00 AM", end: "12:00 AM", timezone: "PST" },
    stats: {
      totalCalls: 3456,
      avgDuration: "2m 18s",
      satisfaction: 4.7,
      lastCall: "2 mins ago"
    },
    features: ["Order Tracking", "Return Processing", "Product Info", "Inventory Check"],
    icon: "🛒",
    color: "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
  },
  {
    id: "5",
    name: "Legal Intake",
    type: "Legal Services",
    description: "Screen potential clients and schedule consultations with qualified attorneys.",
    phoneNumber: "+1 (555) 567-8901",
    status: "inactive",
    businessHours: { start: "9:00 AM", end: "5:00 PM", timezone: "EST" },
    stats: {
      totalCalls: 445,
      avgDuration: "5m 47s",
      satisfaction: 4.9,
      lastCall: "2 days ago"
    },
    features: ["Client Screening", "Consultation Booking", "Document Collection", "Confidentiality"],
    icon: "⚖️",
    color: "bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border-indigo-500/30"
  },
  {
    id: "6",
    name: "Property Management",
    type: "Property Management",
    description: "Handle tenant inquiries, maintenance requests, and property information.",
    phoneNumber: "+1 (555) 678-9012",
    status: "active",
    businessHours: { start: "7:00 AM", end: "10:00 PM", timezone: "CST" },
    stats: {
      totalCalls: 678,
      avgDuration: "3m 25s",
      satisfaction: 4.5,
      lastCall: "23 mins ago"
    },
    features: ["Maintenance Requests", "Tenant Screening", "Rent Collection", "Property Tours"],
    icon: "🏠",
    color: "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
  }
]

// Floating Orb Component
const FloatingOrb = ({ delay = 0, size = 100, color = "blue" }: FloatingOrbProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)

    const animate = () => {
      setPosition({
        x: Math.sin(Date.now() * 0.001 + delay) * 30 + scrollY * 0.05,
        y: Math.cos(Date.now() * 0.0015 + delay) * 20 + scrollY * 0.03,
      })
    }

    const interval = setInterval(animate, 50)
    return () => {
      clearInterval(interval)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [delay, scrollY])

  return (
    <div
      className={`absolute rounded-full opacity-10 blur-xl transition-all duration-1000 pointer-events-none ${
        color === "blue"
          ? "bg-blue-500"
          : color === "purple"
          ? "bg-purple-500"
          : "bg-pink-500"
      }`}
      style={{
        width: size,
        height: size,
        transform: `translate(${position.x}px, ${position.y}px)`,
        animation: "pulse 4s ease-in-out infinite",
      }}
    />
  )
}

// Animated Stats Card
const AnimatedStatsCard = ({ title, value, subtitle, icon: Icon, delay = 0 }: AnimatedStatsCardProps) => {
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

    return () => observer.disconnect()
  }, [delay])

  useEffect(() => {
    if (isVisible && typeof value === 'number') {
      let start = 0
      const increment = value / 30
      const timer = setInterval(() => {
        start += increment
        if (start >= value) {
          setAnimatedValue(value)
          clearInterval(timer)
        } else {
          setAnimatedValue(Math.floor(start))
        }
      }, 50)
    }
  }, [isVisible, value])

  return (
    <Card
      ref={cardRef}
      className={`group relative overflow-hidden border-0 bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl hover:from-slate-800/80 hover:to-slate-700/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors group-hover:scale-110 transform" />
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold text-white mb-1">
          {typeof value === 'number' ? (isVisible ? animatedValue.toLocaleString() : 0) : value}
        </div>
        <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  )
}

export default function PortalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredPortals = mockPortals.filter((portal) => {
    const matchesSearch = portal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portal.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || portal.status === statusFilter
    const matchesType = typeFilter === "all" || portal.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Activity className="h-4 w-4 text-green-400" />
      case "inactive":
        return <Pause className="h-4 w-4 text-slate-500" />
      case "maintenance":
        return <Wrench className="h-4 w-4 text-yellow-400" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "inactive":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      case "maintenance":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
            AI Agent Portals
          </h1>
        </div>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Manage and monitor your intelligent voice agents across different business domains with real-time analytics and insights.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search portals by name, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20 backdrop-blur-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20 backdrop-blur-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Booking Agent">Booking Agent</SelectItem>
                <SelectItem value="Medical Support">Medical Support</SelectItem>
                <SelectItem value="Technical Support">Technical Support</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
                <SelectItem value="Legal Services">Legal Services</SelectItem>
                <SelectItem value="Property Management">Property Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <AnimatedStatsCard
            title="Total Portals"
            value={mockPortals.length}
            subtitle="AI agents configured"
            icon={Brain}
            delay={100}
          />
          <AnimatedStatsCard
            title="Active Portals"
            value={mockPortals.filter(p => p.status === "active").length}
            subtitle="Currently running"
            icon={Zap}
            delay={200}
          />
          <AnimatedStatsCard
            title="Total Calls"
            value={mockPortals.reduce((sum, portal) => sum + portal.stats.totalCalls, 0)}
            subtitle="Across all portals"
            icon={Phone}
            delay={300}
          />
          <AnimatedStatsCard
            title="Avg Satisfaction"
            value={(mockPortals.reduce((sum, portal) => sum + portal.stats.satisfaction, 0) / mockPortals.length).toFixed(1)}
            subtitle="Out of 5.0"
            icon={Star}
            delay={400}
          />
        </div>

        {/* Portals Grid */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredPortals.map((portal, index) => (
            <Card 
              key={portal.id} 
              className="group relative overflow-hidden border-0 bg-slate-900/70 backdrop-blur-xl hover:bg-slate-800/80 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20"
              style={{ animationDelay: `${(index % 6) * 100}ms` }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${portal.color} backdrop-blur-sm transition-all duration-300 group-hover:scale-110`}>
                      {portal.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white group-hover:text-blue-100 transition-colors">
                        {portal.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400 group-hover:text-slate-300 transition-colors">
                        {portal.type}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(portal.status)}
                    <Badge className={`${getStatusColor(portal.status)} backdrop-blur-sm`}>
                      {portal.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 relative z-10">
                <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
                  {portal.description}
                </p>
                
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-slate-700/50 rounded-lg">
                      <Phone className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="font-mono text-slate-300">{portal.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-slate-700/50 rounded-lg">
                      <Clock className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300">
                      {portal.businessHours.start} - {portal.businessHours.end} {portal.businessHours.timezone}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-slate-400 mb-1">Total Calls</p>
                    <p className="font-bold text-white">{portal.stats.totalCalls.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-slate-400 mb-1">Avg Duration</p>
                    <p className="font-bold text-white">{portal.stats.avgDuration}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-slate-400 mb-1">Satisfaction</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-white">{portal.stats.satisfaction}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-slate-400 mb-1">Last Call</p>
                    <p className="font-bold text-white text-xs">{portal.stats.lastCall}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-200">Key Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {portal.features.slice(0, 3).map((feature, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                      >
                        {feature}
                      </Badge>
                    ))}
                    {portal.features.length > 3 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-slate-600/50 text-slate-300 border-slate-500/30"
                      >
                        +{portal.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Test Call
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPortals.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No portals found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your search criteria or filters.</p>
            <Button 
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setTypeFilter("all")
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
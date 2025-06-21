"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Clock, Star, Activity, Settings, Play, Pause, Wrench } from "lucide-react"
import { mockPortals, PortalData } from "@/lib/mock-data"

export default function PortalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

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
        return <Activity className="h-4 w-4 text-green-500" />
      case "inactive":
        return <Pause className="h-4 w-4 text-gray-500" />
      case "maintenance":
        return <Wrench className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Agent Portals</h1>
        <p className="text-muted-foreground">
          Manage and monitor your AI voice agents across different business domains.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search portals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="FAQ & Support">FAQ & Support</SelectItem>
              <SelectItem value="Booking Agent">Booking Agent</SelectItem>
              <SelectItem value="Technical Support">Technical Support</SelectItem>
              <SelectItem value="E-commerce">E-commerce</SelectItem>
              <SelectItem value="Medical Support">Medical Support</SelectItem>
              <SelectItem value="Travel & Tourism">Travel & Tourism</SelectItem>
              <SelectItem value="Banking & Finance">Banking & Finance</SelectItem>
              <SelectItem value="Property Management">Property Management</SelectItem>
              <SelectItem value="Legal Services">Legal Services</SelectItem>
              <SelectItem value="Educational Support">Educational Support</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPortals.length}</div>
            <p className="text-xs text-muted-foreground">AI agents configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Portals</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPortals.filter(p => p.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPortals.reduce((sum, portal) => sum + portal.stats.totalCalls, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all portals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockPortals.reduce((sum, portal) => sum + portal.stats.satisfaction, 0) / mockPortals.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Portals Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPortals.map((portal) => (
          <Card key={portal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${portal.color}`}>
                    {portal.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{portal.name}</CardTitle>
                    <CardDescription className="text-sm">{portal.type}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(portal.status)}
                  <Badge className={getStatusColor(portal.status)}>
                    {portal.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{portal.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{portal.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {portal.businessHours.start} - {portal.businessHours.end} ({portal.businessHours.timezone})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Calls</p>
                  <p className="font-semibold">{portal.stats.totalCalls.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Duration</p>
                  <p className="font-semibold">{portal.stats.avgDuration}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Satisfaction</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{portal.stats.satisfaction}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Call</p>
                  <p className="font-semibold text-xs">{portal.stats.lastCall}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {portal.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {portal.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{portal.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Play className="h-4 w-4 mr-1" />
                  Test Call
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPortals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No portals found matching your criteria.</p>
        </div>
      )}
    </div>
  )
} 
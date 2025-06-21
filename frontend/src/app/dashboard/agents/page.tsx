"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AgentForm } from "@/components/dashboard/agent-form"
import { Plus, Bot, Phone, Edit, Trash2, Activity } from "lucide-react"

// Mock data
const mockAgents = [
  {
    id: "1",
    name: "Customer Support Bot",
    description: "Handles general customer inquiries and support requests",
    knowledge_base: "Customer support knowledge base...",
    system_prompt: "You are a helpful customer support assistant...",
    phone_number: "+1 (555) 123-4567",
    is_active: true,
  },
  {
    id: "2",
    name: "Sales Assistant",
    description: "Helps with product information and sales inquiries",
    knowledge_base: "Sales and product information...",
    system_prompt: "You are a knowledgeable sales assistant...",
    phone_number: "+1 (555) 987-6543",
    is_active: true,
  },
  {
    id: "3",
    name: "Technical Support",
    description: "Provides technical assistance and troubleshooting",
    knowledge_base: "Technical documentation and troubleshooting guides...",
    system_prompt: "You are a technical support specialist...",
    phone_number: "+1 (555) 456-7890",
    is_active: false,
  },
]

export default function AgentsPage() {
  const [agents, setAgents] = useState(mockAgents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<any>(null)

  const handleSuccess = () => {
    setDialogOpen(false)
    setEditingAgent(null)
    // In real app, refetch agents
  }

  const handleEdit = (agent: any) => {
    setEditingAgent(agent)
    setDialogOpen(true)
  }

  const handleDelete = (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return
    setAgents(agents.filter((agent) => agent.id !== agentId))
  }

  const toggleAgentStatus = (agentId: string) => {
    setAgents(agents.map((agent) => (agent.id === agentId ? { ...agent, is_active: !agent.is_active } : agent)))
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
            AI Agents
          </h1>
        </div>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Manage and configure your intelligent voice agents for different business needs.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Active Agents</h2>
              <p className="text-slate-400">{agents.filter(a => a.is_active).length} of {agents.length} agents</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setEditingAgent(null)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-900/90 backdrop-blur-xl border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">{editingAgent ? "Edit Agent" : "Create New Agent"}</DialogTitle>
              </DialogHeader>
              <AgentForm agent={editingAgent} onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, index) => (
            <Card 
              key={agent.id} 
              className="group relative overflow-hidden border-0 bg-slate-900/70 backdrop-blur-xl hover:bg-slate-800/80 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20"
              style={{ animationDelay: `${(index % 6) * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-white group-hover:text-blue-100 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-slate-700 group-hover:border-blue-500/30 transition-colors">
                      <Bot className="h-5 w-5 text-blue-400" />
                    </div>
                    {agent.name}
                  </CardTitle>
                  <Badge 
                    className={`${
                      agent.is_active 
                        ? "bg-green-500/20 text-green-300 border-green-500/30" 
                        : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                    } backdrop-blur-sm`}
                  >
                    {agent.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  {agent.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                {agent.phone_number && (
                  <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm">
                    <div className="p-2 bg-slate-700/50 rounded-lg">
                      <Phone className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="font-mono text-slate-300">{agent.phone_number}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(agent)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant={agent.is_active ? "secondary" : "default"}
                    size="sm"
                    onClick={() => toggleAgentStatus(agent.id)}
                    className={`${
                      agent.is_active 
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30" 
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                    } transition-all duration-300`}
                  >
                    {agent.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(agent.id)}
                    className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

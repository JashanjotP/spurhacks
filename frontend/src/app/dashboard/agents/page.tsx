"use client"

import { useState } from "react"
import { PlusCircle, Search, Brain, Zap, Trash, Edit, ToggleLeft, ToggleRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AgentForm, Agent } from "@/components/dashboard/agent-form"
import { toast } from "sonner"

// Mock data for agents
const MOCK_AGENTS: Agent[] = [
  {
    id: "agt_1",
    name: "Restaurant Booker",
    model: "GPT-4o",
    prompt: "You are a friendly and efficient assistant for a high-end restaurant. Your goal is to help callers book a table.",
    voice: "onyx",
    language: "English",
    isActive: true,
  },
  {
    id: "agt_2",
    name: "Medical Scheduler",
    model: "GPT-4 Turbo",
    prompt: "You are a professional and empathetic medical scheduler. You must handle patient information with care and confidentiality.",
    voice: "nova",
    language: "English",
    isActive: true,
  },
  {
    id: "agt_3",
    name: "Support Technician",
    model: "Claude 3 Sonnet",
    prompt: "You are a knowledgeable tech support agent. Your goal is to resolve technical issues or create a ticket.",
    voice: "shimmer",
    language: "English",
    isActive: false,
  },
  {
    id: "agt_4",
    name: "Asistente de Ventas",
    model: "GPT-4o",
    prompt: "Eres un asistente de ventas enérgico y persuasivo. Tu objetivo es destacar las características del producto y cerrar la venta.",
    voice: "nova",
    language: "Spanish",
    isActive: true,
  },
]

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSuccess = (agentData: Omit<Agent, 'id' | 'isActive'>) => {
    if (editingAgent) {
      const updatedAgent = { ...editingAgent, ...agentData }
      setAgents(agents.map(a => a.id === updatedAgent.id ? updatedAgent : a))
      toast.success("Agent updated successfully!")
    } else {
      const newAgent = { ...agentData, id: `agt_${Date.now()}`, isActive: true }
      setAgents([newAgent, ...agents])
      toast.success("Agent created successfully!")
    }
    setIsFormOpen(false)
    setEditingAgent(null)
  }

  const handleDelete = (agentId: string) => {
    setAgents(agents.filter(a => a.id !== agentId))
    toast.success("Agent deleted.")
  }

  const openEditForm = (agent: Agent) => {
    setEditingAgent(agent)
    setIsFormOpen(true)
  }

  const toggleAgentStatus = (agentId: string) => {
    setAgents(
      agents.map(a =>
        a.id === agentId ? { ...a, isActive: !a.isActive } : a
      )
    )
    toast.success("Agent status updated.")
  }

  return (
    <>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between space-x-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
              My Agents
            </h1>
            <p className="text-lg text-slate-300">
              Create and manage your AI voice agents.
            </p>
          </div>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => {
              setEditingAgent(null)
              setIsFormOpen(true)
            }}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Agent
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 backdrop-blur-sm"
          />
        </div>

        {/* Agents Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map(agent => (
            <Card key={agent.id} className="group relative overflow-hidden border-0 bg-slate-900/70 backdrop-blur-xl hover:bg-slate-800/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <Brain className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white group-hover:text-blue-100 transition-colors">
                        {agent.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400 group-hover:text-slate-300 transition-colors">
                        {agent.model}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={agent.isActive ? "default" : "secondary"} className={agent.isActive ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"}>
                    {agent.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <p className="text-sm text-slate-300 h-10 overflow-hidden">
                  {agent.prompt}
                </p>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span>{agent.voice}</span>
                  </div>
                  <span>{agent.language}</span>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="icon" variant="ghost" onClick={() => toggleAgentStatus(agent.id)} className="text-slate-400 hover:text-white hover:bg-slate-700/50">
                    {agent.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => openEditForm(agent)} className="text-slate-400 hover:text-white hover:bg-slate-700/50">
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(agent.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/20">
                    <Trash className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
            <p className="text-slate-400">Try adjusting your search or create a new agent.</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
          <Card className="w-full max-w-lg border-0 bg-slate-900/80 backdrop-blur-xl relative shadow-2xl shadow-blue-500/20">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <X className="h-5 w-5" />
            </Button>
            <CardHeader>
              <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
                {editingAgent ? "Edit Agent" : "Create New Agent"}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {editingAgent ? "Update the details of your AI agent." : "Configure a new AI voice agent."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgentForm
                agent={editingAgent}
                onSuccess={handleSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

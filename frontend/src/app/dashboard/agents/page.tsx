"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AgentForm } from "@/components/dashboard/agent-form"
import { Plus, Bot, Phone, Edit, Trash2 } from "lucide-react"

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">Manage your AI voice agents</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAgent(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAgent ? "Edit Agent" : "Create New Agent"}</DialogTitle>
            </DialogHeader>
            <AgentForm agent={editingAgent} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  {agent.name}
                </CardTitle>
                <Badge variant={agent.is_active ? "default" : "secondary"}>
                  {agent.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agent.phone_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    {agent.phone_number}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(agent)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant={agent.is_active ? "secondary" : "default"}
                    size="sm"
                    onClick={() => toggleAgentStatus(agent.id)}
                  >
                    {agent.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(agent.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

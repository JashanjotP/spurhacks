"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  knowledge_base: string;
  system_prompt: string;
  phone_number?: string;
  is_active: boolean;
}

interface AgentFormProps {
  agent?: Agent;
  onSuccess?: () => void;
}

export function AgentForm({ agent, onSuccess }: AgentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: agent?.name || "",
    description: agent?.description || "",
    knowledge_base: agent?.knowledge_base || "",
    system_prompt:
      agent?.system_prompt ||
      "You are a helpful AI assistant for this business. Answer questions based on the provided knowledge base.",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      console.log("Agent data:", formData);
      setLoading(false);
      onSuccess?.();
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{agent ? "Edit Agent" : "Create New Agent"}</CardTitle>
        <CardDescription>
          Configure your AI voice agent with custom knowledge and personality.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              placeholder="e.g., Customer Support Bot"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of what this agent does"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="knowledge_base">Knowledge Base</Label>
            <Textarea
              id="knowledge_base"
              placeholder="Enter your business information, FAQs, policies, etc. This will be used to answer customer questions."
              value={formData.knowledge_base}
              onChange={(e) => handleChange("knowledge_base", e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Provide detailed information about your business, products,
              services, and common questions.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="system_prompt">System Prompt</Label>
            <Textarea
              id="system_prompt"
              placeholder="Instructions for how the AI should behave and respond"
              value={formData.system_prompt}
              onChange={(e) => handleChange("system_prompt", e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Define the personality and behavior of your AI agent.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {agent ? "Update Agent" : "Create Agent"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

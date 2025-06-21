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

export interface Agent {
  id: string;
  name: string;
  model: string;
  prompt: string;
  voice: string;
  language: string;
  isActive: boolean;
}

interface AgentFormProps {
  agent?: Agent | null;
  onSuccess: (agent: Omit<Agent, 'id' | 'isActive'>) => void;
  onCancel: () => void;
}

export function AgentForm({ agent, onSuccess, onCancel }: AgentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: agent?.name || "",
    model: agent?.model || "GPT-4o",
    prompt:
      agent?.prompt ||
      "You are a helpful AI assistant. Your main goal is to assist users effectively.",
    voice: agent?.voice || "onyx",
    language: agent?.language || "English",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      onSuccess(formData);
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              placeholder="e.g., Customer Support Bot"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Language Model</Label>
            <Input
              id="model"
              placeholder="e.g., GPT-4o"
              value={formData.model}
              onChange={(e) => handleChange("model", e.target.value)}
              required
              className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">System Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Instructions for how the AI should behave and respond"
              value={formData.prompt}
              onChange={(e) => handleChange("prompt", e.target.value)}
              rows={6}
              className="resize-none bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Input
                id="voice"
                placeholder="e.g., onyx"
                value={formData.voice}
                onChange={(e) => handleChange("voice", e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                placeholder="e.g., English"
                value={formData.language}
                onChange={(e) => handleChange("language", e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel} className="text-slate-300 hover:bg-slate-700 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {agent ? "Update Agent" : "Create Agent"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

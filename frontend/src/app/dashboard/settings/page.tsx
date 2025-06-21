"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Phone, Key, Copy } from "lucide-react";

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);

  const webhookUrl = "https://your-app.vercel.app/api/twilio/webhook";

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your account and integration settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Twilio Configuration
            </CardTitle>
            <CardDescription>
              Configure your Twilio account for phone number provisioning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twilio-sid">Account SID</Label>
              <Input
                id="twilio-sid"
                placeholder="Enter your Twilio Account SID"
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twilio-token">Auth Token</Label>
              <Input
                id="twilio-token"
                placeholder="Enter your Twilio Auth Token"
                type="password"
              />
            </div>
            <Button>Save Twilio Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              OpenAI Configuration
            </CardTitle>
            <CardDescription>
              Configure your OpenAI API key for AI responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key">API Key</Label>
              <Input
                id="openai-key"
                placeholder="Enter your OpenAI API Key"
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openai-model">Model</Label>
              <Input
                id="openai-model"
                placeholder="gpt-4o"
                defaultValue="gpt-4o"
              />
            </div>
            <Button>Save OpenAI Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Webhook Configuration
            </CardTitle>
            <CardDescription>
              Webhook URL for Twilio integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use this URL in your Twilio webhook configuration
              </p>
            </div>

            {copied && (
              <Alert>
                <AlertDescription>
                  Webhook URL copied to clipboard!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

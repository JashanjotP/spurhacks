"use client";

import { useState, useEffect } from "react";
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
import { Settings, Phone, Key, Copy, Brain, Shield, Zap, Save, Check } from "lucide-react";
import { toast } from "sonner";

// Floating Orb Component
const FloatingOrb = ({ delay = 0, size = 100, color = "blue" }: { delay?: number; size?: number; color?: string }) => {
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

export default function SettingsPage() {
  const [twilioSid, setTwilioSid] = useState("ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  const [twilioAuthToken, setTwilioAuthToken] = useState("sk_xxxxxxxxxxxxxxxxxxxxxxxxxx");
  const [openaiApiKey, setOpenaiApiKey] = useState("sk_xxxxxxxxxxxxxxxxxxxxxxxxxx");
  const webhookUrl = "https://api.example.com/webhook/12345";

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied to clipboard!");
  };

  const handleSaveTwilio = () => {
    // In a real app, you would save these to a secure backend
    console.log("Saving Twilio settings:", { twilioSid, twilioAuthToken });
    toast.success("Twilio settings saved!");
  };

  const handleSaveOpenAI = () => {
    // In a real app, you would save this to a secure backend
    console.log("Saving OpenAI API Key");
    toast.success("OpenAI API Key saved!");
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-900/50 to-slate-950" />
      <FloatingOrb delay={0} size={200} color="blue" />
      <FloatingOrb delay={2} size={150} color="purple" />
      <FloatingOrb delay={4} size={100} color="pink" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 space-y-8 p-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
              Settings
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Configure your account and integration settings for optimal AI agent performance.
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl hover:from-slate-800/80 hover:to-slate-700/80 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-white group-hover:text-blue-100 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-slate-700">
                  <Phone className="h-5 w-5 text-blue-400" />
                </div>
                Twilio Configuration
              </CardTitle>
              <CardDescription className="text-slate-400 group-hover:text-slate-300 transition-colors">
                Configure your Twilio account for phone number provisioning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twilio-sid" className="text-slate-300">Account SID</Label>
                  <Input
                    id="twilio-sid"
                    value={twilioSid}
                    onChange={(e) => setTwilioSid(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twilio-auth" className="text-slate-300">Auth Token</Label>
                  <Input
                    id="twilio-auth"
                    type="password"
                    value={twilioAuthToken}
                    onChange={(e) => setTwilioAuthToken(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 backdrop-blur-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveTwilio}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Twilio Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl hover:from-slate-800/80 hover:to-slate-700/80 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-white group-hover:text-blue-100 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-slate-700">
                  <Brain className="h-5 w-5 text-green-400" />
                </div>
                OpenAI Configuration
              </CardTitle>
              <CardDescription className="text-slate-400 group-hover:text-slate-300 transition-colors">
                Configure your OpenAI API key for AI responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key" className="text-slate-300">API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 backdrop-blur-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveOpenAI}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save API Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl hover:from-slate-800/80 hover:to-slate-700/80 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-white group-hover:text-blue-100 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-slate-700">
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                Webhook Configuration
              </CardTitle>
              <CardDescription className="text-slate-400 group-hover:text-slate-300 transition-colors">
                Webhook URL for Twilio integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url" className="text-slate-300">Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhook-url"
                      value={webhookUrl}
                      readOnly
                      className="flex-1 bg-slate-800/50 border-slate-700 text-slate-300 backdrop-blur-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={copyWebhookUrl}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-400">
                    Use this URL in your Twilio webhook configuration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

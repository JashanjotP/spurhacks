"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen, FullScreenLoading, InlineLoading } from "@/components/ui/loading-screen";

export default function LoadingDemo() {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProgressDemo = () => {
    setShowProgress(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowProgress(false), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Loading Screen Demo
          </h1>
          <p className="text-slate-300 text-lg">
            Explore different loading screen variants for the AI Voice Agent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Screen Loading */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Full Screen Loading</CardTitle>
              <CardDescription className="text-slate-300">
                Complete screen overlay with animated elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setShowFullScreen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Show Full Screen Loading
              </Button>
              <p className="text-sm text-slate-400">
                Perfect for app initialization, data loading, or major state transitions
              </p>
            </CardContent>
          </Card>

          {/* Progress Loading */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Progress Loading</CardTitle>
              <CardDescription className="text-slate-300">
                Loading with progress bar and percentage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleProgressDemo}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Show Progress Loading
              </Button>
              <p className="text-sm text-slate-400">
                Great for file uploads, data processing, or multi-step operations
              </p>
            </CardContent>
          </Card>

          {/* Inline Loading */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Inline Loading</CardTitle>
              <CardDescription className="text-slate-300">
                Compact loading indicator for smaller spaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InlineLoading message="Processing your request..." />
            </CardContent>
          </Card>

          {/* Custom Message */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Custom Messages</CardTitle>
              <CardDescription className="text-slate-300">
                Loading screens with custom text and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button 
                  onClick={() => setShowFullScreen(true)}
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  "Connecting to voice servers..."
                </Button>
                <Button 
                  onClick={() => setShowFullScreen(true)}
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  "Training your AI agent..."
                </Button>
                <Button 
                  onClick={() => setShowFullScreen(true)}
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  "Setting up phone number..."
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Loading Screen Features</CardTitle>
            <CardDescription className="text-slate-300">
              What makes our loading screens special
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
                </div>
                <h3 className="font-semibold text-white">Animated Elements</h3>
                <p className="text-sm text-slate-400">
                  Smooth animations and transitions that keep users engaged
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-spin" />
                </div>
                <h3 className="font-semibold text-white">Voice Themed</h3>
                <p className="text-sm text-slate-400">
                  Designed specifically for AI voice agent applications
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" />
                </div>
                <h3 className="font-semibold text-white">Responsive</h3>
                <p className="text-sm text-slate-400">
                  Works perfectly on all screen sizes and devices
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Screen Loading Overlay */}
      {showFullScreen && (
        <FullScreenLoading 
          message="Initializing your AI voice agent..." 
          showProgress={false}
        />
      )}

      {/* Progress Loading Overlay */}
      {showProgress && (
        <FullScreenLoading 
          message="Processing your request..." 
          showProgress={true}
          progress={progress}
        />
      )}
    </div>
  );
} 
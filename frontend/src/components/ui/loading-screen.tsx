"use client";

import { useState, useEffect } from "react";
import { Brain, Mic, Phone, Sparkles } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export function LoadingScreen({ 
  message = "Initializing AI Voice Agent...", 
  showProgress = false,
  progress = 0 
}: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [waveAmplitude, setWaveAmplitude] = useState(0.3);

  const steps = [
    "Initializing neural networks...",
    "Loading voice recognition...",
    "Connecting to telephony...",
    "Calibrating audio systems...",
    "Ready to take calls!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [steps.length]);

  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaveAmplitude(Math.random() * 0.8 + 0.2);
    }, 100);

    return () => clearInterval(waveInterval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Logo and main icon */}
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Brain className="w-12 h-12 text-white" />
          </div>
          
          {/* Orbiting elements */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-blue-400 rounded-full opacity-60" />
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <div className="w-3 h-3 bg-purple-400 rounded-full opacity-60" />
            </div>
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-green-400 rounded-full opacity-60" />
            </div>
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-pink-400 rounded-full opacity-60" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Voice Agent
          </h1>
          <p className="text-slate-400 text-lg">Your intelligent call assistant</p>
        </div>

        {/* Voice wave animation */}
        <div className="flex items-center justify-center space-x-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-pulse"
              style={{
                height: `${(Math.sin(i * 0.5 + Date.now() * 0.01) * 20 + 30) * waveAmplitude}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>

        {/* Loading message */}
        <div className="space-y-2">
          <p className="text-slate-300 text-lg font-medium">
            {steps[currentStep]}
          </p>
          {message && (
            <p className="text-slate-400 text-sm">{message}</p>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="w-64 mx-auto space-y-2">
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm">{Math.round(progress)}%</p>
          </div>
        )}

        {/* Feature icons */}
        <div className="flex justify-center space-x-8 pt-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <Mic className="w-4 h-4" />
            <span className="text-sm">Voice Recognition</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Phone className="w-4 h-4" />
            <span className="text-sm">24/7 Support</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">AI Powered</span>
          </div>
        </div>
      </div>

      {/* Bottom wave effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
    </div>
  );
}

// Full screen loading component
export function FullScreenLoading({ 
  message, 
  showProgress = false, 
  progress = 0 
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50">
      <LoadingScreen 
        message={message} 
        showProgress={showProgress} 
        progress={progress} 
      />
    </div>
  );
}

// Inline loading component for smaller spaces
export function InlineLoading({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center space-x-3 p-8">
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-1 h-1 bg-blue-400 rounded-full opacity-60" />
          </div>
        </div>
      </div>
      <div className="text-slate-300">
        <p className="font-medium">{message || "Loading..."}</p>
      </div>
    </div>
  );
} 
"use client";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Phone,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  MessageSquare,
  BarChart3,
  Mic,
  Clock,
  Brain,
  Upload,
  Quote,
  X,
  Send,
} from "lucide-react";

interface FloatingOrbProps {
  delay?: number;
  size?: number;
  color?: "blue" | "purple" | "pink";
}

const FloatingOrb: React.FC<FloatingOrbProps> = ({
  delay = 0,
  size = 100,
  color = "blue",
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    const animate = () => {
      setPosition({
        x: Math.sin(Date.now() * 0.001 + delay) * 50 + scrollY * 0.1,
        y: Math.cos(Date.now() * 0.0015 + delay) * 30 + scrollY * 0.05,
      });
    };

    const interval = setInterval(animate, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [delay, scrollY]);

  return (
    <div
      className={`absolute rounded-full opacity-20 blur-xl transition-all duration-1000 ${
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
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <Card
      ref={cardRef}
      className={`group relative overflow-hidden border-0 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl hover:from-slate-800/60 hover:to-slate-700/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-8 relative z-10">
        <div className="mb-4 relative">
          <Icon className="w-12 h-12 text-blue-400 group-hover:text-blue-300 transition-colors duration-300 group-hover:scale-110 transform" />
          <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors">
          {title}
        </h3>
        <p className="text-slate-300 group-hover:text-slate-200 transition-colors">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

interface StatsCounterProps {
  end: number;
  label: string;
  duration?: number;
}

const StatsCounter: React.FC<StatsCounterProps> = ({
  end,
  label,
  duration = 2000,
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          let start = 0;
          const increment = end / (duration / 50);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 50);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, isVisible]);

  return (
    <div ref={counterRef} className="text-center">
      <div className="text-4xl font-bold text-white mb-2">
        {count.toLocaleString()}+
      </div>
      <div className="text-slate-400">{label}</div>
    </div>
  );
};

interface CallFlowStepProps {
  step: number;
  title: string;
  description: string;
  isActive: boolean;
}

const CallFlowStep: React.FC<CallFlowStepProps> = ({
  step,
  title,
  description,
  isActive,
}) => (
  <div
    className={`flex items-start space-x-4 p-6 rounded-xl transition-all duration-500 ${
      isActive
        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 scale-105"
        : "bg-slate-800/30"
    }`}
  >
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
        isActive
          ? "bg-blue-500 text-white animate-pulse"
          : "bg-slate-600 text-slate-300"
      }`}
    >
      {step}
    </div>
    <div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  </div>
);

const TypewriterText: React.FC<{ text: string; delay?: number }> = ({
  text,
  delay = 0,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }
    }, delay + currentIndex * 100);

    return () => clearTimeout(timer);
  }, [currentIndex, text, delay]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const SoundWave: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-blue-400 rounded-full animate-pulse"
          style={{
            height: `${Math.random() * 20 + 10}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: "0.8s",
          }}
        />
      ))}
    </div>
  );
};

const TestimonialCard: React.FC<{
  name: string;
  company: string;
  text: string;
  isActive: boolean;
}> = ({ name, company, text, isActive }) => (
  <div
    className={`transition-all duration-500 ${
      isActive ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute"
    }`}
  >
    <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
      <CardContent className="p-8">
        <Quote className="w-8 h-8 text-blue-400 mb-4" />
        <p className="text-slate-300 mb-6 text-lg italic">"{text}"</p>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {name[0]}
          </div>
          <div>
            <div className="text-white font-semibold">{name}</div>
            <div className="text-slate-400 text-sm">{company}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const PricingCard: React.FC<{
  title: string;
  price: string;
  features: string[];
  popular?: boolean;
}> = ({ title, price, features, popular = false }) => (
  <Card
    className={`relative bg-slate-800/50 backdrop-blur border-slate-700 hover:bg-slate-800/70 transition-all duration-300 ${
      popular ? "border-blue-500 scale-105" : ""
    }`}
  >
    {popular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          Most Popular
        </Badge>
      </div>
    )}
    <CardContent className="p-8">
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <div className="text-4xl font-bold text-blue-400 mb-6">
        {price}
        <span className="text-lg text-slate-400">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-slate-300">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            {feature}
          </li>
        ))}
      </ul>
      <a href="/auth/login">
        <Button
          className={`w-full ${
            popular
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              : "bg-slate-700 hover:bg-slate-600"
          } text-white`}
        >
          Get Started
        </Button>
      </a>
    </CardContent>
  </Card>
);

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="w-80 h-96 mb-4 bg-slate-800/95 backdrop-blur border-slate-700">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-semibold">AI Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 p-4 space-y-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <p className="text-blue-300 text-sm">
                  Hi! I'm your AI assistant. How can I help you today?
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-700">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default function VoiceAILanding() {
  const [email, setEmail] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const callSteps = [
    {
      title: "Customer Calls",
      description: "Incoming calls routed to your AI agent",
    },
    {
      title: "Voice Recognition",
      description: "Real-time speech-to-text transcription",
    },
    {
      title: "AI Processing",
      description: "GPT-4 processes with your business context",
    },
    {
      title: "Intelligent Response",
      description: "Natural voice response to customer",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Bella's Restaurant",
      text: "Our AI agent handles 90% of our reservation calls. It's like having a perfect hostess 24/7!",
    },
    {
      name: "Dr. Michael Chen",
      company: "Downtown Medical",
      text: "Patients love how quickly they get answers. Our AI agent has reduced wait times dramatically.",
    },
    {
      name: "Tom Rodriguez",
      company: "Fix-It Pro Services",
      text: "We never miss a service call anymore. The AI books appointments even when we're on job sites.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % callSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSubmitted(true);
    setTimeout(() => setEmailSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/50 to-slate-950" />
      <FloatingOrb delay={0} size={200} color="blue" />
      <FloatingOrb delay={2} size={150} color="purple" />
      <FloatingOrb delay={4} size={100} color="pink" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Phone className="w-6 h-6 text-white animate-pulse" />
          </div>
          <span className="text-2xl font-bold text-white">VoiceAI</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          {["Features", "Pricing", "Demo", "Support"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-slate-300 hover:text-white transition-colors duration-300 hover:underline decoration-blue-400"
            >
              {item}
            </a>
          ))}
        </nav>
        <a href="/auth/login">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            Start Free Trial
          </Button>
        </a>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center max-w-6xl mx-auto">
        <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 transition-colors">
          <Phone className="w-4 h-4 mr-2" />
          AI-Powered Voice Agents
        </Badge>

        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200 mb-8 leading-tight">
          <TypewriterText text="Never Miss" delay={500} />
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            A Customer Call
          </span>
        </h1>

        <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Deploy intelligent voice AI agents that answer customer calls 24/7,
          handle FAQs, and provide seamless customer service with human-like
          conversations.
        </p>

        <form
          onSubmit={handleEmailSubmit}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <div className="flex bg-slate-800/50 backdrop-blur rounded-full p-2 border border-slate-700">
            <Input
              placeholder="Enter your business email"
              className="bg-transparent border-0 text-white placeholder-slate-400 focus:ring-0 min-w-[300px]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-full px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {emailSubmitted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sent!
                </>
              ) : (
                <>
                  Get Your Agent
                  <ArrowRight
                    className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                      isHovered ? "translate-x-1" : ""
                    }`}
                  />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Call Flow Demo */}
        <div className="relative bg-slate-800/30 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
          <div className="flex justify-center mb-8">
            <Button className="bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30 transition-colors rounded-full">
              <Play className="w-4 h-4 mr-2" />
              Listen to Demo Call
              <SoundWave />
            </Button>
          </div>

          <h3 className="text-2xl font-bold text-white mb-6">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {callSteps.map((step, index) => (
              <CallFlowStep
                key={index}
                step={index + 1}
                title={step.title}
                description={step.description}
                isActive={index === activeStep}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatsCounter end={99.9} label="Uptime %" />
          <StatsCounter end={200} label="Calls/Hour" />
          <StatsCounter end={85} label="Resolution Rate" />
          <StatsCounter end={3} label="Sec Avg Response" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Everything You Need
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Complete voice AI solution with dashboard, analytics, and seamless
            integrations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Mic}
            title="Real-Time Voice Processing"
            description="Advanced speech recognition with natural language understanding and context awareness"
            delay={100}
          />
          <FeatureCard
            icon={Brain}
            title="GPT-4 Intelligence"
            description="Powered by cutting-edge AI for human-like conversations and intelligent responses"
            delay={200}
          />
          <FeatureCard
            icon={Upload}
            title="Custom Knowledge Base"
            description="Upload your FAQs, policies, and business info to train your personalized agent"
            delay={300}
          />
          <FeatureCard
            icon={BarChart3}
            title="Call Analytics Dashboard"
            description="Detailed insights, call logs, transcripts, and performance metrics in real-time"
            delay={400}
          />
          <FeatureCard
            icon={Clock}
            title="24/7 Availability"
            description="Never miss a call with round-the-clock AI agents handling customer inquiries"
            delay={500}
          />
          <FeatureCard
            icon={Phone}
            title="Instant Setup"
            description="Get your dedicated phone number and AI agent configured in under 5 minutes"
            delay={600}
          />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            What Our Customers Say
          </h2>
          <div className="flex justify-center space-x-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
            ))}
            <span className="text-slate-300 ml-2">
              4.9/5 from 500+ businesses
            </span>
          </div>
        </div>

        <div className="relative h-64">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              {...testimonial}
              isActive={index === activeTestimonial}
            />
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-300">
            Choose the plan that fits your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard
            title="Starter"
            price="$29"
            features={[
              "1 AI Voice Agent",
              "100 calls/month",
              "Basic analytics",
              "Email support",
            ]}
          />
          <PricingCard
            title="Professional"
            price="$99"
            features={[
              "3 AI Voice Agents",
              "1,000 calls/month",
              "Advanced analytics",
              "Priority support",
              "Custom knowledge base",
            ]}
            popular={true}
          />
          <PricingCard
            title="Enterprise"
            price="$299"
            features={[
              "Unlimited agents",
              "Unlimited calls",
              "White-label solution",
              "24/7 phone support",
              "Custom integrations",
            ]}
          />
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Perfect For Any Business
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Restaurants",
              description:
                "Handle reservations, takeout orders, and answer menu questions automatically",
              icon: "🍽️",
            },
            {
              title: "Medical Practices",
              description:
                "Schedule appointments, provide office hours, and answer common patient questions",
              icon: "🏥",
            },
            {
              title: "Service Businesses",
              description:
                "Manage booking inquiries, provide quotes, and handle customer service calls",
              icon: "🔧",
            },
          ].map((useCase, index) => (
            <Card
              key={index}
              className="bg-slate-800/50 backdrop-blur border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {useCase.title}
                </h3>
                <p className="text-slate-300">{useCase.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-12 border border-blue-500/30 max-w-4xl mx-auto">
          <Phone className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Customer Service?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Start your free trial today and see how AI voice agents can handle
            your customer calls instantly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth/login">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Phone className="w-5 h-5 mr-2" />
                Get Your AI Agent Now
              </Button>
            </a>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg hover:scale-105 transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Listen to Demo
            </Button>
          </div>

          <div className="mt-8 text-sm text-slate-400">
            <CheckCircle className="w-4 h-4 inline mr-2" />
            No setup fees • 14-day free trial • Cancel anytime
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">VoiceAI</span>
          </div>
          <div className="text-slate-400">
            © 2025 VoiceAI. Revolutionizing customer service.
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

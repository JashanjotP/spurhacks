"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, Building, Bot, Calendar, ShoppingCart } from "lucide-react";
import { supabaseOnboardingService, Business } from "@/lib/supabase/onboarding-service";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);
        const userBusinesses = await supabaseOnboardingService.getUserBusinesses();
        setBusinesses(userBusinesses);
        setError(null);
      } catch (error) {
        console.error('Error loading businesses:', error);
        setError('Failed to load businesses. Please check your authentication.');
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  const getAgentTypeIcon = (agentType: string) => {
    switch (agentType) {
      case "faq":
        return <Bot className="w-5 h-5" />;
      case "booking":
        return <Calendar className="w-5 h-5" />;
      case "order":
        return <ShoppingCart className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const getAgentTypeColor = (agentType: string) => {
    switch (agentType) {
      case "faq":
        return "bg-blue-500";
      case "booking":
        return "bg-green-500";
      case "order":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const deleteBusiness = async (businessId: string) => {
    try {
      const success = await supabaseOnboardingService.deleteBusiness(businessId);
      if (success) {
        setBusinesses(businesses.filter(b => b.id !== businessId));
      } else {
        setError('Failed to delete business');
      }
    } catch (error) {
      console.error('Error deleting business:', error);
      setError('Failed to delete business');
    }
  };

  const exportData = async () => {
    try {
      const data = await supabaseOnboardingService.exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'supabase-onboarding-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-300 mt-4">Loading businesses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-slate-900 border-red-700">
            <CardContent className="p-8 text-center">
              <div className="text-red-400 mb-4">
                <Building className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Error Loading Businesses</h3>
              <p className="text-slate-300 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Businesses</h1>
            <p className="text-slate-300 mt-2">
              Manage your AI voice agents and business configurations
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={exportData}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Export Data
            </Button>
            <Button
              onClick={() => window.location.href = "/dashboard/onboarding"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create New Business
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{businesses.length}</p>
                  <p className="text-sm text-slate-400">Total Businesses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {businesses.filter(b => b.agent_type === "faq").length}
                  </p>
                  <p className="text-sm text-slate-400">FAQ Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {businesses.filter(b => b.agent_type === "booking").length}
                  </p>
                  <p className="text-sm text-slate-400">Booking Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {businesses.filter(b => b.agent_type === "order").length}
                  </p>
                  <p className="text-sm text-slate-400">Order Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Businesses List */}
        {businesses.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-8 text-center">
              <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Businesses Found</h3>
              <p className="text-slate-400 mb-4">
                You haven't completed any onboarding sessions yet.
              </p>
              <Button
                onClick={() => window.location.href = "/dashboard/onboarding"}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Onboarding
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card key={business.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{business.name}</CardTitle>
                      <CardDescription className="text-slate-300">
                        {business.business_type}
                      </CardDescription>
                    </div>
                    <Badge className={`${getAgentTypeColor(business.agent_type)} text-white`}>
                      <div className="flex items-center space-x-1">
                        {getAgentTypeIcon(business.agent_type)}
                        <span className="capitalize">{business.agent_type}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-mono">{business.phone_number}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {business.business_hours.start} - {business.business_hours.end}
                    </span>
                  </div>
                  
                  <div className="text-slate-300">
                    <p className="text-sm">
                      <strong>Business ID:</strong> <span className="font-mono text-blue-400">{business.id}</span>
                    </p>
                  </div>
                  
                  {business.website_url && (
                    <div className="text-slate-300">
                      <p className="text-sm">
                        <strong>Website:</strong> {business.website_url}
                      </p>
                    </div>
                  )}
                  
                  <div className="text-slate-300">
                    <p className="text-sm">
                      <strong>Greeting:</strong> {business.greeting.substring(0, 100)}...
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-xs text-slate-400">
                      Created: {new Date(business.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBusiness(business.id)}
                      className="flex-1 border-red-700 text-red-300 hover:bg-red-900/20"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
"use client";

import { useEffect, useState } from "react";
import { BookingCalendar } from "@/components/dashboard/booking-calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, TrendingUp, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function BookingAgentDashboard() {
  const [businessData, setBusinessData] = useState<{
    id: string;
    phone: string;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchBusinessData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch business data for the current user
        const { data: business, error } = await supabase
          .from('businesses')
          .select('id, phone, name')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching business data:', error);
          // Use default data for demo
          setBusinessData({
            id: 'demo-business-id',
            phone: '+1 (555) 123-4567',
            name: 'Demo Business'
          });
        } else {
          setBusinessData(business);
        }
      } catch (error) {
        console.error('Error:', error);
        // Use default data for demo
        setBusinessData({
          id: 'demo-business-id',
          phone: '+1 (555) 123-4567',
          name: 'Demo Business'
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchBusinessData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading booking dashboard...</p>
        </div>
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Business Found</h2>
          <p className="text-slate-400">Please set up your business profile first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BookingCalendar 
        businessId={businessData.id} 
        businessPhone={businessData.phone} 
      />
    </div>
  );
} 
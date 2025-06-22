"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabaseOnboardingService } from "@/lib/supabase/onboarding-service";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function TestSupabasePage() {
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Test getting businesses
          const userBusinesses = await supabaseOnboardingService.getUserBusinesses();
          setBusinesses(userBusinesses);

          // Test getting sessions
          const currentSession = await supabaseOnboardingService.getCurrentSession();
          setSessions(currentSession ? [currentSession] : []);
        }
      } catch (error) {
        console.error('Error loading test data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase.auth]);

  const runTests = async () => {
    const results: any = {};
    
    try {
      // Test 1: Create session
      results.createSession = await supabaseOnboardingService.createOnboardingSession();
      
      // Test 2: Get current session
      results.getSession = await supabaseOnboardingService.getCurrentSession();
      
      // Test 3: Get user businesses
      results.getBusinesses = await supabaseOnboardingService.getUserBusinesses();
      
      // Test 4: Export data
      results.exportData = await supabaseOnboardingService.exportUserData();
      
      setTestResults(Object.values(results));
    } catch (error) {
      console.error('Test error:', error);
      setError(error instanceof Error ? error.message : 'Test failed');
    }
  };

  const clearTestData = async () => {
    try {
      // This would need to be implemented in the service
      setTestResults([]);
      setBusinesses([]);
      setSessions([]);
    } catch (error) {
      console.error('Error clearing test data:', error);
    }
  };

  const testTemporaryBusinessId = async () => {
    try {
      setTestResults((prev: string[]) => [...prev, "Testing temporary business ID creation..."]);
      
      // Create a test session first
      const sessionId = await supabaseOnboardingService.createOnboardingSession();
      if (!sessionId) {
        setTestResults((prev: string[]) => [...prev, "❌ Failed to create test session"]);
        return;
      }
      
      setTestResults((prev: string[]) => [...prev, `✅ Created test session: ${sessionId}`]);
      
      // Test temporary business ID creation
      const tempBusinessId = await supabaseOnboardingService.createTemporaryBusinessId(
        sessionId,
        "Test Business",
        "Restaurant"
      );
      
      if (tempBusinessId) {
        setTestResults((prev: string[]) => [...prev, `✅ Created temporary business ID: ${tempBusinessId}`]);
      } else {
        setTestResults((prev: string[]) => [...prev, "❌ Failed to create temporary business ID"]);
      }
      
      // Check the session was updated
      const session = await supabaseOnboardingService.getCurrentSession();
      if (session && session.business_id) {
        setTestResults((prev: string[]) => [...prev, `✅ Session updated with business ID: ${session.business_id}`]);
      } else {
        setTestResults((prev: string[]) => [...prev, "❌ Session not updated with business ID"]);
      }
      
    } catch (error) {
      setTestResults((prev: string[]) => [...prev, `❌ Error: ${error}`]);
    }
  };

  const testOnboardingSessionsTable = async () => {
    try {
      setTestResults((prev: string[]) => [...prev, "Testing onboarding_sessions table structure..."]);
      
      const { data, error } = await supabase
        .from('onboarding_sessions')
        .select('*')
        .limit(1);
      
      if (error) {
        setTestResults((prev: string[]) => [...prev, `❌ Error querying table: ${error.message}`]);
        return;
      }
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        setTestResults((prev: string[]) => [...prev, `✅ Table structure: ${columns.join(', ')}`]);
        
        // Check if business_id column exists
        if (columns.includes('business_id')) {
          setTestResults((prev: string[]) => [...prev, "✅ business_id column exists"]);
        } else {
          setTestResults((prev: string[]) => [...prev, "❌ business_id column missing"]);
        }
      } else {
        setTestResults((prev: string[]) => [...prev, "ℹ️ No data in table, but table exists"]);
      }
      
    } catch (error) {
      setTestResults((prev: string[]) => [...prev, `❌ Error: ${error}`]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-300 mt-4">Loading test data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Supabase Integration Test</h1>
          <p className="text-slate-300 mt-2">
            Test various Supabase functionality and database operations
          </p>
        </div>

        {/* Connection Status */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-slate-300">
                Authentication: {user ? 'Connected' : 'Not connected'}
              </span>
            </div>
            {user && (
              <div className="text-slate-300">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
            )}
            {error && (
              <div className="text-red-400">
                <strong>Error:</strong> {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Test Controls</CardTitle>
            <CardDescription className="text-slate-300">
              Run tests to verify Supabase functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button
                onClick={runTests}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!user}
              >
                Run Tests
              </Button>
              <Button
                onClick={clearTestData}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    <span className={result.startsWith('✅') ? 'text-green-400' : result.startsWith('❌') ? 'text-red-400' : result.startsWith('ℹ️') ? 'text-blue-400' : 'text-slate-300'}>
                      {result}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Businesses */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">User Businesses</CardTitle>
              <CardDescription className="text-slate-300">
                {businesses.length} business(es) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {businesses.length === 0 ? (
                <p className="text-slate-400">No businesses found</p>
              ) : (
                <div className="space-y-2">
                  {businesses.map((business) => (
                    <div key={business.id} className="p-3 bg-slate-800 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{business.name}</p>
                          <p className="text-slate-400 text-sm">{business.business_type}</p>
                          <p className="text-blue-400 text-xs font-mono">ID: {business.id}</p>
                        </div>
                        <Badge className="bg-blue-600">{business.agent_type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Onboarding Sessions</CardTitle>
              <CardDescription className="text-slate-300">
                {sessions.length} session(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-slate-400">No sessions found</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div key={session.id} className="p-3 bg-slate-800 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">Session {session.id.slice(0, 8)}...</p>
                          <p className="text-slate-400 text-sm">
                            Step: {session.current_step} | Completed: {session.completed ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <Badge className={session.completed ? 'bg-green-600' : 'bg-yellow-600'}>
                          {session.completed ? 'Complete' : 'In Progress'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Database Schema Info */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Database Schema</CardTitle>
            <CardDescription className="text-slate-300">
              Tables and their purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-white font-medium">Core Tables</h4>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• <strong>businesses</strong> - Business information</li>
                  <li>• <strong>onboarding_sessions</strong> - Onboarding progress</li>
                  <li>• <strong>documents</strong> - Knowledge base files</li>
                  <li>• <strong>document_chunks</strong> - Document chunks with embeddings</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-medium">Features</h4>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• Row Level Security (RLS) enabled</li>
                  <li>• Vector search capabilities</li>
                  <li>• Automatic timestamps</li>
                  <li>• Foreign key relationships</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={testTemporaryBusinessId} className="bg-red-600 hover:bg-red-700">
            Test Temp Business ID
          </Button>
          <Button onClick={testOnboardingSessionsTable} className="bg-yellow-600 hover:bg-yellow-700">
            Test Table Structure
          </Button>
        </div>
      </div>
    </div>
  );
} 
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { stats } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your AI voice agents and call analytics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your AI voice agents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Create Your First Agent</h4>
              <p className="text-sm text-muted-foreground">
                Set up an AI voice agent to handle customer calls automatically.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Configure Knowledge Base</h4>
              <p className="text-sm text-muted-foreground">
                Add your business information and FAQs to train your agent.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Test Your Agent</h4>
              <p className="text-sm text-muted-foreground">
                Make test calls to ensure your agent responds correctly.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest calls and agent updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">127 calls received in the last 30 days</p>
              <p className="text-sm text-muted-foreground">
                Average call duration: 2:15
              </p>
              <p className="text-sm text-muted-foreground">
                Most active agent: Customer Support Bot
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

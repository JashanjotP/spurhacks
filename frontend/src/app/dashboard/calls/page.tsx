import { CallLogsTable } from "@/components/dashboard/call-logs-table"

export default function CallsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Call Logs</h1>
        <p className="text-muted-foreground">View and analyze your AI agent call history</p>
      </div>

      <CallLogsTable />
    </div>
  )
}

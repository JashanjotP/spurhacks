"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Phone, Clock, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Mock data
const mockCallLogs = [
  {
    id: "1",
    agent_name: "Customer Support Bot",
    caller_phone: "+1 (555) 123-4567",
    duration: 125,
    transcript: "Hello, I need help with my order. Can you tell me the status?",
    ai_response: "I'd be happy to help you with your order status. Could you please provide me with your order number?",
    status: "completed",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    agent_name: "Sales Assistant",
    caller_phone: "+1 (555) 987-6543",
    duration: 89,
    transcript: "What are your business hours?",
    ai_response:
      "Our business hours are Monday through Friday, 9 AM to 6 PM EST. We're closed on weekends and major holidays.",
    status: "completed",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    agent_name: "Technical Support",
    caller_phone: "+1 (555) 456-7890",
    duration: 203,
    transcript: "I'm having trouble logging into my account.",
    ai_response:
      "I understand you're having trouble logging in. Let me help you troubleshoot this issue. First, can you confirm the email address associated with your account?",
    status: "completed",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
]

export function CallLogsTable() {
  const [selectedCall, setSelectedCall] = useState<any>(null)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "failed":
        return "destructive"
      case "in-progress":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Call Logs
        </CardTitle>
        <CardDescription>Recent calls to your AI voice agents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Caller</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCallLogs.map((call) => (
                <TableRow key={call.id}>
                  <TableCell className="font-medium">{call.agent_name}</TableCell>
                  <TableCell>{call.caller_phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(call.duration)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(call.status)}>{call.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCall(call)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Call Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Agent</Label>
                              <p className="text-sm text-muted-foreground">{call.agent_name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Caller</Label>
                              <p className="text-sm text-muted-foreground">{call.caller_phone}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Duration</Label>
                              <p className="text-sm text-muted-foreground">{formatDuration(call.duration)}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Status</Label>
                              <Badge variant={getStatusColor(call.status)}>{call.status}</Badge>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Transcript</Label>
                            <ScrollArea className="h-32 w-full rounded-md border p-3 mt-2">
                              <p className="text-sm">{call.transcript}</p>
                            </ScrollArea>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">AI Response</Label>
                            <ScrollArea className="h-32 w-full rounded-md border p-3 mt-2">
                              <p className="text-sm">{call.ai_response}</p>
                            </ScrollArea>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

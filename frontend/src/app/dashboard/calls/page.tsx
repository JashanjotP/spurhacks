"use client"

import { CallLogsTable } from "@/components/dashboard/call-logs-table"
import { Phone } from "lucide-react"

export default function CallsPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Phone className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
            Call Logs
          </h1>
        </div>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          View and analyze your AI agent call history with detailed insights and analytics.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <CallLogsTable />
      </div>
    </div>
  )
}

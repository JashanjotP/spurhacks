import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-950">
        <DashboardSidebar />
        <SidebarInset className="flex-1 overflow-y-auto bg-transparent">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

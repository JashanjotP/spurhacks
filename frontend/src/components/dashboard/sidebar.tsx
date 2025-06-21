"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bot, Phone, Settings, BarChart3, LogOut, User, Grid3X3, Brain } from "lucide-react"

const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    // description: "Overview & analytics"
  },
  {
    title: "Portals",
    href: "/dashboard/portals",
    icon: Grid3X3,
    // description: "AI agent portals"
  },
  {
    title: "Agents",
    href: "/dashboard/agents",
    icon: Bot,
    // description: "Manage AI agents"
  },
  {
    title: "Call Logs",
    href: "/dashboard/calls",
    icon: Phone,
    // description: "Call history & insights"
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    // description: "Configuration"
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = () => {
    router.push("/")
  }

  return (
    <Sidebar className="dark bg-slate-950 text-white border-r border-slate-800">
      <SidebarHeader className="border-b border-slate-800">
        <div className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AI Voice Agent</h1>
            <p className="text-xs text-slate-400">Dashboard v2.0</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href} className="mb-1">
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`group w-full rounded-lg transition-colors duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Link href={item.href} className="flex items-center gap-4 p-3">
                        <div className={`p-2 rounded-lg ${isActive ? "" : "bg-slate-800 group-hover:bg-slate-700"}`}>
                          <item.icon className={`h-5 w-5 transition-colors duration-200 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{item.title}</p>
                          {/* <p className={`text-xs transition-colors duration-200 ${isActive ? "text-purple-200" : "text-slate-400"}`}>{item.description}</p> */}
                        </div>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Active Agents</span>
              <span className="font-bold text-white">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Total Calls</span>
              <span className="font-bold text-white">7.4k</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Portals</span>
              <span className="font-bold text-white">10</span>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-800 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-slate-300" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white truncate">demo@example.com</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem className="mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut} 
              className="w-full justify-start gap-2 px-3 text-slate-300 hover:text-red-400 hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

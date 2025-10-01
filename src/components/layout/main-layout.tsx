"use client"

import { SidebarNav } from "./sidebar-nav"
import { Header } from "./header"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={handleCloseSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col border-r border-border bg-card/50 backdrop-blur-sm">
          <SidebarNav onItemClick={handleCloseSidebar} />
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
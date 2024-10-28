'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Loader2, CheckCircle, AlertTriangle, Zap, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"


interface HeaderProps {
  apiHealth: 'healthy' | 'unhealthy' | 'unknown'
}

export function Header({ apiHealth}: HeaderProps) {
  
  const pathname = usePathname()

  return (
    <div className="flex justify-between items-center mb-6 p-4 bg-background border-b">
      <div className="flex items-center ">
        <h1 className="text-3xl font-bold hidden md:block">Flux-EasyAPI</h1>
        <nav className="flex items-center space-x-4">
          <Link href="/" passHref>
            <Button
              variant="ghost"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60"
              )}
            >
              <Zap className="h-4 w-4" />
              Generate
            </Button>
          </Link>
          <Link href="/settings" passHref>
            <Button
              variant="ghost"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/settings" ? "text-foreground" : "text-foreground/60"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">API Status:</span>
          {apiHealth === 'unknown' ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          ) : apiHealth === 'healthy' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
        </div>
      </div>
    </div>
  )
}
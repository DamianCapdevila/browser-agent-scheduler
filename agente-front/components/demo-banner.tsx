"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function DemoBanner() {
  return (
    <Alert className="mb-8 border-yellow-500 bg-yellow-500/10">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-1" />
        <AlertDescription className="text-yellow-600">
          This is a demo version with mock data. For full functionality, please{" "}
          <a
            href="https://github.com/DamianCapdevila/browser-agent-scheduler#local-setup"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-yellow-500 hover:text-yellow-600 underline underline-offset-4"
          >
            run the project locally
          </a>
          .
        </AlertDescription>
      </div>
    </Alert>
  )
} 
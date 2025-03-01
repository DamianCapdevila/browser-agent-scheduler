"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Github, Terminal, Chrome, ChevronDown } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function SetupInstructions() {
  const [isOpen, setIsOpen] = useState(true)

  // Load the saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem("setupInstructionsOpen")
    if (savedState !== null) {
      setIsOpen(savedState === "true")
    }
  }, [])

  // Save the state when it changes
  const handleToggle = (open: boolean) => {
    setIsOpen(open)
    localStorage.setItem("setupInstructionsOpen", open.toString())
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleToggle}
      className="w-full rounded-lg border bg-card text-card-foreground shadow-sm pb-2 pt-2"
    >
      <div className="px-4 sm:px-6 py-4">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 hover:bg-transparent"
          >
            <div className="flex flex-col items-start space-y-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-semibold leading-none tracking-tight">Local Setup Instructions</h3>
              <p className="text-sm text-muted-foreground break-words line-clamp-2 w-full pr-6">
                Follow these steps to run the Browser Agent Scheduler locally
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center text-base">
                <Github className="mr-2 h-4 w-4" />
                1. Clone the Repository
              </h4>
              <div className="relative">
                <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto scrollbar-thin">
                  <code>git clone https://github.com/DamianCapdevila/browser-agent-scheduler.git</code>
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center text-base">
                <Terminal className="mr-2 h-4 w-4" />
                2. Start the Backend
              </h4>
              <div className="space-y-2">
                <div className="relative">
                  <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto scrollbar-thin">
                    <code>cd agente/agente-back{"\n"}# Install dependencies using uv{"\n"}uv pip install -r pyproject.toml{"\n"}# Run the Flask server{"\n"}uv run agente.py</code>
                  </pre>
                </div>
                <p className="text-sm text-muted-foreground">
                  The backend will start on http://localhost:5000
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center text-base">
                <Chrome className="mr-2 h-4 w-4" />
                3. Start the Frontend
              </h4>
              <div className="space-y-2">
                <div className="relative">
                  <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto scrollbar-thin">
                    <code>cd agente/agente-front{"\n"}pnpm install{"\n"}pnpm dev</code>
                  </pre>
                </div>
                <p className="text-sm text-muted-foreground">
                  The frontend will start on http://localhost:3000
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-3 sm:p-4">
            <p className="text-sm font-medium mb-2">Requirements:</p>
            <p className="text-sm text-muted-foreground">
              Python 3.8 or higher, uv package manager (<code className="text-xs bg-background px-1.5 py-0.5 rounded">pip install uv</code>), Node.js 18 or higher, pnpm package manager, Git
            </p>
          </div>

          <div className="border border-primary/20 bg-primary/5 p-4 sm:p-6 rounded-lg">
            <h4 className="font-semibold text-primary mb-2 text-base">Having trouble running this?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              I&apos;m here to help! Don&apos;t hesitate to reach out:
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://linkedin.com/in/damiancapdevila"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
              >
                <Github className="mr-2 h-4 w-4" />
                LinkedIn
              </a>
              <a
                href="mailto:contact@damiancapdevila.com"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
              >
                <Terminal className="mr-2 h-4 w-4" />
                Email
              </a>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
} 
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
      className="rounded-lg border bg-card text-card-foreground shadow-sm"
    >
      <div className="p-6">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 hover:bg-transparent"
          >
            <div className="flex flex-col items-start space-y-1.5">
              <h3 className="text-2xl font-semibold">Local Setup Instructions</h3>
              <p className="text-sm text-muted-foreground text-left">
                Follow these steps to run the Browser Agent Scheduler locally
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Github className="mr-2 h-4 w-4" />
                1. Clone the Repository
              </h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>git clone https://github.com/DamianCapdevila/agente.git</code>
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Terminal className="mr-2 h-4 w-4" />
                2. Start the Backend
              </h4>
              <div className="space-y-2">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>cd agente/agente-back{"\n"}# Install dependencies using uv{"\n"}uv pip install -r pyproject.toml{"\n"}# Run the Flask server{"\n"}uv run agente.py</code>
                </pre>
                <p className="text-sm text-muted-foreground">
                  The backend will start on http://localhost:5000
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Chrome className="mr-2 h-4 w-4" />
                3. Start the Frontend
              </h4>
              <div className="space-y-2">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>cd agente/agente-front{"\n"}pnpm install{"\n"}pnpm dev</code>
                </pre>
                <p className="text-sm text-muted-foreground">
                  The frontend will start on http://localhost:3000
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">Requirements:</p>
            <p className="text-sm text-muted-foreground mt-2">
              Python 3.8 or higher, uv package manager (<code className="text-xs bg-background px-1 py-0.5 rounded">pip install uv</code>), Node.js 18 or higher, pnpm package manager, Git
            </p>
          </div>

          <div className="border border-primary/20 bg-primary/5 p-6 rounded-lg text-center">
            <h4 className="font-semibold text-primary mb-2">Having trouble running this?</h4>
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
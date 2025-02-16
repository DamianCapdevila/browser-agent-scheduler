"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Hammer } from "lucide-react"

interface ResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result?: string
  error?: string
  task: string
}

export function ResultDialog({
  open,
  onOpenChange,
  result,
  error,
  task
}: ResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Task Result
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Task</h3>
            <div className="flex items-center space-x-3">
              <Hammer className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">{task}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {error ? 'Error' : 'Result'}
            </h3>
            <div className={`p-4 rounded-lg ${error ? 'bg-destructive/10' : 'bg-muted'}`}>
              <p className={`text-sm whitespace-pre-wrap ${error ? 'text-destructive' : ''}`}>
                {error || result}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
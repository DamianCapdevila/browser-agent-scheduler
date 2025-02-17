"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Clock, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Task } from "@/app/types/task"
import { getStoredApiKey, saveApiKey, clearApiKey, checkApiKey } from "@/lib/api-key"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: Task) => void
  initialTask?: Task
}

export function TaskDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialTask 
}: TaskDialogProps) {
  const [apiKey, setApiKey] = useState("")
  const [task, setTask] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState("")
  const timeInputRef = useRef<HTMLInputElement>(null)
  const [hasStoredKey, setHasStoredKey] = useState(false)

  // Load stored API key on component mount
  useEffect(() => {
    setHasStoredKey(checkApiKey())
  }, [])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (initialTask) {
        setTask(initialTask.task)
        setApiKey(initialTask.apiKey)
        try {
          console.log("Initial task:", initialTask)
          const dateStr = initialTask.scheduledTime
          console.log("Initial scheduled time:", dateStr)
          
          let date: Date | null = null
          
          // Try different date parsing approaches
          if (dateStr) {
            // First try direct Date parsing
            date = new Date(dateStr)
            
            // If that fails, try manual parsing
            if (isNaN(date.getTime())) {
              const [datePart, timePart] = dateStr.split(/[T ]/)
              const [year, month, day] = datePart.split('-').map(Number)
              const [hours, minutes] = timePart.split(':').map(Number)
              
              date = new Date(year, month - 1, day, hours, minutes)
            }
          }
          
          // Validate the parsed date
          if (!date || isNaN(date.getTime())) {
            console.log("Invalid date, using current time")
            date = new Date()
          }
          
          console.log("Final parsed date:", date)
          setScheduledDate(date)
          
          const hours = date.getHours().toString().padStart(2, '0')
          const minutes = date.getMinutes().toString().padStart(2, '0')
          setScheduledTime(`${hours}:${minutes}`)
          
        } catch (error) {
          console.error("Error parsing date:", error)
          const now = new Date()
          setScheduledDate(now)
          const hours = now.getHours().toString().padStart(2, '0')
          const minutes = now.getMinutes().toString().padStart(2, '0')
          setScheduledTime(`${hours}:${minutes}`)
        }
      } else {
        setTask("")
        setScheduledDate(undefined)
        setScheduledTime("")
      }
      setError(null)
      setIsLoading(false)
    }
  }, [open, initialTask])

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value)
  }

  const handleApiKeySave = () => {
    if (apiKey) {
      saveApiKey(apiKey)
      setHasStoredKey(true)
      setApiKey("")
    }
  }

  const handleApiKeyEdit = () => {
    const storedKey = getStoredApiKey()
    if (storedKey) {
      setApiKey(storedKey)
      setHasStoredKey(false)
    }
  }

  const handleApiKeyDelete = () => {
    clearApiKey()
    setHasStoredKey(false)
    setApiKey("")
  }

  const handleDateSelect = (date: Date | undefined) => {
    setScheduledDate(date)
    if (date) {
      setTimeout(() => {
        timeInputRef.current?.focus()
      }, 100)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!scheduledDate) {
        throw new Error("Please select a date")
      }
      if (!scheduledTime) {
        throw new Error("Please select a time")
      }
      
      const storedApiKey = getStoredApiKey()
      if (!storedApiKey && !apiKey) {
        throw new Error("Please enter your API key")
      }
      if (!task) {
        throw new Error("Please enter a task description")
      }

      const [hours, minutes] = scheduledTime.split(":").map(Number)
      const scheduledDateTime = new Date(scheduledDate)
      scheduledDateTime.setHours(hours, minutes, 0, 0) // Set seconds and milliseconds to 0

      if (scheduledDateTime <= new Date()) {
        throw new Error("Scheduled time must be in the future")
      }

      const newTask: Task = {
        id: initialTask?.id || crypto.randomUUID(),
        apiKey: storedApiKey || apiKey,
        task,
        scheduledTime: scheduledDateTime.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: 'scheduled'
      }

      await onSubmit(newTask)
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        typeof err === 'string' ? err : 
        "An unexpected error occurred while scheduling the task"
      setError(errorMessage)
      console.error('Task scheduling error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialTask ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!hasStoredKey ? (
            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  type="password"
                  placeholder="sk-..."
                />
                <Button onClick={handleApiKeySave} disabled={!apiKey}>
                  Save
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Your API key will be stored in your browser&apos;s local storage. You can edit or delete it at any time.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">OpenAI API key stored in your browser.</span>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={handleApiKeyEdit}>
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleApiKeyDelete}
                  className="text-red-500 hover:text-red-500 hover:border-red-500"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Task for the Agent</h3>
            <Textarea
              placeholder="Whatever you want!"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-[1fr,auto] gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        date.setHours(0, 0, 0, 0)
                        return date < today
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 min-w-[140px]">
                <Label className="text-sm font-semibold">Time</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full"
                    disabled={isLoading}
                    ref={timeInputRef}
                  />
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading || !scheduledDate || !scheduledTime || (!hasStoredKey && !apiKey) || !task}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialTask ? "Updating..." : "Scheduling..."}
              </>
            ) : (
              initialTask ? "Update Task" : "Schedule Task"
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
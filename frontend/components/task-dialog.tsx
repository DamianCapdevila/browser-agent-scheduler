"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Task, TaskStatus } from "@/app/types/task"
import { createTask, updateTask } from '@/lib/task-service'
import { supabase } from "@/lib/supabaseClient"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: Task) => void
  initialTask?: Task
  onSettingsClick?: () => void
  hasApiKey: boolean
}

export function TaskDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialTask,
  onSettingsClick,
  hasApiKey
}: TaskDialogProps) {
  const [task, setTask] = useState(initialTask?.task || "")
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    initialTask?.scheduled_time ? new Date(initialTask.scheduled_time) : new Date()
  )
  const [scheduledTime, setScheduledTime] = useState(
    initialTask?.scheduled_time 
      ? format(new Date(initialTask.scheduled_time), "HH:mm") 
      : format(new Date(new Date().getTime() + 15 * 60000), "HH:mm")
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const timeInputRef = useRef<HTMLInputElement>(null)

  // Load user on component mount
  useEffect(() => {
    if (open) {
      fetchUser()
    }
  }, [open])
  
  const fetchUser = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    } catch (err) {
      console.error('Error fetching user:', err)
    }
  }

  // Reset form when dialog opens/closes or when initialTask changes
  useEffect(() => {
    if (initialTask) {
      setTask(initialTask.task)
      
      if (initialTask.scheduled_time) {
        const date = new Date(initialTask.scheduled_time)
        setScheduledDate(date)
        setScheduledTime(format(date, "HH:mm"))
      }
    } else {
      setTask("")
      setScheduledDate(new Date())
      setScheduledTime(format(new Date(new Date().getTime() + 15 * 60000), "HH:mm"))
    }
    
    setError(null)
  }, [initialTask, open])

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
      
      // Check for API key
      if (!hasApiKey) {
        throw new Error("Please configure your OpenAI API key in settings")
      }
      
      if (!task) {
        throw new Error("Please enter a task description")
      }

      if (!userId) {
        throw new Error("You must be signed in to create tasks")
      }

      const [hours, minutes] = scheduledTime.split(":").map(Number)
      const scheduledDateTime = new Date(scheduledDate)
      scheduledDateTime.setHours(hours, minutes, 0, 0)

      if (scheduledDateTime <= new Date()) {
        throw new Error("Scheduled time must be in the future")
      }

      const taskData = {
        id: initialTask?.id || crypto.randomUUID(),
        task,
        scheduled_time: scheduledDateTime.toISOString(),
        timezone: 'UTC',
        status: 'scheduled' as TaskStatus,
        user_id: userId
      }

      if (initialTask) {
        await updateTask(taskData)
      } else {
        await createTask(taskData)
      }
      
      onOpenChange(false)
      onSubmit(taskData)
    } catch (err) {
      console.error('Task scheduling error:', err)
      const errorMessage = err instanceof Error ? err.message : 
        typeof err === 'string' ? err : 
        "An unexpected error occurred while scheduling the task"
      setError(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialTask ? "Edit Task" : "New Task"}</DialogTitle>
          <DialogDescription>
            Schedule a task to be executed by the browser agent.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!hasApiKey ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>OpenAI API Key</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSettingsClick}
                >
                  Settings
                </Button>
              </div>
              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-800" />
                <AlertDescription>
                  Please configure your OpenAI API key in settings before creating a task.
                </AlertDescription>
              </Alert>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="task">Task for the Agent</Label>
            <Textarea
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Tell the browser agent what to do..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-4">
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
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0" 
                    align="start"
                    side="bottom"
                    sideOffset={4}
                    alignOffset={0}
                    avoidCollisions={false}
                  >
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        date.setHours(0, 0, 0, 0)
                        return date < today
                      }}
                      className="rounded-md border shadow-sm"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Time</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full min-w-[120px]"
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
            disabled={isLoading || !scheduledDate || !scheduledTime || !task}
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
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { CalendarIcon, Clock, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export default function Home() {
  const [apiKey, setApiKey] = useState("")
  const [task, setTask] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState("")
  const [jobId, setJobId] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const timeInputRef = useRef<HTMLInputElement>(null)

  const handleDateSelect = (date: Date | undefined) => {
    setScheduledDate(date)
    // Focus the time input after date selection
    if (date) {
      setTimeout(() => {
        timeInputRef.current?.focus()
      }, 100)
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollTaskStatus = async () => {
      if (!jobId || !isPolling) return;

      try {
        const response = await fetch(`http://localhost:5000/task-status/${jobId}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          setIsPolling(false);
          setJobId(null);
          setIsLoading(false);
          return;
        }

        switch (data.status) {
          case 'scheduled':
            setResult(`Task scheduled for ${data.scheduled_time}`);
            setIsLoading(false);
            break;
          case 'running':
            setResult('Task is currently running...');
            setIsLoading(true);
            break;
          case 'completed':
            setResult(data.result);
            setIsPolling(false);
            setJobId(null);
            setIsLoading(false);
            break;
          case 'failed':
            setError(data.error);
            setIsPolling(false);
            setJobId(null);
            setIsLoading(false);
            break;
        }
      } catch (err) {
        setError('Failed to check task status');
        setIsPolling(false);
        setJobId(null);
        setIsLoading(false);
      }
    };

    if (isPolling && jobId) {
      intervalId = setInterval(pollTaskStatus, 3000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId, isPolling]);

  const handleSubmit = async () => {
    setIsLoading(true)
    setResult(null)
    setError(null)
    setJobId(null)

    try {
      let scheduledDateTime = null
      if (isScheduled && scheduledDate && scheduledTime) {
        const [hours, minutes] = scheduledTime.split(":").map(Number)
        scheduledDateTime = new Date(scheduledDate)
        scheduledDateTime.setHours(hours, minutes)

        if (scheduledDateTime <= new Date()) {
          throw new Error("Scheduled time must be in the future")
        }
      }

      const endpoint = isScheduled ? "http://localhost:5000/schedule" : "http://localhost:5000/run"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          task: task,
          scheduled_time: scheduledDateTime?.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      if (isScheduled) {
        setResult(data.message)
        setJobId(data.job_id)
        setIsPolling(true)
        setIsLoading(false)
      } else {
        setResult(data.result)
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <main className="container mx-auto p-4 max-w-md">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Browser Agent Scheduler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">OpenAI API Key</h3>
            <Input
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Task</h3>
            <Textarea
              placeholder="Whatever you want!"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="schedule"
              checked={isScheduled}
              onCheckedChange={setIsScheduled}
              disabled={isLoading}
            />
            <Label htmlFor="schedule">Schedule for later</Label>
          </div>

          {isScheduled && (
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
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

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-[120px]"
                    disabled={isLoading}
                    ref={timeInputRef}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Timezone: {timezone}
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading || (isScheduled && (!scheduledDate || !scheduledTime))}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isScheduled ? "Scheduling task..." : "Running..."}
              </>
            ) : (
              isScheduled ? "Schedule Task" : "Run Agent"
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <AlertDescription className="whitespace-pre-wrap">
                {result}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
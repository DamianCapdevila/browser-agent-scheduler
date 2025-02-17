import { Task } from "@/app/types/task"

export const mockTasks: Task[] = [
  {
    id: "task_1",
    task: "Search for 'Next.js' on Google and extract the first 3 results",
    apiKey: "sk-mock-key",
    scheduledTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    status: "scheduled"
  },
  {
    id: "task_2",
    task: "Go to GitHub and star the browser-use repository",
    apiKey: "sk-mock-key",
    scheduledTime: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    status: "completed",
    result: "Successfully starred the repository at https://github.com/browser-use/browser-use"
  },
  {
    id: "task_3",
    task: "Search for AI news on TechCrunch and summarize the latest article",
    apiKey: "sk-mock-key",
    scheduledTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    status: "failed",
    error: "Could not access the website. Please check your internet connection."
  }
] 
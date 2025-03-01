export type TaskStatus = 'scheduled' | 'running' | 'completed' | 'failed';

export interface Task {
  id: string;
  task: string;
  apiKey: string;
  scheduledTime: string;
  timezone: string;
  status: TaskStatus;
  result?: string;
  error?: string;
}
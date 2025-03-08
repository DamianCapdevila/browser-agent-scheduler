export type TaskStatus = 'scheduled' | 'running' | 'completed' | 'failed';

export interface Task {
  id: string;
  user_id: string;
  task: string;
  scheduled_time: string;
  timezone: string | 'UTC';
  status: TaskStatus;
  result?: string;
  error?: string;
}
import { supabase } from '@/lib/supabaseClient'
import { Task } from '@/app/types/task'

export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    // RLS policies will automatically filter to only show the current user's tasks
    .order('scheduled_time', { ascending: true })
  
  if (error) throw error
  return data
}

export async function createTask(task: Omit<Task, 'id'>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTask(task: Task) {
  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  
  if (error) throw error
  return { success: true }
} 
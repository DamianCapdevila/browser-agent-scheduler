"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import { TaskDialog } from "@/components/task-dialog"
import { TaskList } from "@/components/task-list"
import { Task } from "@/app/types/task"
import { SetupInstructions } from "@/components/setup-instructions"
import { DemoBanner } from "@/components/demo-banner"
import { mockTasks } from "@/lib/mock-data"
import { Layout } from "@/components/layout"
import { supabase } from "@/lib/supabaseClient"
import { fetchTasks as fetchTasksFromSupabase, deleteTask } from "@/lib/task-service"
import { SettingsDialog } from "@/components/settings-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)

  // Get current user and check if they have an API key
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      // Check if the user has an API key stored
      if (data.user) {
        try {
          console.log("Checking API key for user:", data.user.id);

          // Correctly query from user_api_keys table
          const { data: keyData, error } = await supabase
            .from('user_api_keys')
            .select('id')
            .eq('user_id', data.user.id)
            .limit(1)

          console.log("Key data:", keyData);
          // Safely set hasApiKey to true only if we have actual results
          setHasApiKey(keyData !== null && keyData.length > 0);

        } catch (err) {
          console.error('Error checking for API key:', err)
          // Ensure hasApiKey is false when there's an error
          setHasApiKey(false);
        }
      }
    }

    getUser()
  }, [])

  // Fetch tasks, api key & setup real-time subscription
  useEffect(() => {
    if (DEMO_MODE) {
      setTasks(mockTasks)
      setIsLoading(false)
      return
    }

    if (user) {
      // Initial fetch
      fetchTasks()
      setHasApiKey(hasApiKey)
      // Setup real-time subscription with optimized updates
      const taskSubscription = supabase
        .channel('tasks-changes')
        .on('postgres_changes', {
          event: '*', // Listen for all changes (insert, update, delete)
          schema: 'public',
          table: 'tasks',
        }, (payload) => {
          console.log('Realtime event received:', payload.eventType)

          // Handle each event type with targeted updates
          switch (payload.eventType) {
            case 'INSERT':
              // Add the new task to the list without full refresh
              const newTask = payload.new as Task;
              setTasks(currentTasks => [...currentTasks, newTask]);
              break;

            case 'UPDATE':
              // Update the specific task in the list
              const updatedTask = payload.new as Task;
              setTasks(currentTasks =>
                currentTasks.map(task =>
                  task.id === updatedTask.id ? updatedTask : task
                )
              );
              break;

            case 'DELETE':
              // Remove the specific task from the list
              const deletedTaskId = payload.old.id;
              setTasks(currentTasks =>
                currentTasks.filter(task => task.id !== deletedTaskId)
              );
              break;
          }
        })
        .subscribe()

        const apiKeySubscription = supabase
        .channel('api-key-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_api_keys',
        }, (payload) => {
          console.log('Realtime API key event received:', payload.eventType);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setHasApiKey(true);
          }
          if (payload.eventType === 'DELETE') {
            setHasApiKey(false);
          }
        })
        .subscribe();
      

      // Cleanup subscription on unmount
      return () => {
        taskSubscription.unsubscribe()
        apiKeySubscription.unsubscribe()
      }
    }
  }, [user])

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const tasksData = await fetchTasksFromSupabase()
      setTasks(tasksData || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitTask = async (task: Task) => {
    if (DEMO_MODE) {
      // Simulate task creation in demo mode
      const newTask = {
        ...task,
        status: 'scheduled' as const,
      }
      setTasks([...tasks, newTask])
      setIsDialogOpen(false)
      return
    }

    try {
      // No need to send a request - the task-dialog now handles
      // the Supabase operations directly
      await fetchTasks() // Refresh the task list
      setIsDialogOpen(false)
    } catch (error) {
      console.error(`Failed to ${task.id ? 'update' : 'add'} task:`, error)
      throw error
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (DEMO_MODE) {
      setTasks(tasks.filter(task => task.id !== taskId))
      return
    }

    // Set the task ID and open the confirmation dialog
    setTaskToDelete(taskId)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return

    try {
      await deleteTask(taskToDelete)
      // Use functional update to avoid stale state
      setTasks(currentTasks => currentTasks.filter(task => task.id !== taskToDelete))
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setTaskToDelete(null)
      setDeleteConfirmOpen(false)
    }
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setSelectedTask(undefined)
    setIsDialogOpen(false)
  }

  // Handler for saving API key - integrate with your Supabase logic
  const handleSaveApiKey = async (apiKey: string) => {
    // This is just a UI placeholder - replace with your actual implementation
    console.log("Saving API key:", apiKey)

    // You would implement your Supabase logic here
    // Example: await supabase.from('profiles').update({ api_key: apiKey }).eq('id', user.id)
  }

  // Handler for deleting API key - integrate with your Supabase logic
  const handleDeleteApiKey = async () => {
    // This is just a UI placeholder - replace with your actual implementation
    console.log("Deleting API key")

    // You would implement your Supabase logic here
    // Example: await supabase.from('profiles').update({ api_key: null }).eq('id', user.id)
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 space-y-8">
        {DEMO_MODE && <DemoBanner />}

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Tasks</h2>
          <div className="flex space-x-2">
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
        />

        <SetupInstructions />

        <TaskDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          onSubmit={handleSubmitTask}
          initialTask={selectedTask}
          onSettingsClick={() => setIsSettingsOpen(true)}
          hasApiKey={hasApiKey}
        />

        <SettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          apiKey={hasApiKey ? "API Key Available" : "API Key Not Available"}
          onSaveApiKey={handleSaveApiKey}
          onDeleteApiKey={handleDeleteApiKey}
          userId={user?.id}
        />

        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the task.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  )
}
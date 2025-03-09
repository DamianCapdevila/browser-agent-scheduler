"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import { TaskDialog } from "@/components/task-dialog"
import { TaskList } from "@/components/task-list"
import { Task } from "@/app/types/task"
import { User } from "@/app/types/user"
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

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser({ id: data.user?.id || "", name: data.user?.user_metadata?.name || "" })

      if (data.user) {
        try {

          const { data: keyData } = await supabase
            .from('user_api_keys')
            .select('id')
            .eq('user_id', data.user.id)
            .limit(1)

          setHasApiKey(keyData !== null && keyData.length > 0);

        } catch (err) {
          setHasApiKey(false);
        }
      }
    }

    getUser()
  }, [])


  useEffect(() => {
    if (DEMO_MODE) {
      setTasks(mockTasks)
      setIsLoading(false)
      return
    }

    if (user) {
      
      fetchTasks()
      const taskSubscription = supabase
        .channel('tasks-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'tasks',
        }, (payload) => {
          
          switch (payload.eventType) {
            case 'INSERT':
              const newTask = payload.new as Task;
              setTasks(currentTasks => [...currentTasks, newTask]);
              break;

            case 'UPDATE':
              const updatedTask = payload.new as Task;
              setTasks(currentTasks =>
                currentTasks.map(task =>
                  task.id === updatedTask.id ? updatedTask : task
                )
              );
              break;

            case 'DELETE':
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
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setHasApiKey(true);
          }
          if (payload.eventType === 'DELETE') {
            setHasApiKey(false);
          }
        })
        .subscribe();
      
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
      const newTask = {
        ...task,
        status: 'scheduled' as const,
      }
      setTasks([...tasks, newTask])
      setIsDialogOpen(false)
      return
    }

    try {
      await fetchTasks()  
      setIsDialogOpen(false)
    } catch (error) {
      throw error
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (DEMO_MODE) {
      setTasks(tasks.filter(task => task.id !== taskId))
      return
    }

    setTaskToDelete(taskId)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return

    try {
      await deleteTask(taskToDelete)
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

  const handleSaveApiKey = async () => {
    setHasApiKey(true)
  }

  const handleDeleteApiKey = async () => {
    setHasApiKey(false)
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
          userId={user?.id || ""}
          onSaveApiKey={handleSaveApiKey}
          onDeleteApiKey={handleDeleteApiKey}
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
"use client"

import { Task } from "@/app/types/task"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Maximize2, Hammer } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ResultDialog } from "./result-dialog"
import { useState } from "react"

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  onDelete: (taskId: string) => void
  onEdit: (task: Task) => void
}

export function TaskList({ tasks, isLoading, onDelete, onEdit }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "No date set";
      
      // Remove timezone abbreviation if present (e.g., "CET", "GMT")
      const cleanDateString = dateString.replace(/\s[A-Z]{3,4}$/, '');
      
      const date = new Date(cleanDateString);
      if (isNaN(date.getTime())) {
        console.error("Invalid date string:", dateString);
        return "Invalid date format";
      }
      
      // Format the date using the user's timezone
      return format(date, "PPP 'at' p");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error formatting date";
    }
  };

  const handleShowResult = (task: Task) => {
    setSelectedTask(task);
    setIsResultDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading tasks...</div>
  }

  if (tasks.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No tasks scheduled. Click the "New Task" button to create one.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Scheduled Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result/Error</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Hammer className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{task.task}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {formatDate(task.scheduledTime)}
                </TableCell>
                <TableCell>
                  <span className={`capitalize ${
                    task.status === 'running' ? 'text-blue-500' :
                    task.status === 'completed' ? 'text-green-500' :
                    task.status === 'failed' ? 'text-red-500' :
                    'text-gray-500'
                  }`}>
                    {task.status}
                  </span>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {task.error ? (
                    <span className="text-red-500 cursor-pointer hover:underline" onClick={() => handleShowResult(task)}>
                      {task.error}
                    </span>
                  ) : task.result ? (
                    <span className="text-green-500 cursor-pointer hover:underline" onClick={() => handleShowResult(task)}>
                      {task.result}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(task)}
                      disabled={task.status !== 'scheduled'}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {(task.result || task.error) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShowResult(task)}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedTask && (
        <ResultDialog
          open={isResultDialogOpen}
          onOpenChange={setIsResultDialogOpen}
          result={selectedTask.result}
          error={selectedTask.error}
          task={selectedTask.task}
        />
      )}
    </>
  )
}
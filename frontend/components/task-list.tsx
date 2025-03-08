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
import { useState, memo, useCallback } from "react"

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  onDelete: (taskId: string) => void
  onEdit: (task: Task) => void
}

// Memoized individual task row component
const TaskRow = memo(({ 
  task, 
  onDelete, 
  onEdit, 
  onShowResult 
}: { 
  task: Task, 
  onDelete: (id: string) => void, 
  onEdit: (task: Task) => void,
  onShowResult: (task: Task) => void
}) => {
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

  return (
    <TableRow key={task.id}>
      <TableCell className="font-medium max-w-[200px] md:max-w-none">
        <div className="flex items-start space-x-3">
          <Hammer className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          <div>
            <span className="line-clamp-2">{task.task}</span>
            <div className="md:hidden text-xs text-muted-foreground mt-1">
              {formatDate(task.scheduled_time)}
            </div>
            <div className="sm:hidden text-xs mt-1">
              <span className={`capitalize ${
                task.status === 'running' ? 'text-blue-500' :
                task.status === 'completed' ? 'text-green-500' :
                task.status === 'failed' ? 'text-red-500' :
                'text-gray-500'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {formatDate(task.scheduled_time)}
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <span className={`capitalize ${
          task.status === 'running' ? 'text-blue-500' :
          task.status === 'completed' ? 'text-green-500' :
          task.status === 'failed' ? 'text-red-500' :
          'text-gray-500'
        }`}>
          {task.status}
        </span>
      </TableCell>
      <TableCell className="hidden sm:table-cell max-w-[300px] truncate">
        {task.error ? (
          <span className="text-red-500 cursor-pointer hover:underline" onClick={() => onShowResult(task)}>
            {task.error}
          </span>
        ) : task.result ? (
          <span className="text-green-500 cursor-pointer hover:underline" onClick={() => onShowResult(task)}>
            {task.result}
          </span>
        ) : null}
      </TableCell>
      <TableCell>
        <div className="flex space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            disabled={task.status !== 'scheduled'}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {(task.result || task.error) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onShowResult(task)}
              className="h-8 w-8"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

TaskRow.displayName = 'TaskRow';

export function TaskList({ tasks, isLoading, onDelete, onEdit }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);

  const handleShowResult = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsResultDialogOpen(true);
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">Loading tasks...</div>
  }

  if (tasks.length === 0) {
    return (
      <Alert>
        <AlertDescription className="text-gray-500">
          No tasks scheduled. Click the &quot;New Task&quot; button to create one.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead className="hidden md:table-cell">Scheduled Time</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden sm:table-cell">Result/Error</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TaskRow 
                key={task.id}
                task={task}
                onDelete={onDelete}
                onEdit={onEdit}
                onShowResult={handleShowResult}
              />
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
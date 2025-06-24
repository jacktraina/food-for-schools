"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type TodoItem = {
  id: string
  text: string
  completed: boolean
  priority: "high" | "medium" | "low"
  dueDate?: string
}

type TodoListProps = {
  userId: string
}

export function TodoList({ userId }: TodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [newTodoPriority, setNewTodoPriority] = useState<"high" | "medium" | "low">("medium")

  // Load todos from localStorage on component mount
  useEffect(() => {
    const storedTodos = localStorage.getItem(`todos-${userId}`)
    if (storedTodos) {
      try {
        setTodos(JSON.parse(storedTodos))
      } catch (e) {
        console.error("Failed to parse todos:", e)
      }
    } else {
      // Set default todos for demo
      const defaultTodos: TodoItem[] = [
        {
          id: "1",
          text: "Review Milk Bid specifications",
          completed: false,
          priority: "high",
          dueDate: "2023-06-15",
        },
        {
          id: "2",
          text: "Schedule meeting with Springfield Elementary",
          completed: false,
          priority: "medium",
          dueDate: "2023-06-20",
        },
        {
          id: "3",
          text: "Approve vendor application for Organic Farms",
          completed: true,
          priority: "low",
        },
        {
          id: "4",
          text: "Finalize produce bid award recommendations",
          completed: false,
          priority: "high",
          dueDate: "2023-06-10",
        },
        {
          id: "5",
          text: "Update district contact information",
          completed: false,
          priority: "medium",
        },
      ]
      setTodos(defaultTodos)
      localStorage.setItem(`todos-${userId}`, JSON.stringify(defaultTodos))
    }
  }, [userId])

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`todos-${userId}`, JSON.stringify(todos))
  }, [todos, userId])

  const addTodo = () => {
    if (newTodo.trim() === "") return

    const newTodoItem: TodoItem = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      priority: newTodoPriority,
    }

    setTodos([...todos, newTodoItem])
    setNewTodo("")
    setIsAddingTodo(false)
    setNewTodoPriority("medium")
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Sort todos: incomplete first (sorted by priority), then completed
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed && !b.completed) return 1
    if (!a.completed && b.completed) return -1

    if (!a.completed && !b.completed) {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }

    return 0
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        {sortedTodos.map((todo) => (
          <div key={todo.id} className="flex items-start space-x-2 group">
            <Button variant="ghost" size="icon" className="h-6 w-6 mt-0.5" onClick={() => toggleTodo(todo.id)}>
              {todo.completed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
              <span className="sr-only">{todo.completed ? "Mark as incomplete" : "Mark as complete"}</span>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={todo.completed ? "line-through text-muted-foreground" : ""}>{todo.text}</span>
                <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                  {todo.priority}
                </Badge>
                {todo.dueDate && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    Due: {new Date(todo.dueDate).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteTodo(todo.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        ))}
      </div>

      {isAddingTodo ? (
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="What needs to be done?"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo()
            }}
            autoFocus
          />
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className={`${getPriorityColor("high")} hover:bg-red-200`}
              onClick={() => setNewTodoPriority("high")}
            >
              High
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={`${getPriorityColor("medium")} hover:bg-yellow-200`}
              onClick={() => setNewTodoPriority("medium")}
            >
              Medium
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={`${getPriorityColor("low")} hover:bg-green-200`}
              onClick={() => setNewTodoPriority("low")}
            >
              Low
            </Button>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddingTodo(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={addTodo}>
              Add Task
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-1"
          onClick={() => setIsAddingTodo(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Task
        </Button>
      )}
    </div>
  )
}

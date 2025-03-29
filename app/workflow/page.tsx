"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, MoreHorizontal, Calendar, User, RefreshCw, Trash2, Edit, MoveVertical, GripVertical } from "lucide-react"
import { type Task, taskService } from "@/lib/services/task-service"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"

// タスクのステータス型を定義
type TaskStatus = "planning" | "inProgress" | "review" | "completed"

// タスクの状態を管理するための型
interface TaskState {
  planning: Task[]
  inProgress: Task[]
  review: Task[]
  completed: Task[]
}

export default function WorkflowPage() {
  const [tasks, setTasks] = useState<TaskState>({
    planning: [],
    inProgress: [],
    review: [],
    completed: [],
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncingWithTrello, setSyncingWithTrello] = useState(false)
  const [newTask, setNewTask] = useState<Task>({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    assignee: "",
    priority: "中",
    status: "planning",
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const allTasks = await taskService.getTasks()

      // Group tasks by status
      const groupedTasks: TaskState = {
        planning: allTasks.filter((task) => task.status === "planning"),
        inProgress: allTasks.filter((task) => task.status === "inProgress"),
        review: allTasks.filter((task) => task.status === "review"),
        completed: allTasks.filter((task) => task.status === "completed"),
      }

      setTasks(groupedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Firebase access error", {
        description: "Please check your Firebase security rules.",
      })

      // Set empty tasks
      setTasks({
        planning: [],
        inProgress: [],
        review: [],
        completed: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    try {
      const id = await taskService.addTask(newTask)

      // Update local state
      setTasks((prev) => {
        const status = newTask.status as TaskStatus
        return {
          ...prev,
          [status]: [...prev[status], { ...newTask, id }],
        }
      })

      setNewTask({
        title: "",
        description: "",
        dueDate: new Date().toISOString().split("T")[0],
        assignee: "",
        priority: "中",
        status: "planning",
      })

      toast.success("タスクを追加しました", {
        description: "新しいタスクが正常に保存されました。",
      })

      // Trelloにも同期
      try {
        await fetch("/api/trello/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ task: { ...newTask, id } }),
        })
      } catch (trelloError) {
        console.error("Error syncing with Trello:", trelloError)
        toast.error("Trelloとの同期に失敗しました", {
          description: "タスクはローカルに保存されましたが、Trelloとの同期に失敗しました。",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error adding task:", error)
      toast.error("エラーが発生しました", {
        description: "タスクの保存中にエラーが発生しました。",
      })
    }
  }

  const syncWithTrello = async () => {
    setSyncingWithTrello(true)
    try {
      const response = await fetch("/api/trello/sync")
      const data = await response.json()

      if (data.success) {
        // Trelloから取得したタスクでローカルを更新
        const groupedTasks: TaskState = {
          planning: data.tasks.filter((task: Task) => task.status === "planning"),
          inProgress: data.tasks.filter((task: Task) => task.status === "inProgress"),
          review: data.tasks.filter((task: Task) => task.status === "review"),
          completed: data.tasks.filter((task: Task) => task.status === "completed"),
        }

        setTasks(groupedTasks)
        toast.success("Trelloと同期しました", {
          description: `${data.tasks.length}個のタスクを同期しました。`,
        })
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (error) {
      console.error("Error syncing with Trello:", error)
      // エラーメッセージを安全に抽出
      const errorMessage =
        error && typeof error === "object" && "message" in error ? String(error.message) : "Unknown error occurred"

      toast.error("Trelloとの同期に失敗しました", {
        description: `エラー: ${errorMessage}。APIキーとトークンを確認してください。`,
      })
    } finally {
      setSyncingWithTrello(false)
    }
  }

  // タスク削除機能
  const handleDeleteTask = async (taskId: string, status: TaskStatus) => {
    try {
      await taskService.deleteTask(taskId)

      // ローカル状態を更新
      setTasks((prev) => ({
        ...prev,
        [status]: prev[status].filter((task) => task.id !== taskId),
      }))

      toast.success("タスクを削除しました")
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("タスクの削除に失敗しました")
    }
  }

  // ドラッグ＆ドロップ処理
  const handleDragEnd = (result: DropResult) => {
    console.log("Drag end result:", result)
    const { source, destination } = result

    // ドロップ先がない場合は何もしない
    if (!destination) {
      return
    }

    // 同じ場所にドロップした場合は何もしない
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    // ドラッグしたタスクを取得
    const sourceStatus = source.droppableId as TaskStatus
    const destinationStatus = destination.droppableId as TaskStatus
    const taskToMove = tasks[sourceStatus][source.index]

    if (!taskToMove || !taskToMove.id) {
      console.error("Invalid task to move")
      return
    }

    // 新しいタスク配列を作成
    const newTasks = { ...tasks }

    // 元の場所からタスクを削除
    newTasks[sourceStatus] = [...newTasks[sourceStatus]]
    newTasks[sourceStatus].splice(source.index, 1)

    // 新しい場所にタスクを追加
    newTasks[destinationStatus] = [...newTasks[destinationStatus]]
    newTasks[destinationStatus].splice(destination.index, 0, {
      ...taskToMove,
      status: destinationStatus,
    })

    // 状態を更新
    setTasks(newTasks)

    // データベースを更新
    try {
      taskService.updateTask(taskToMove.id, { status: destinationStatus })
      toast.success(`タスクを「${statusLabels[destinationStatus]}」に移動しました`)

      // Trelloも更新
      fetch("/api/trello/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: { ...taskToMove, status: destinationStatus },
        }),
      }).catch((error) => {
        console.error("Error syncing with Trello:", error)
      })
    } catch (error) {
      console.error("Error updating task status:", error)
      toast.error("タスクの更新に失敗しました")
      // エラーが発生した場合は元の状態に戻す
      fetchTasks()
    }
  }

  const statusLabels: Record<TaskStatus, string> = {
    planning: "計画中",
    inProgress: "進行中",
    review: "レビュー中",
    completed: "完了",
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">工程管理</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncWithTrello} disabled={syncingWithTrello}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncingWithTrello ? "animate-spin" : ""}`} />
            Trelloと同期
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規タスク
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規タスク作成</DialogTitle>
                <DialogDescription>新しいタスクの詳細を入力してください</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">タイトル</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="タスクのタイトル"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="タスクの詳細説明"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">期限</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignee">担当者</Label>
                    <Input
                      id="assignee"
                      value={newTask.assignee}
                      onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                      placeholder="担当者名"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">優先度</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="優先度を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="高">高</SelectItem>
                        <SelectItem value="中">中</SelectItem>
                        <SelectItem value="低">低</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">ステータス</Label>
                    <Select
                      value={newTask.status}
                      onValueChange={(value: string) => {
                        // TaskStatusに型キャストして安全に処理
                        const status = value as TaskStatus
                        setNewTask({ ...newTask, status })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ステータスを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">計画中</SelectItem>
                        <SelectItem value="inProgress">進行中</SelectItem>
                        <SelectItem value="review">レビュー中</SelectItem>
                        <SelectItem value="completed">完了</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleAddTask}>追加</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <p>読み込み中...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(tasks) as TaskStatus[]).map((status) => (
              <Card key={status} className="flex flex-col">
                <CardHeader className="bg-secondary/50 pb-3">
                  <CardTitle className="text-lg">{statusLabels[status]}</CardTitle>
                  <CardDescription>{tasks[status].length} タスク</CardDescription>
                </CardHeader>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <CardContent
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 space-y-3 flex-1 min-h-[200px] ${
                        snapshot.isDraggingOver ? "bg-secondary/30" : ""
                      }`}
                    >
                      {tasks[status].length > 0 ? (
                        tasks[status].map((task, index) => (
                          <Draggable
                            key={task.id || `task-${index}`}
                            draggableId={task.id || `task-${index}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={provided.draggableProps.style}
                                className={snapshot.isDragging ? "dragging" : ""}
                              >
                                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                                  <CardContent className="p-3">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-2">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="cursor-grab active:cursor-grabbing"
                                        >
                                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-medium">{task.title}</h3>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem>
                                            <Edit className="h-4 w-4 mr-2" />
                                            編集
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <MoveVertical className="h-4 w-4 mr-2" />
                                            移動
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => handleDeleteTask(task.id || "", status)}
                                            className="text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            削除
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {task.dueDate}
                                      </div>
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <User className="h-3 w-3 mr-1" />
                                        {task.assignee || "未割当"}
                                      </div>
                                      <div
                                        className={`flex items-center text-xs px-1.5 py-0.5 rounded-full ${
                                          task.priority === "高"
                                            ? "bg-red-100 text-red-800"
                                            : task.priority === "中"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-green-100 text-green-800"
                                        }`}
                                      >
                                        {task.priority}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <p className="text-center py-4 text-muted-foreground">タスクがありません</p>
                      )}
                      {provided.placeholder}
                    </CardContent>
                  )}
                </Droppable>
              </Card>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  )
}


import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore"

export type TaskStatus = "planning" | "inProgress" | "review" | "completed"

export interface Task {
  id?: string
  title: string
  description: string
  dueDate: string
  assignee: string
  priority: string
  status: TaskStatus
  createdAt?: number
  trelloCardId?: string // 追加: Trelloカード連携用のID
}

export const taskService = {
  async getTasks(): Promise<Task[]> {
    try {
      const tasksRef = collection(db, "tasks")
      const snapshot = await getDocs(query(tasksRef, orderBy("createdAt", "desc")))
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]
    } catch (error) {
      console.error("Error getting tasks:", error)
      return []
    }
  },

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    try {
      const tasksRef = collection(db, "tasks")
      const q = query(tasksRef, where("status", "==", status), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]
    } catch (error) {
      console.error("Error getting tasks by status:", error)
      return []
    }
  },

  async getTask(id: string): Promise<Task | null> {
    try {
      const docRef = doc(db, "tasks", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Task
      } else {
        return null
      }
    } catch (error) {
      console.error("Error getting task:", error)
      return null
    }
  },

  async addTask(task: Task): Promise<string> {
    try {
      const tasksRef = collection(db, "tasks")
      const newTask = {
        ...task,
        createdAt: Date.now(),
      }
      const docRef = await addDoc(tasksRef, newTask)
      return docRef.id
    } catch (error) {
      console.error("Error adding task:", error)
      throw error
    }
  },

  async updateTask(id: string, task: Partial<Task>): Promise<void> {
    try {
      const docRef = doc(db, "tasks", id)
      await updateDoc(docRef, task)
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      const docRef = doc(db, "tasks", id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  },
}


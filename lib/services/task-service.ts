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
}

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const tasksRef = collection(db, "tasks")
    const snapshot = await getDocs(query(tasksRef, orderBy("createdAt", "desc")))
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[]
  },

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    const tasksRef = collection(db, "tasks")
    const q = query(tasksRef, where("status", "==", status), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[]
  },

  async getTask(id: string): Promise<Task | null> {
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
  },

  async addTask(task: Task): Promise<string> {
    const tasksRef = collection(db, "tasks")
    const newTask = {
      ...task,
      createdAt: Date.now(),
    }
    const docRef = await addDoc(tasksRef, newTask)
    return docRef.id
  },

  async updateTask(id: string, task: Partial<Task>): Promise<void> {
    const docRef = doc(db, "tasks", id)
    await updateDoc(docRef, task)
  },

  async deleteTask(id: string): Promise<void> {
    const docRef = doc(db, "tasks", id)
    await deleteDoc(docRef)
  },
}


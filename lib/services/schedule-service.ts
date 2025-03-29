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

export interface EmailSchedule {
  id?: string
  name: string
  templateId: string
  recipients: string // 'all', 'active', 'inactive', or comma-separated emails
  scheduledDate: string
  scheduledTime: string
  status: "scheduled" | "sent" | "failed"
  trackOpens: boolean
  createdAt?: number
  sentAt?: number
  error?: string
}

export const scheduleService = {
  async getSchedules(): Promise<EmailSchedule[]> {
    try {
      const schedulesRef = collection(db, "emailSchedules")
      const snapshot = await getDocs(query(schedulesRef, orderBy("createdAt", "desc")))
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EmailSchedule[]
    } catch (error) {
      console.error("Error getting schedules:", error)
      return []
    }
  },

  async getSchedulesByStatus(status: "scheduled" | "sent" | "failed"): Promise<EmailSchedule[]> {
    try {
      const schedulesRef = collection(db, "emailSchedules")
      const q = query(schedulesRef, where("status", "==", status), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EmailSchedule[]
    } catch (error) {
      console.error("Error getting schedules by status:", error)
      return []
    }
  },

  async getPendingSchedules(): Promise<EmailSchedule[]> {
    try {
      const now = new Date()
      const today = now.toISOString().split("T")[0]
      const currentTime =
        now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0")

      const schedulesRef = collection(db, "emailSchedules")
      const q = query(
        schedulesRef,
        where("status", "==", "scheduled"),
        orderBy("scheduledDate"),
        orderBy("scheduledTime"),
      )

      const snapshot = await getDocs(q)
      // 明示的に型アサーションを追加して、TypeScriptに正しい型を伝える
      const schedules = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EmailSchedule[]

      return schedules.filter((schedule) => {
        // 今日の場合は時間も確認
        if (schedule.scheduledDate === today) {
          return schedule.scheduledTime <= currentTime
        }
        // 過去の日付はすべて対象
        return schedule.scheduledDate < today
      })
    } catch (error) {
      console.error("Error getting pending schedules:", error)
      return []
    }
  },

  async getSchedule(id: string): Promise<EmailSchedule | null> {
    try {
      const docRef = doc(db, "emailSchedules", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as EmailSchedule
      } else {
        return null
      }
    } catch (error) {
      console.error("Error getting schedule:", error)
      return null
    }
  },

  async addSchedule(schedule: EmailSchedule): Promise<string> {
    try {
      const schedulesRef = collection(db, "emailSchedules")
      const newSchedule = {
        ...schedule,
        createdAt: Date.now(),
      }
      const docRef = await addDoc(schedulesRef, newSchedule)
      return docRef.id
    } catch (error) {
      console.error("Error adding schedule:", error)
      throw error
    }
  },

  async updateSchedule(id: string, schedule: Partial<EmailSchedule>): Promise<void> {
    try {
      const docRef = doc(db, "emailSchedules", id)
      await updateDoc(docRef, schedule)
    } catch (error) {
      console.error("Error updating schedule:", error)
      throw error
    }
  },

  async deleteSchedule(id: string): Promise<void> {
    try {
      const docRef = doc(db, "emailSchedules", id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error("Error deleting schedule:", error)
      throw error
    }
  },

  async markAsSent(id: string): Promise<void> {
    try {
      const docRef = doc(db, "emailSchedules", id)
      await updateDoc(docRef, {
        status: "sent",
        sentAt: Date.now(),
      })
    } catch (error) {
      console.error("Error marking schedule as sent:", error)
      throw error
    }
  },

  async markAsFailed(id: string, error: string): Promise<void> {
    try {
      const docRef = doc(db, "emailSchedules", id)
      await updateDoc(docRef, {
        status: "failed",
        error,
      })
    } catch (err) {
      console.error("Error marking schedule as failed:", err)
      throw err
    }
  },
}


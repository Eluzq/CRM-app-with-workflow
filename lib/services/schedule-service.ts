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
    const schedulesRef = collection(db, "emailSchedules")
    const snapshot = await getDocs(query(schedulesRef, orderBy("createdAt", "desc")))
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EmailSchedule[]
  },

  async getSchedulesByStatus(status: "scheduled" | "sent" | "failed"): Promise<EmailSchedule[]> {
    const schedulesRef = collection(db, "emailSchedules")
    const q = query(schedulesRef, where("status", "==", status), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EmailSchedule[]
  },

  async getPendingSchedules(): Promise<EmailSchedule[]> {
    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const currentTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0")

    const schedulesRef = collection(db, "emailSchedules")
    const q = query(
      schedulesRef,
      where("status", "==", "scheduled"),
      orderBy("scheduledDate"),
      orderBy("scheduledTime"),
    )

    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((schedule) => {
        // 今日の場合は時間も確認
        if (schedule.scheduledDate === today) {
          return schedule.scheduledTime <= currentTime
        }
        // 過去の日付はすべて対象
        return schedule.scheduledDate < today
      }) as EmailSchedule[]
  },

  async getSchedule(id: string): Promise<EmailSchedule | null> {
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
  },

  async addSchedule(schedule: EmailSchedule): Promise<string> {
    const schedulesRef = collection(db, "emailSchedules")
    const newSchedule = {
      ...schedule,
      createdAt: Date.now(),
    }
    const docRef = await addDoc(schedulesRef, newSchedule)
    return docRef.id
  },

  async updateSchedule(id: string, schedule: Partial<EmailSchedule>): Promise<void> {
    const docRef = doc(db, "emailSchedules", id)
    await updateDoc(docRef, schedule)
  },

  async deleteSchedule(id: string): Promise<void> {
    const docRef = doc(db, "emailSchedules", id)
    await deleteDoc(docRef)
  },

  async markAsSent(id: string): Promise<void> {
    const docRef = doc(db, "emailSchedules", id)
    await updateDoc(docRef, {
      status: "sent",
      sentAt: Date.now(),
    })
  },

  async markAsFailed(id: string, error: string): Promise<void> {
    const docRef = doc(db, "emailSchedules", id)
    await updateDoc(docRef, {
      status: "failed",
      error,
    })
  },
}


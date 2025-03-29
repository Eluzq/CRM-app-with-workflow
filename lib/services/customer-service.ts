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

export interface Customer {
  id?: string
  name: string
  email: string
  company: string
  status: string
  lastContact: string
  phone?: string
  address?: string
  notes?: string
  source?: string
  createdAt?: number
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const customersRef = collection(db, "customers")
    const snapshot = await getDocs(query(customersRef, orderBy("createdAt", "desc")))
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Customer[]
  },

  async getCustomersByStatus(status: string): Promise<Customer[]> {
    const customersRef = collection(db, "customers")
    const q = query(customersRef, where("status", "==", status), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Customer[]
  },

  async getCustomer(id: string): Promise<Customer | null> {
    const docRef = doc(db, "customers", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Customer
    } else {
      return null
    }
  },

  async addCustomer(customer: Customer): Promise<string> {
    const customersRef = collection(db, "customers")
    const newCustomer = {
      ...customer,
      createdAt: Date.now(),
    }
    const docRef = await addDoc(customersRef, newCustomer)
    return docRef.id
  },

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<void> {
    const docRef = doc(db, "customers", id)
    await updateDoc(docRef, customer)
  },

  async deleteCustomer(id: string): Promise<void> {
    const docRef = doc(db, "customers", id)
    await deleteDoc(docRef)
  },
}


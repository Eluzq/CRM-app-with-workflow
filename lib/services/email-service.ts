import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"

export interface EmailTemplate {
  id?: string
  name: string
  subject: string
  content: string
  lastUsed?: string
  createdAt?: number
}

export interface EmailCampaign {
  id?: string
  name: string
  subject: string
  content: string
  recipients: string
  sent: number
  opened: number
  clicked: number
  date: string
  createdAt?: number
}

export const emailService = {
  // Email Templates
  async getTemplates(): Promise<EmailTemplate[]> {
    const templatesRef = collection(db, "emailTemplates")
    const snapshot = await getDocs(query(templatesRef, orderBy("createdAt", "desc")))
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EmailTemplate[]
  },

  async getTemplate(id: string): Promise<EmailTemplate | null> {
    const docRef = doc(db, "emailTemplates", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as EmailTemplate
    } else {
      return null
    }
  },

  async addTemplate(template: EmailTemplate): Promise<string> {
    const templatesRef = collection(db, "emailTemplates")
    const newTemplate = {
      ...template,
      createdAt: Date.now(),
    }
    const docRef = await addDoc(templatesRef, newTemplate)
    return docRef.id
  },

  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<void> {
    const docRef = doc(db, "emailTemplates", id)
    await updateDoc(docRef, template)
  },

  async deleteTemplate(id: string): Promise<void> {
    const docRef = doc(db, "emailTemplates", id)
    await deleteDoc(docRef)
  },

  // Email Campaigns
  async getCampaigns(): Promise<EmailCampaign[]> {
    const campaignsRef = collection(db, "emailCampaigns")
    const snapshot = await getDocs(query(campaignsRef, orderBy("createdAt", "desc")))
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EmailCampaign[]
  },

  async getCampaign(id: string): Promise<EmailCampaign | null> {
    const docRef = doc(db, "emailCampaigns", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as EmailCampaign
    } else {
      return null
    }
  },

  async addCampaign(campaign: EmailCampaign): Promise<string> {
    const campaignsRef = collection(db, "emailCampaigns")
    const newCampaign = {
      ...campaign,
      createdAt: Date.now(),
    }
    const docRef = await addDoc(campaignsRef, newCampaign)
    return docRef.id
  },

  async updateCampaign(id: string, campaign: Partial<EmailCampaign>): Promise<void> {
    const docRef = doc(db, "emailCampaigns", id)
    await updateDoc(docRef, campaign)
  },

  async deleteCampaign(id: string): Promise<void> {
    const docRef = doc(db, "emailCampaigns", id)
    await deleteDoc(docRef)
  },
}


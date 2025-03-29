import Mailjet from "node-mailjet"

// Mailjet APIキーを設定
let mailjet: Mailjet.Client
try {
  mailjet = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY || "",
    apiSecret: process.env.MAILJET_API_SECRET || "",
  })
} catch (error) {
  console.error("Mailjet initialization error:", error)
}

export interface EmailData {
  to: { email: string; name?: string }[]
  subject: string
  textPart?: string
  htmlPart: string
  from?: { email: string; name?: string }
  attachments?: {
    contentType: string
    filename: string
    base64Content: string
  }[]
  customId?: string
  trackOpens?: boolean
  trackClicks?: boolean
}

export const mailjetService = {
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!mailjet) {
        throw new Error("Mailjet client not initialized")
      }

      const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: emailData.from || {
              Email: process.env.SENDER_EMAIL || "noreply@example.com",
              Name: "CRM System",
            },
            To: emailData.to,
            Subject: emailData.subject,
            TextPart: emailData.textPart || "",
            HTMLPart: emailData.htmlPart,
            Attachments: emailData.attachments || [],
            CustomID: emailData.customId || "",
            TrackOpens: emailData.trackOpens !== undefined ? emailData.trackOpens : true,
            TrackClicks: emailData.trackClicks !== undefined ? emailData.trackClicks : true,
          },
        ],
      })

      await request
      return true
    } catch (error) {
      console.error("Error sending email with Mailjet:", error)
      throw error
    }
  },

  async sendBulkEmails(emailsData: EmailData[]): Promise<boolean> {
    try {
      if (!mailjet) {
        throw new Error("Mailjet client not initialized")
      }

      // Mailjetのバルク送信用にメッセージを変換
      const messages = emailsData.map((data) => ({
        From: data.from || {
          Email: process.env.SENDER_EMAIL || "noreply@example.com",
          Name: "CRM System",
        },
        To: data.to,
        Subject: data.subject,
        TextPart: data.textPart || "",
        HTMLPart: data.htmlPart,
        Attachments: data.attachments || [],
        CustomID: data.customId || "",
        TrackOpens: data.trackOpens !== undefined ? data.trackOpens : true,
        TrackClicks: data.trackClicks !== undefined ? data.trackClicks : true,
      }))

      const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: messages,
      })

      await request
      return true
    } catch (error) {
      console.error("Error sending bulk emails with Mailjet:", error)
      throw error
    }
  },

  // メール開封追跡用のHTMLを生成
  generateTrackableHtml(content: string, trackingId: string): string {
    // Mailjetは自動的に開封追跡を行うため、カスタムピクセルは不要
    // ただし、カスタムIDを使用して特定のメールを追跡する場合は、
    // APIリクエスト時にCustomIDを設定する
    return content
  },

  // Mailjetのイベント追跡APIからデータを取得
  async getEmailEvents(customId?: string): Promise<any> {
    try {
      if (!mailjet) {
        throw new Error("Mailjet client not initialized")
      }

      let request
      if (customId) {
        request = mailjet.get("eventcallbackurl", { version: "v3" }).request({
          CustomID: customId,
        })
      } else {
        request = mailjet.get("eventcallbackurl", { version: "v3" }).request()
      }

      const result = await request
      return result.body
    } catch (error) {
      console.error("Error fetching email events from Mailjet:", error)
      throw error
    }
  },
}


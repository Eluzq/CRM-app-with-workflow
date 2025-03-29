import { NextResponse } from "next/server"
import { mailjetService } from "@/lib/services/mailjet-service"
import { emailService } from "@/lib/services/email-service"
import { customerService } from "@/lib/services/customer-service"

export async function POST(request: Request) {
  try {
    const { emailData, trackOpens, recipients } = await request.json()

    // 送信先の顧客を取得
    let customerEmails: { email: string; name?: string }[] = []

    if (recipients === "all") {
      const customers = await customerService.getCustomers()
      customerEmails = customers.map((customer) => ({
        email: customer.email,
        name: customer.name,
      }))
    } else if (recipients === "active") {
      const customers = await customerService.getCustomersByStatus("アクティブ")
      customerEmails = customers.map((customer) => ({
        email: customer.email,
        name: customer.name,
      }))
    } else if (recipients === "inactive") {
      const customers = await customerService.getCustomersByStatus("休眠")
      customerEmails = customers.map((customer) => ({
        email: customer.email,
        name: customer.name,
      }))
    } else if (Array.isArray(recipients)) {
      customerEmails = recipients.map((email) => ({ email }))
    }

    if (customerEmails.length === 0) {
      return NextResponse.json({ success: false, error: "No recipients specified" }, { status: 400 })
    }

    // キャンペーン情報を保存
    const campaignId = await emailService.addCampaign({
      name: emailData.subject,
      subject: emailData.subject,
      content: emailData.html,
      recipients: customerEmails.map((c) => c.email).join(", "),
      sent: customerEmails.length,
      opened: 0,
      clicked: 0,
      date: new Date().toISOString().split("T")[0],
    })

    // メールを送信
    if (customerEmails.length <= 50) {
      // 少数の場合は一括送信
      await mailjetService.sendEmail({
        to: customerEmails,
        subject: emailData.subject,
        htmlPart: emailData.html,
        trackOpens,
        customId: campaignId,
      })
    } else {
      // 多数の場合はバッチ処理
      const batchSize = 50
      const batches = []

      for (let i = 0; i < customerEmails.length; i += batchSize) {
        const batch = customerEmails.slice(i, i + batchSize)
        batches.push({
          to: batch,
          subject: emailData.subject,
          htmlPart: emailData.html,
          trackOpens,
          customId: campaignId,
        })
      }

      await mailjetService.sendBulkEmails(batches)
    }

    return NextResponse.json({
      success: true,
      message: `Email sent to ${customerEmails.length} recipients`,
      campaignId,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}


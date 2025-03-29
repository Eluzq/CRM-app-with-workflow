import { NextResponse } from "next/server"
import { scheduleService } from "@/lib/services/schedule-service"
import { emailService } from "@/lib/services/email-service"
import { mailjetService } from "@/lib/services/mailjet-service"
import { customerService } from "@/lib/services/customer-service"

export async function GET() {
  try {
    // 送信予定のスケジュールを取得
    const pendingSchedules = await scheduleService.getPendingSchedules()

    if (pendingSchedules.length === 0) {
      return NextResponse.json({ success: true, message: "No pending schedules" })
    }

    const results = []

    // 各スケジュールを処理
    for (const schedule of pendingSchedules) {
      try {
        // テンプレートを取得
        const template = await emailService.getTemplate(schedule.templateId)

        if (!template) {
          throw new Error(`Template not found: ${schedule.templateId}`)
        }

        // 送信先の顧客を取得
        let customerEmails: { email: string; name?: string }[] = []

        if (schedule.recipients === "all") {
          const customers = await customerService.getCustomers()
          customerEmails = customers.map((customer) => ({
            email: customer.email,
            name: customer.name,
          }))
        } else if (schedule.recipients === "active") {
          const customers = await customerService.getCustomersByStatus("アクティブ")
          customerEmails = customers.map((customer) => ({
            email: customer.email,
            name: customer.name,
          }))
        } else if (schedule.recipients === "inactive") {
          const customers = await customerService.getCustomersByStatus("休眠")
          customerEmails = customers.map((customer) => ({
            email: customer.email,
            name: customer.name,
          }))
        } else {
          // カンマ区切りのメールアドレスリスト
          customerEmails = schedule.recipients.split(",").map((email) => ({
            email: email.trim(),
          }))
        }

        if (customerEmails.length === 0) {
          throw new Error("No recipients specified")
        }

        // キャンペーン情報を保存
        const campaignId = await emailService.addCampaign({
          name: template.subject,
          subject: template.subject,
          content: template.content,
          recipients: customerEmails.map((c) => c.email).join(", "),
          sent: customerEmails.length,
          opened: 0,
          clicked: 0,
          date: new Date().toISOString().split("T")[0],
        })

        // メールを送信
        await mailjetService.sendEmail({
          to: customerEmails,
          subject: template.subject,
          htmlPart: template.content,
          trackOpens: schedule.trackOpens,
          customId: campaignId,
        })

        // スケジュールを送信済みに更新
        await scheduleService.markAsSent(schedule.id)

        results.push({
          scheduleId: schedule.id,
          status: "sent",
          recipients: customerEmails.length,
        })
      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error)

        // エラー情報を保存
        await scheduleService.markAsFailed(schedule.id, error instanceof Error ? error.message : "Unknown error")

        results.push({
          scheduleId: schedule.id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error("Error processing scheduled emails:", error)
    return NextResponse.json({ success: false, error: "Failed to process scheduled emails" }, { status: 500 })
  }
}


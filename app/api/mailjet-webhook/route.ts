import { NextResponse } from "next/server"
import { emailService } from "@/lib/services/email-service"

export async function POST(request: Request) {
  try {
    const events = await request.json()

    // Mailjetからのイベントを処理
    for (const event of events) {
      // カスタムIDからキャンペーンを特定
      const campaignId = event.CustomID

      if (!campaignId) continue

      const campaign = await emailService.getCampaign(campaignId)
      if (!campaign) continue

      // イベントタイプに基づいて処理
      switch (event.event) {
        case "open":
          // 開封イベント
          await emailService.updateCampaign(campaignId, {
            opened: campaign.opened + 1,
          })
          break

        case "click":
          // クリックイベント
          await emailService.updateCampaign(campaignId, {
            clicked: campaign.clicked + 1,
          })
          break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing Mailjet webhook:", error)
    return NextResponse.json({ success: false, error: "Failed to process webhook" }, { status: 500 })
  }
}


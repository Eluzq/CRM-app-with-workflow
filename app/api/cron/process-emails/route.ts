import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    // 認証チェック（本番環境では適切な認証を実装してください）
    const { searchParams } = new URL(request.url)
    const authToken = searchParams.get("token")

    // 簡易的な認証（本番環境ではより安全な方法を使用してください）
    if (authToken !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // スケジュールされたメールを処理するAPIを呼び出す
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/process-scheduled`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json({ success: false, error: "Failed to process scheduled emails" }, { status: 500 })
  }
}


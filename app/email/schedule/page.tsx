"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Plus, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { scheduleService, type EmailSchedule } from "@/lib/services/schedule-service"
import { emailService, type EmailTemplate } from "@/lib/services/email-service"

export default function EmailSchedulePage() {
  const router = useRouter()
  const [schedules, setSchedules] = useState<EmailSchedule[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [schedulesData, templatesData] = await Promise.all([
        scheduleService.getSchedules(),
        emailService.getTemplates(),
      ])

      setSchedules(schedulesData)
      setTemplates(templatesData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("データの取得に失敗しました", {
        description: "スケジュールとテンプレートの取得中にエラーが発生しました。",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProcessScheduled = async () => {
    setRefreshing(true)
    try {
      const response = await fetch("/api/email/process-scheduled")
      const data = await response.json()

      if (data.success) {
        toast.success("スケジュール処理完了", {
          description: `${data.processed}件のスケジュールを処理しました。`,
        })
        // データを再取得
        fetchData()
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (error) {
      console.error("Error processing scheduled emails:", error)
      toast.error("スケジュール処理エラー", {
        description: "スケジュールされたメールの処理中にエラーが発生しました。",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    try {
      await scheduleService.deleteSchedule(id)
      setSchedules(schedules.filter((schedule) => schedule.id !== id))
      toast.success("スケジュールを削除しました")
    } catch (error) {
      console.error("Error deleting schedule:", error)
      toast.error("スケジュール削除エラー", {
        description: "スケジュールの削除中にエラーが発生しました。",
      })
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "sent":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "予定"
      case "sent":
        return "送信済"
      case "failed":
        return "失敗"
      default:
        return status
    }
  }

  const getTemplateName = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    return template ? template.name : "Unknown template"
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">メール配信スケジュール</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleProcessScheduled} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            今すぐ処理
          </Button>
          <Button onClick={() => router.push("/email/schedule/new")}>
            <Plus className="mr-2 h-4 w-4" />
            新規スケジュール
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>スケジュール一覧</CardTitle>
          <CardDescription>予定されているメール配信のスケジュール</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>読み込み中...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>テンプレート</TableHead>
                  <TableHead>送信先</TableHead>
                  <TableHead>予定日時</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead className="text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length > 0 ? (
                  schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>{getTemplateName(schedule.templateId)}</TableCell>
                      <TableCell>
                        {schedule.recipients === "all"
                          ? "全顧客"
                          : schedule.recipients === "active"
                            ? "アクティブ顧客"
                            : schedule.recipients === "inactive"
                              ? "休眠顧客"
                              : `${schedule.recipients.split(",").length}件`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {schedule.scheduledDate} {schedule.scheduledTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(schedule.status)}`}
                        >
                          {getStatusText(schedule.status)}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(schedule.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {schedule.status === "scheduled" && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSchedule(schedule.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      スケジュールがありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


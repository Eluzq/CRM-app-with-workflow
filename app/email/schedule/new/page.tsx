"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { scheduleService } from "@/lib/services/schedule-service"
import { emailService, type EmailTemplate } from "@/lib/services/email-service"

export default function NewSchedulePage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    templateId: "",
    recipients: "",
    scheduledDate: new Date().toISOString().split("T")[0] || "2023-01-01",
    scheduledTime: "09:00",
    trackOpens: true,
  })

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templatesData = await emailService.getTemplates().catch((err) => {
          console.error("Error fetching templates:", err)
          return []
        })
        setTemplates(templatesData)
      } catch (error) {
        console.error("Error fetching templates:", error)
        toast.error("テンプレートの取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.templateId ||
      !formData.recipients ||
      !formData.scheduledDate ||
      !formData.scheduledTime
    ) {
      toast.error("入力エラー", {
        description: "すべての必須項目を入力してください。",
      })
      return
    }

    setSubmitting(true)

    try {
      await scheduleService.addSchedule({
        ...formData,
        status: "scheduled",
      })

      toast.success("スケジュールを作成しました", {
        description: "指定した日時にメールが送信されます。",
      })

      router.push("/email/schedule")
    } catch (error) {
      console.error("Error creating schedule:", error)
      toast.error("スケジュール作成エラー", {
        description: "スケジュールの作成中にエラーが発生しました。",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">新規メール配信スケジュール</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>スケジュール情報</CardTitle>
            <CardDescription>メール配信のスケジュールを設定します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">スケジュール名</Label>
              <Input
                id="name"
                placeholder="例: 4月のニュースレター配信"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateId">メールテンプレート</Label>
              {loading ? (
                <p className="text-sm text-muted-foreground">テンプレート読み込み中...</p>
              ) : (
                <Select value={formData.templateId} onValueChange={(value) => handleSelectChange("templateId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="テンプレートを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id || ""} value={template.id || ""}>
                        {template.name || "名前なし"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipients">送信先</Label>
              <Select value={formData.recipients} onValueChange={(value) => handleSelectChange("recipients", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="送信先を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全顧客</SelectItem>
                  <SelectItem value="active">アクティブ顧客のみ</SelectItem>
                  <SelectItem value="inactive">休眠顧客のみ</SelectItem>
                  <SelectItem value="custom">カスタム選択</SelectItem>
                </SelectContent>
              </Select>
              {formData.recipients === "custom" && (
                <div className="mt-2">
                  <Input
                    id="customRecipients"
                    placeholder="メールアドレスをカンマ区切りで入力"
                    onChange={(e) => handleSelectChange("recipients", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">例: user1@example.com, user2@example.com</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">送信日</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">送信時間</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="trackOpens"
                checked={formData.trackOpens}
                onCheckedChange={(checked) => handleCheckboxChange("trackOpens", checked as boolean)}
              />
              <Label htmlFor="trackOpens">開封率を追跡する</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              キャンセル
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "保存中..." : "保存"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}


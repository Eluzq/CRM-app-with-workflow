"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, EyeOff, Clock, Send, FileText, Image, Link2, Loader2 } from "lucide-react"
import { type EmailTemplate, type EmailCampaign, emailService } from "@/lib/services/email-service"
import { toast } from "sonner"
import Link from "next/link"

export default function EmailPage() {
  const [selectedTab, setSelectedTab] = useState("compose")
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [emailForm, setEmailForm] = useState({
    recipients: "",
    subject: "",
    content: "",
    trackOpens: false,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const templatesData = await emailService.getTemplates()
        const campaignsData = await emailService.getCampaigns()

        setTemplates(templatesData)
        setCampaigns(campaignsData)
      } catch (error) {
        console.error("Error fetching email data:", error)
        toast.error("Firebaseのアクセス権限エラー", {
          description: "Firebaseのセキュリティルールを確認してください。一時的にデモデータを表示します。",
        })

        // Fallback to demo data if Firebase access fails
        setTemplates([
          { id: "1", name: "新製品のお知らせ", subject: "新製品のご案内", lastUsed: "2023/03/15", content: "" },
          { id: "2", name: "月次ニュースレター", subject: "4月のニュースレター", lastUsed: "2023/04/01", content: "" },
        ])

        setCampaigns([
          {
            id: "1",
            name: "4月キャンペーン",
            sent: 1250,
            opened: 780,
            clicked: 320,
            date: "2023/04/01",
            subject: "",
            content: "",
            recipients: "",
          },
          {
            id: "2",
            name: "新製品発表",
            sent: 2500,
            opened: 1800,
            clicked: 950,
            date: "2023/03/15",
            subject: "",
            content: "",
            recipients: "",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleEmailFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setEmailForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setEmailForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setEmailForm((prev) => ({ ...prev, [id]: checked }))
  }

  const handleSendEmail = async () => {
    if (!emailForm.recipients || !emailForm.subject || !emailForm.content) {
      toast.error("入力エラー", {
        description: "宛先、件名、本文は必須項目です。",
      })
      return
    }

    setSending(true)

    try {
      // Mailjetを使用してメールを送信
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailData: {
            subject: emailForm.subject,
            html: emailForm.content,
          },
          trackOpens: emailForm.trackOpens,
          recipients: emailForm.recipients,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("メールを送信しました", {
          description: data.message || "メールが正常に送信されました。",
        })

        // キャンペーン一覧を更新
        const updatedCampaigns = await emailService.getCampaigns()
        setCampaigns(updatedCampaigns)

        // フォームをリセット
        setEmailForm({
          recipients: "",
          subject: "",
          content: "",
          trackOpens: false,
        })
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error("メール送信エラー", {
        description: "メールの送信中にエラーが発生しました。Mailjetの設定を確認してください。",
      })
    } finally {
      setSending(false)
    }
  }

  const handleUseTemplate = (template: EmailTemplate) => {
    setEmailForm((prev) => ({
      ...prev,
      subject: template.subject,
      content: template.content,
    }))

    setSelectedTab("compose")

    toast.success("テンプレートを読み込みました", {
      description: `「${template.name}」を読み込みました。`,
    })
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">メール配信</h2>
        <div className="flex gap-2">
          <Link href="/email/template">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              テンプレート管理
            </Button>
          </Link>
          <Link href="/email/schedule">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              スケジュール管理
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">メール作成</TabsTrigger>
          <TabsTrigger value="templates">テンプレート</TabsTrigger>
          <TabsTrigger value="campaigns">配信履歴</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>新規メール作成</CardTitle>
              <CardDescription>顧客へのメールを作成して送信します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipients">宛先</Label>
                <Select value={emailForm.recipients} onValueChange={(value) => handleSelectChange("recipients", value)}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">件名</Label>
                <Input
                  id="subject"
                  placeholder="メールの件名を入力"
                  value={emailForm.subject}
                  onChange={handleEmailFormChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">本文</Label>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="content"
                  placeholder="メール本文を入力..."
                  className="min-h-[200px]"
                  value={emailForm.content}
                  onChange={handleEmailFormChange}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trackOpens"
                  checked={emailForm.trackOpens}
                  onCheckedChange={(checked) => handleCheckboxChange("trackOpens", checked as boolean)}
                />
                <Label htmlFor="trackOpens">開封率を追跡する</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                下書き保存
              </Button>
              <Button onClick={handleSendEmail} disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    送信中...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    送信
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>メールテンプレート</CardTitle>
              <Button>新規テンプレート</Button>
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
                      <TableHead>テンプレート名</TableHead>
                      <TableHead>件名</TableHead>
                      <TableHead>最終使用日</TableHead>
                      <TableHead className="text-right">アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.length > 0 ? (
                      templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{template.subject}</TableCell>
                          <TableCell>{template.lastUsed || "未使用"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              編集
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleUseTemplate(template)}>
                              使用
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          テンプレートがありません
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>配信履歴</CardTitle>
              <CardDescription>過去のメール配信キャンペーンと開封率</CardDescription>
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
                      <TableHead>キャンペーン名</TableHead>
                      <TableHead>送信数</TableHead>
                      <TableHead>開封数</TableHead>
                      <TableHead>クリック数</TableHead>
                      <TableHead>開封率</TableHead>
                      <TableHead>配信日</TableHead>
                      <TableHead className="text-right">詳細</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.length > 0 ? (
                      campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell>{campaign.sent}</TableCell>
                          <TableCell>{campaign.opened}</TableCell>
                          <TableCell>{campaign.clicked}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="mr-2">{Math.round((campaign.opened / campaign.sent) * 100)}%</span>
                              {campaign.opened / campaign.sent > 0.5 ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{campaign.date}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              詳細
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          配信履歴がありません
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


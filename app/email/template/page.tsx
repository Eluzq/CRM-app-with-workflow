"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Copy } from "lucide-react"
import { toast } from "sonner"
import { emailService, type EmailTemplate } from "@/lib/services/email-service"

export default function EmailTemplatePage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templatesData = await emailService.getTemplates()
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

  const handleDeleteTemplate = async (id: string) => {
    try {
      await emailService.deleteTemplate(id)
      setTemplates(templates.filter((template) => template.id !== id))
      toast.success("テンプレートを削除しました")
    } catch (error) {
      console.error("Error deleting template:", error)
      toast.error("テンプレートの削除に失敗しました")
    }
  }

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const newTemplate = {
        name: `${template.name} (コピー)`,
        subject: template.subject,
        content: template.content,
      }

      const id = await emailService.addTemplate(newTemplate)

      setTemplates([...templates, { ...newTemplate, id }])

      toast.success("テンプレートを複製しました")
    } catch (error) {
      console.error("Error duplicating template:", error)
      toast.error("テンプレートの複製に失敗しました")
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">メールテンプレート</h2>
        <Button onClick={() => router.push("/email/template/editor")}>
          <Plus className="mr-2 h-4 w-4" />
          新規テンプレート
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>テンプレート一覧</CardTitle>
          <CardDescription>保存されているメールテンプレート</CardDescription>
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
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/email/template/editor?id=${template.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
    </div>
  )
}


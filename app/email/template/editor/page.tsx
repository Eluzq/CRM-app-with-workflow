"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { emailService, type EmailTemplate } from "@/lib/services/email-service"
import {
  BlockEditor,
  AddBlockButton,
  BlockPreview,
  type EmailBlock,
  type BlockType,
} from "@/lib/email-editor/components"
import { createBlock, blocksToHtml } from "@/lib/email-editor/utils"

export default function EmailTemplateEditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("id")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("editor")
  const [template, setTemplate] = useState<EmailTemplate>({
    name: "",
    subject: "",
    content: "",
  })
  const [blocks, setBlocks] = useState<EmailBlock[]>([])
  const [htmlPreview, setHtmlPreview] = useState("")

  useEffect(() => {
    const fetchTemplate = async () => {
      if (templateId) {
        try {
          const templateData = await emailService.getTemplate(templateId)

          if (templateData) {
            setTemplate(templateData)

            // HTMLからブロックに変換する処理は複雑なため、
            // 新規テンプレートとして扱い、基本的なブロックを追加
            setBlocks([createBlock("header"), createBlock("text")])
          }
        } catch (error) {
          console.error("Error fetching template:", error)
          toast.error("テンプレートの取得に失敗しました")
        }
      } else {
        // 新規テンプレートの場合は基本的なブロックを追加
        setBlocks([createBlock("header"), createBlock("text")])
      }
      setLoading(false)
    }

    fetchTemplate()
  }, [templateId])

  // HTMLプレビューを更新 HTMLプレビューを更新
  useEffect(() => {
    const html = blocksToHtml(blocks)
    setHtmlPreview(html)

    // テンプレートのコンテンツも更新
    setTemplate((prev) => ({
      ...prev,
      content: html,
    }))
  }, [blocks])

  const handleAddBlock = (type: BlockType) => {
    const newBlock = createBlock(type)
    setBlocks([...blocks, newBlock])
  }

  const handleUpdateBlock = (index: number, updatedBlock: EmailBlock) => {
    const newBlocks = [...blocks]
    newBlocks[index] = updatedBlock
    setBlocks(newBlocks)
  }

  const handleDeleteBlock = (index: number) => {
    const newBlocks = [...blocks]
    newBlocks.splice(index, 1)
    setBlocks(newBlocks)
  }

  const handleSaveTemplate = async () => {
    if (!template.name || !template.subject) {
      toast.error("入力エラー", {
        description: "テンプレート名と件名は必須です。",
      })
      return
    }

    setSaving(true)

    try {
      if (templateId) {
        await emailService.updateTemplate(templateId, template)
        toast.success("テンプレートを更新しました")
      } else {
        await emailService.addTemplate(template)
        toast.success("テンプレートを作成しました")
      }

      router.push("/email/template")
    } catch (error) {
      console.error("Error saving template:", error)
      toast.error("テンプレートの保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">テンプレートエディタ</h2>
        </div>
        <div className="flex justify-center py-8">
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {templateId ? "テンプレート編集" : "新規テンプレート作成"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>テンプレート情報</CardTitle>
          <CardDescription>メールテンプレートの基本情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">テンプレート名</Label>
              <Input
                id="name"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                placeholder="例: 月次ニュースレター"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">メール件名</Label>
              <Input
                id="subject"
                value={template.subject}
                onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                placeholder="例: 4月のニュースレター"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">エディタ</TabsTrigger>
          <TabsTrigger value="preview">プレビュー</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>コンテンツエディタ</CardTitle>
              <CardDescription>ドラッグ＆ドロップでメールコンテンツを作成</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {blocks.map((block, index) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  onChange={(updatedBlock) => handleUpdateBlock(index, updatedBlock)}
                  onDelete={() => handleDeleteBlock(index)}
                />
              ))}

              <AddBlockButton onAdd={handleAddBlock} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>プレビュー</CardTitle>
              <CardDescription>メールの表示イメージ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 bg-white">
                <div className="max-w-[600px] mx-auto">
                  {blocks.map((block) => (
                    <BlockPreview key={block.id} block={block} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="html" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HTML</CardTitle>
              <CardDescription>生成されたHTMLコード</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="border rounded-md p-4 bg-muted overflow-auto max-h-[500px]">
                <code>{htmlPreview}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
        <Button onClick={handleSaveTemplate} disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  )
}


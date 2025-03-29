"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { customerService } from "@/lib/services/customer-service"
import { useToast } from "@/components/ui/toast-context"

export default function NewCustomerPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    status: "アクティブ",
    source: "ウェブサイト",
    address: "",
    notes: "",
    lastContact: new Date().toISOString().split("T")[0],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await customerService.addCustomer({
        ...formData,
        lastContact: formData.lastContact || new Date().toISOString().split("T")[0],
      })
      addToast({
        title: "顧客を追加しました",
        description: "新しい顧客情報が正常に保存されました。",
      })
      router.push("/customers")
    } catch (error) {
      console.error("Error adding customer:", error)
      addToast({
        title: "エラーが発生しました",
        description: "顧客情報の保存中にエラーが発生しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">新規顧客登録</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>顧客情報</CardTitle>
            <CardDescription>新しい顧客の基本情報を入力してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">氏名</Label>
                <Input id="name" placeholder="例: 山田太郎" required value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="例: yamada@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">会社名</Label>
                <Input
                  id="company"
                  placeholder="例: 株式会社サンプル"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input id="phone" placeholder="例: 03-1234-5678" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">ステータス</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="アクティブ">アクティブ</SelectItem>
                    <SelectItem value="休眠">休眠</SelectItem>
                    <SelectItem value="見込み客">見込み客</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">獲得経路</Label>
                <Select value={formData.source} onValueChange={(value) => handleSelectChange("source", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="獲得経路を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ウェブサイト">ウェブサイト</SelectItem>
                    <SelectItem value="紹介">紹介</SelectItem>
                    <SelectItem value="広告">広告</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">住所</Label>
              <Input id="address" placeholder="例: 東京都渋谷区..." value={formData.address} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">備考</Label>
              <Textarea
                id="notes"
                placeholder="顧客に関する追加情報..."
                className="min-h-32"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}


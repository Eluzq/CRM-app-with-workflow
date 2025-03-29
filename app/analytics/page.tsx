"use client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"

// クライアントサイドのみでレンダリングするChartsコンポーネント
const AnalyticsCharts = dynamic(() => import("@/components/analytics-charts"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-80">チャートを読み込み中...</div>,
})

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">分析</h2>
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="email">メール分析</TabsTrigger>
          <TabsTrigger value="customers">顧客分析</TabsTrigger>
          <TabsTrigger value="workflow">工程分析</TabsTrigger>
        </TabsList>

        <AnalyticsCharts />
      </Tabs>
    </div>
  )
}


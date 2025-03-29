"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ダミーデータ
const monthlyData = [
  { name: "1月", メール開封率: 65, 顧客対応数: 24 },
  { name: "2月", メール開封率: 59, 顧客対応数: 13 },
  { name: "3月", メール開封率: 80, 顧客対応数: 98 },
  { name: "4月", メール開封率: 81, 顧客対応数: 39 },
  { name: "5月", メール開封率: 56, 顧客対応数: 48 },
  { name: "6月", メール開封率: 55, 顧客対応数: 38 },
  { name: "7月", メール開封率: 40, 顧客対応数: 43 },
]

const customerSourceData = [
  { name: "ウェブサイト", value: 40 },
  { name: "紹介", value: 30 },
  { name: "広告", value: 20 },
  { name: "その他", value: 10 },
]

const COLORS = ["#FF0000", "#000000", "#AAAAAA", "#666666"]

export default function AnalyticsCharts() {
  return (
    <Tabs defaultValue="email" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="email">メール</TabsTrigger>
        <TabsTrigger value="customers">顧客</TabsTrigger>
        <TabsTrigger value="workflow">ワークフロー</TabsTrigger>
      </TabsList>
      <TabsContent value="email" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均開封率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">63.4%</div>
              <p className="text-xs text-muted-foreground">前月比 +5.2%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均クリック率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.8%</div>
              <p className="text-xs text-muted-foreground">前月比 +2.1%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">配信数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,789</div>
              <p className="text-xs text-muted-foreground">前月比 +1,234</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>メール開封率の推移</CardTitle>
            <CardDescription>月別のメール開封率と顧客対応数</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="メール開封率" stroke="#FF0000" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="顧客対応数" stroke="#000000" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="customers" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>顧客獲得経路</CardTitle>
              <CardDescription>顧客の獲得経路の内訳</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {customerSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>顧客ステータス</CardTitle>
              <CardDescription>顧客のステータス別分布</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "アクティブ", 顧客数: 1200 },
                    { name: "休眠", 顧客数: 800 },
                    { name: "見込み客", 顧客数: 500 },
                  ]}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="顧客数" fill="#FF0000" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="workflow" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>工程別タスク数</CardTitle>
            <CardDescription>各工程のタスク数と完了率</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "計画", 総タスク数: 45, 完了タスク数: 30 },
                  { name: "実行", 総タスク数: 60, 完了タスク数: 25 },
                  { name: "検証", 総タスク数: 35, 完了タスク数: 20 },
                  { name: "改善", 総タスク数: 25, 完了タスク数: 10 },
                ]}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="総タスク数" fill="#000000" />
                <Bar dataKey="完了タスク数" fill="#FF0000" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}


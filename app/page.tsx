"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Users, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { customerService } from "@/lib/services/customer-service"
import { emailService } from "@/lib/services/email-service"
import { taskService } from "@/lib/services/task-service"
import { useToast } from "@/components/ui/toast-context"

export default function Dashboard() {
  const { addToast } = useToast()
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalEmails: 0,
    openRate: 0,
    pendingTasks: 0,
  })

  const [emailStats, setEmailStats] = useState([])
  const [pieData, setPieData] = useState([
    { name: "開封済み", value: 0 },
    { name: "未開封", value: 0 },
  ])

  const [loading, setLoading] = useState(true)
  const COLORS = ["#FF0000", "#CCCCCC"]

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch customers
        const customers = await customerService.getCustomers()

        // Fetch campaigns
        const campaigns = await emailService.getCampaigns()

        // Fetch tasks
        const tasks = await taskService.getTasks()
        const pendingTasks = tasks.filter((task) => task.status !== "completed").length

        // Calculate total emails sent and open rate
        let totalSent = 0
        let totalOpened = 0

        campaigns.forEach((campaign) => {
          totalSent += campaign.sent
          totalOpened += campaign.opened
        })

        const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0

        // Set stats
        setStats({
          totalCustomers: customers.length,
          totalEmails: totalSent,
          openRate,
          pendingTasks,
        })

        // Create email stats for chart
        const weekdays = ["月", "火", "水", "木", "金", "土", "日"]
        const emailStatsData = weekdays.map((day) => ({
          name: day,
          送信数: 0,
          開封数: 0,
        }))

        // Add real data if available
        campaigns.forEach((campaign, index) => {
          if (index < 7) {
            emailStatsData[index].送信数 = campaign.sent
            emailStatsData[index].開封数 = campaign.opened
          }
        })

        setEmailStats(emailStatsData as any)

        // Set pie chart data
        setPieData([
          { name: "開封済み", value: openRate },
          { name: "未開封", value: 100 - openRate },
        ])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        addToast({
          title: "Error accessing Firebase",
          description: "Please check your Firebase security rules.",
          variant: "destructive",
        })

        // Set empty data
        setStats({
          totalCustomers: 0,
          totalEmails: 0,
          openRate: 0,
          pendingTasks: 0,
        })

        // Create empty email stats for chart
        const weekdays = ["月", "火", "水", "木", "金", "土", "日"]
        const emailStatsData = weekdays.map((day) => ({
          name: day,
          送信数: 0,
          開封数: 0,
        }))

        setEmailStats(emailStatsData as any)

        // Set empty pie chart data
        setPieData([
          { name: "開封済み", value: 0 },
          { name: "未開封", value: 0 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [addToast])

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
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
        <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">総顧客数</p>
                <h3 className="text-2xl font-bold">{stats.totalCustomers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">送信メール数</p>
                <h3 className="text-2xl font-bold">{stats.totalEmails}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">開封率</p>
                <h3 className="text-2xl font-bold">{stats.openRate}%</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-primary/10">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">未完了タスク</p>
                <h3 className="text-2xl font-bold">{stats.pendingTasks}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>メール配信状況</CardTitle>
              <CardDescription>過去7日間のメール送信数と開封数</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={emailStats}
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
                  <Bar dataKey="送信数" fill="#000000" />
                  <Bar dataKey="開封数" fill="#FF0000" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>メール開封率</CardTitle>
                <CardDescription>全体のメール開封状況</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
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
                <CardTitle>最近の活動</CardTitle>
                <CardDescription>直近の顧客対応とタスク</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">データがありません</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


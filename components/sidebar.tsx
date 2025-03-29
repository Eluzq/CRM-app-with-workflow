"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Mail, BarChart, Home, Calendar, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

const navItems = [
  { name: "ダッシュボード", href: "/", icon: Home },
  { name: "顧客管理", href: "/customers", icon: Users },
  {
    name: "メール配信",
    href: "/email",
    icon: Mail,
    children: [
      { name: "メール作成", href: "/email" },
      { name: "テンプレート", href: "/email/template" },
      { name: "スケジュール", href: "/email/schedule" },
    ],
  },
  { name: "分析", href: "/analytics", icon: BarChart },
  { name: "工程管理", href: "/workflow", icon: Calendar },
  { name: "設定", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    メール配信: true,
  })

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">CRM System</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.children && item.children.some((child) => pathname === child.href))
            const Icon = item.icon
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedItems[item.name]

            return (
              <li key={item.href}>
                {hasChildren ? (
                  <div>
                    <div
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer",
                        isActive ? "bg-primary text-primary-foreground" : "text-black hover:bg-muted",
                      )}
                      onClick={() => toggleExpand(item.name)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </div>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>

                    {isExpanded && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const childIsActive = pathname === child.href

                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                  childIsActive ? "bg-primary text-primary-foreground" : "text-black hover:bg-muted",
                                )}
                              >
                                <span>{child.name}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "text-black hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <div>
            <p className="text-sm font-medium">管理者</p>
            <p className="text-xs text-muted-foreground">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}


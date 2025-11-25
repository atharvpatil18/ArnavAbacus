'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function DashboardCharts() {
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch('/api/dashboard/revenue')
        if (res.ok) {
          const data = await res.json()
          setRevenueData(data)
        }
      } catch (error) {
        console.error('Failed to fetch revenue', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRevenue()
  }, [])

  return (
    <Card className="col-span-4 lg:col-span-7">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-sans">
          <DollarSign className="h-5 w-5 text-bead-green" />
          Revenue Trend (Last 6 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : revenueData.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            No revenue data available
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--bead-green)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--bead-green)" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '4px 4px 0px 0px var(--border)',
                  }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Bar
                  dataKey="revenue"
                  fill="url(#colorRevenue)"
                  stroke="var(--bead-green)"
                  strokeWidth={2}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

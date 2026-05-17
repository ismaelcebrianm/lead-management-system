"use client"

import { useEffect, useState, useMemo } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { type Lead, LEAD_STATUSES } from "@/lib/types"
import { RefreshCw, Users, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts"
import { cn } from "@/lib/utils"

const fetchLeads = async (): Promise<Lead[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

const COLORS = ["#8b5cf6", "#eab308", "#a855f7", "#22c55e", "#6b7280"]

export default function AnalyticsPage() {
  const { data: leads = [], mutate, isLoading } = useSWR<Lead[]>("leads-analytics", fetchLeads, {
    revalidateOnFocus: false,
  })

  // Status distribution data
  const statusData = useMemo(() => {
    return LEAD_STATUSES.map((status, index) => ({
      name: status.label,
      value: leads.filter((l) => l.status === status.value).length,
      color: COLORS[index],
    }))
  }, [leads])

  // Interest distribution data
  const interestData = useMemo(() => {
    const interests: Record<string, number> = {}
    leads.forEach((lead) => {
      if (lead.interest) {
        interests[lead.interest] = (interests[lead.interest] || 0) + 1
      }
    })
    return Object.entries(interests).map(([name, value]) => ({ name, value }))
  }, [leads])

  // Leads over time (last 30 days)
  const timelineData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split("T")[0]
    })

    return last30Days.map((date) => ({
      date: new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
      leads: leads.filter((l) => l.created_at.split("T")[0] === date).length,
    }))
  }, [leads])

  // Company/Dedicacion distribution
  const companyData = useMemo(() => {
    const companies: Record<string, number> = {}
    leads.forEach((lead) => {
      const company = lead.company || "Sin especificar"
      companies[company] = (companies[company] || 0) + 1
    })
    return Object.entries(companies)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [leads])

  // KPIs
  const totalLeads = leads.length
  const newLeads = leads.filter((l) => l.status === "nuevo").length
  const convertedLeads = leads.filter((l) => l.status === "convertido").length
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0"

  // Recent leads (last 7 days)
  const recentLeads = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return leads.filter((l) => new Date(l.created_at) >= sevenDaysAgo).length
  }, [leads])

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground">Metricas y estadisticas de leads</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => mutate()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              <span className="sr-only">Actualizar</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLeads}</div>
                  <p className="text-xs text-muted-foreground">
                    {recentLeads} nuevos esta semana
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads Nuevos</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{newLeads}</div>
                  <p className="text-xs text-muted-foreground">
                    Pendientes de contactar
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{convertedLeads}</div>
                  <p className="text-xs text-muted-foreground">
                    Clientes conseguidos
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Conversion</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{conversionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    De leads a clientes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribucion por Estado</CardTitle>
                  <CardDescription>Estado actual de todos los leads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Interest Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Nivel de IA</CardTitle>
                  <CardDescription>Distribucion por nivel de conocimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={interestData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Leads en el Tiempo</CardTitle>
                  <CardDescription>Ultimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="leads"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ fill: "#8b5cf6" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Company/Dedicacion Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Dedicaciones</CardTitle>
                  <CardDescription>Las 5 dedicaciones mas comunes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={companyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

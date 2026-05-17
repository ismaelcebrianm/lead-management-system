"use client"

import { useEffect, useState, useCallback } from "react"
import useSWR from "swr"
import { KanbanBoard } from "@/components/kanban"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { type Lead, LEAD_STATUSES } from "@/lib/types"
import { Search, RefreshCw, LayoutGrid, List } from "lucide-react"
import { LeadsList } from "@/components/leads-list"
import { Spinner } from "@/components/ui/spinner"

type ViewMode = "kanban" | "list"

const fetchLeads = async (): Promise<Lead[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export default function CRMPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")

  const { data: leads = [], mutate, isLoading } = useSWR<Lead[]>("leads", fetchLeads, {
    revalidateOnFocus: false,
  })

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      `${lead.nombre} ${lead.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.dedicacion && lead.dedicacion.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleRefresh = useCallback(() => {
    mutate()
  }, [mutate])

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Panel de Leads</h1>
              <p className="text-sm text-muted-foreground">Gestiona y organiza tus leads</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="sr-only">Actualizar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {LEAD_STATUSES.map((status) => {
            const count = leads.filter((l) => l.status === status.value).length
            return (
              <div
                key={status.value}
                className="bg-card rounded-lg p-4 border"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${status.color}`} />
                  <span className="text-sm text-muted-foreground">{status.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
              </div>
            )
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron leads</p>
          </div>
        ) : viewMode === "kanban" ? (
          <KanbanBoard leads={filteredLeads} onLeadsChange={handleRefresh} />
        ) : (
          <LeadsList leads={filteredLeads} onLeadsChange={handleRefresh} />
        )}
      </div>
    </div>
  )
}

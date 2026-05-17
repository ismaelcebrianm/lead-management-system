"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { type Lead, LEAD_STATUSES, getStatusInfo } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { MoreHorizontal, Trash2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeadsListProps {
  leads: Lead[]
  onLeadsChange: () => void
}

export function LeadsList({ leads, onLeadsChange }: LeadsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const supabase = createClient()
    await supabase.from("leads").update({ status: newStatus }).eq("id", leadId)
    onLeadsChange()
  }

  const handleDelete = async (leadId: string) => {
    const supabase = createClient()
    await supabase.from("leads").delete().eq("id", leadId)
    onLeadsChange()
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Dedicación</TableHead>
            <TableHead>Nivel IA</TableHead>
            <TableHead>Clasificación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Visitas</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const statusInfo = getStatusInfo(lead.status)
            return (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.nombre} {lead.apellido}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.dedicacion}</TableCell>
                <TableCell>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {lead.nivel_ia}
                  </span>
                </TableCell>
                <TableCell>{lead.clasificacion || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", statusInfo.color)} />
                    <span className="text-sm">{statusInfo.label}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {(lead.interacciones ?? 1) > 1 ? (
                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <RefreshCw className="h-2.5 w-2.5" />
                      {lead.interacciones}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">1</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(lead.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {LEAD_STATUSES.map((status) => (
                        <DropdownMenuItem
                          key={status.value}
                          onClick={() => handleStatusChange(lead.id, status.value)}
                          disabled={lead.status === status.value}
                        >
                          <div className={cn("w-2 h-2 rounded-full mr-2", status.color)} />
                          Mover a {status.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(lead.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type Lead, LEAD_STATUSES } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { MoreHorizontal, Mail, Calendar, GripVertical, Trash2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeadCardProps {
  lead: Lead
  isDragging?: boolean
  onUpdate?: () => void
}

export function LeadCard({ lead, isDragging, onUpdate }: LeadCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const handleStatusChange = async (newStatus: string) => {
    const supabase = createClient()
    await supabase.from("leads").update({ status: newStatus }).eq("id", lead.id)
    onUpdate?.()
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    await supabase.from("leads").delete().eq("id", lead.id)
    onUpdate?.()
    setIsDeleting(false)
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "cursor-grab active:cursor-grabbing bg-card hover:shadow-md transition-shadow",
          isDragging && "opacity-50 shadow-lg rotate-2"
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div
              {...attributes}
              {...listeners}
              className="mt-1 text-muted-foreground hover:text-foreground"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-foreground truncate">{lead.name}</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowDetails(true)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {LEAD_STATUSES.map((status) => (
                      <DropdownMenuItem
                        key={status.value}
                        onClick={() => handleStatusChange(status.value)}
                        disabled={lead.status === status.value}
                      >
                        <div className={cn("w-2 h-2 rounded-full mr-2", status.color)} />
                        Mover a {status.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Mail className="h-3 w-3" />
                <span className="truncate">{lead.email}</span>
              </div>
              {lead.nivel_ia && (
                <div className="mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {lead.nivel_ia}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(lead.created_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{lead.name}</DialogTitle>
            <DialogDescription>Detalles del lead</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-foreground">{lead.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dedicación</p>
                <p className="text-foreground">{lead.dedicacion}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nivel IA</p>
                <p className="text-foreground">{lead.nivel_ia}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cómo nos conoció</p>
                <p className="text-foreground">{lead.como_conocido || "No indicado"}</p>
              </div>
              {lead.clasificacion && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clasificación</p>
                <p className="text-foreground">{lead.clasificacion}</p>
              </div>
              )}
            </div>
            {lead.reto && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reto</p>
                <p className="text-foreground whitespace-pre-wrap">{lead.reto}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Creado</p>
                <p className="text-foreground">{formatDate(lead.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actualizado</p>
                <p className="text-foreground">{formatDate(lead.updated_at)}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

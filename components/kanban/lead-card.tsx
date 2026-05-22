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
import { type Lead, LEAD_STATUSES, getCanalBadge, getEstadoDemoBadge } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { MoreHorizontal, Mail, Calendar, GripVertical, Trash2, Eye, Phone, Building2, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeadCardProps {
  lead: Lead
  isDragging?: boolean
  onUpdate?: () => void
}

export function LeadCard({ lead, isDragging, onUpdate }: LeadCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id })

  const style = { transform: CSS.Transform.toString(transform), transition }

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

  const canalBadge = getCanalBadge(lead.canal)
  const demoBadge  = getEstadoDemoBadge(lead.estado_demo)

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
                <h4 className="font-medium text-foreground truncate">{lead.nombre} {lead.apellido || ""}</h4>
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

              {lead.nombre_negocio && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{lead.nombre_negocio}</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", canalBadge.classes)}>
                  {canalBadge.label}
                </span>
                {lead.nivel_ia && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {lead.nivel_ia}
                  </span>
                )}
              </div>

              {demoBadge && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", demoBadge.classes)}>
                    {demoBadge.label}
                  </span>
                  {lead.demo_fecha && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {lead.demo_fecha} · {lead.demo_hora}
                    </p>
                  )}
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
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{lead.nombre} {lead.apellido || ""}</DialogTitle>
            <DialogDescription>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", canalBadge.classes)}>
                {canalBadge.label}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Contacto */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Contacto</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{lead.email}</p>
                </div>
                {lead.telefono && (
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="text-sm text-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />{lead.telefono}
                    </p>
                  </div>
                )}
                {lead.nombre_negocio && (
                  <div>
                    <p className="text-xs text-muted-foreground">Negocio</p>
                    <p className="text-sm text-foreground">{lead.nombre_negocio}</p>
                  </div>
                )}
                {lead.tipo_negocio && (
                  <div>
                    <p className="text-xs text-muted-foreground">Sector</p>
                    <p className="text-sm text-foreground">{lead.tipo_negocio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cualificación */}
            {(lead.problema_principal || lead.servicio_recomendado || lead.clasificacion) && (
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cualificación</p>
                <div className="grid grid-cols-2 gap-3">
                  {lead.clasificacion && (
                    <div>
                      <p className="text-xs text-muted-foreground">Clasificación</p>
                      <p className="text-sm text-foreground">{lead.clasificacion}</p>
                    </div>
                  )}
                  {lead.servicio_recomendado && (
                    <div>
                      <p className="text-xs text-muted-foreground">Servicio recomendado</p>
                      <p className="text-sm text-foreground">{lead.servicio_recomendado}</p>
                    </div>
                  )}
                </div>
                {lead.problema_principal && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">Problema principal</p>
                    <p className="text-sm text-foreground">{lead.problema_principal}</p>
                  </div>
                )}
              </div>
            )}

            {/* Demo */}
            {lead.estado_demo && (
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Demo</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Estado</p>
                    {demoBadge && (
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", demoBadge.classes)}>
                        {demoBadge.label}
                      </span>
                    )}
                  </div>
                  {lead.demo_fecha && (
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha y hora</p>
                      <p className="text-sm text-foreground">{lead.demo_fecha} · {lead.demo_hora}</p>
                    </div>
                  )}
                </div>
                {lead.demo_url && (
                  <a
                    href={lead.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Unirse a la videollamada
                  </a>
                )}
              </div>
            )}

            {/* Datos formulario */}
            {(lead.dedicacion || lead.nivel_ia || lead.reto || lead.como_conocido) && (
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Datos del formulario</p>
                <div className="grid grid-cols-2 gap-3">
                  {lead.dedicacion && (
                    <div>
                      <p className="text-xs text-muted-foreground">Dedicación</p>
                      <p className="text-sm text-foreground">{lead.dedicacion}</p>
                    </div>
                  )}
                  {lead.nivel_ia && (
                    <div>
                      <p className="text-xs text-muted-foreground">Nivel IA</p>
                      <p className="text-sm text-foreground">{lead.nivel_ia}</p>
                    </div>
                  )}
                  {lead.como_conocido && (
                    <div>
                      <p className="text-xs text-muted-foreground">Cómo nos conoció</p>
                      <p className="text-sm text-foreground">{lead.como_conocido}</p>
                    </div>
                  )}
                </div>
                {lead.reto && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">Reto</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{lead.reto}</p>
                  </div>
                )}
              </div>
            )}

            {/* Meta */}
            <div className="border-t pt-3 grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Creado</p>
                <p className="text-sm text-foreground">{formatDate(lead.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actualizado</p>
                <p className="text-sm text-foreground">{formatDate(lead.updated_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Visitas</p>
                <p className="text-sm font-semibold text-foreground">{lead.interacciones ?? 1}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

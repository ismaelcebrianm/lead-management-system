"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { LeadCard } from "./lead-card"
import { type Lead, type LeadStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  status: { value: LeadStatus; label: string; color: string }
  leads: Lead[]
  onLeadsChange: () => void
}

export function KanbanColumn({ status, leads, onLeadsChange }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.value,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-[300px] w-[300px] bg-muted/50 rounded-lg p-3 transition-colors",
        isOver && "bg-primary/10 ring-2 ring-primary/20"
      )}
    >
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className={cn("w-3 h-3 rounded-full", status.color)} />
        <h3 className="font-semibold text-foreground">{status.label}</h3>
        <span className="ml-auto text-sm text-muted-foreground bg-background px-2 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>
      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-[200px]">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onUpdate={onLeadsChange} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

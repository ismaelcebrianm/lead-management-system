"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { LeadCard } from "./lead-card"
import { type Lead, type LeadStatus, LEAD_STATUSES } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface KanbanBoardProps {
  leads: Lead[]
  onLeadsChange: () => void
}

export function KanbanBoard({ leads, onLeadsChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getLeadsByStatus = useCallback(
    (status: LeadStatus) => {
      return leads.filter((lead) => lead.status === status)
    },
    [leads]
  )

  const activeLead = activeId ? leads.find((lead) => lead.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const leadId = active.id as string
    const newStatus = over.id as LeadStatus

    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.status === newStatus) return

    // Update in database
    const supabase = createClient()
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", leadId)

    if (!error) {
      onLeadsChange()
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STATUSES.map((status) => (
          <KanbanColumn
            key={status.value}
            status={status}
            leads={getLeadsByStatus(status.value)}
            onLeadsChange={onLeadsChange}
          />
        ))}
      </div>
      <DragOverlay>
        {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}

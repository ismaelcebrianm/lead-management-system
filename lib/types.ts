export interface Lead {
  id: string
  name: string
  nombre: string
  apellido: string
  email: string
  dedicacion: string
  nivel_ia: string
  reto: string | null
  como_conocido: string | null
  clasificacion: string | null
  status: LeadStatus
  notas: string | null
  created_at: string
  updated_at: string
}

export type LeadStatus = "nuevo" | "contactado" | "en_proceso" | "convertido" | "descartado"

export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: "nuevo", label: "Nuevo", color: "bg-blue-500" },
  { value: "contactado", label: "Contactado", color: "bg-yellow-500" },
  { value: "en_proceso", label: "En Proceso", color: "bg-purple-500" },
  { value: "convertido", label: "Convertido", color: "bg-green-500" },
  { value: "descartado", label: "Descartado", color: "bg-gray-500" },
]

export function getStatusInfo(status: LeadStatus) {
  return LEAD_STATUSES.find((s) => s.value === status) || LEAD_STATUSES[0]
}

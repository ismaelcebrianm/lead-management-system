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
  interacciones: number
  created_at: string
  updated_at: string
  // Campos nuevos — canal y datos chatbot
  canal: string | null
  telefono: string | null
  nombre_negocio: string | null
  tipo_negocio: string | null
  problema_principal: string | null
  servicio_recomendado: string | null
  demo_event_id: string | null
  demo_fecha: string | null
  demo_hora: string | null
  demo_url: string | null
  estado_demo: string | null
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

export function getCanalBadge(canal: string | null) {
  if (canal === "telegram") return { label: "Telegram", classes: "bg-sky-500/10 text-sky-500" }
  return { label: "Formulario", classes: "bg-indigo-500/10 text-indigo-500" }
}

export interface Prospecto {
  id: string
  created_at: string
  updated_at: string
  nombre_negocio: string
  nombre_decisor: string | null
  ubicacion: string | null
  correo: string | null
  telefono: string | null
  sector: string
  contactado: boolean
  interesado: boolean | null
  motivo_rechazo: string | null
  notas: string | null
}

export function getEstadoDemoBadge(estado: string | null) {
  if (estado === "CONFIRMADA") return { label: "Demo confirmada", classes: "bg-green-500/10 text-green-600" }
  if (estado === "CANCELADA")  return { label: "Demo cancelada",  classes: "bg-red-500/10 text-red-500" }
  if (estado === "REAGENDADA") return { label: "Reagendada",      classes: "bg-yellow-500/10 text-yellow-600" }
  return null
}

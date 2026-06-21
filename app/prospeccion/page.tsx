"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { type Prospecto } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { RefreshCw, Search, Building2, Phone, Mail, MapPin, User } from "lucide-react"

const fetchProspectos = async (): Promise<Prospecto[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("outbound_pipeline")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

function InteresadoBadge({ interesado }: { interesado: boolean | null }) {
  if (interesado === true)
    return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Interesado</Badge>
  if (interesado === false)
    return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">No interesado</Badge>
  return <Badge variant="outline" className="text-muted-foreground">Pendiente</Badge>
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear().toString().slice(-2)}`
}

export default function ProspeccionPage() {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Prospecto | null>(null)
  const [saving, setSaving] = useState(false)
  const [editState, setEditState] = useState<Partial<Prospecto>>({})

  const { data: prospectos = [], mutate, isLoading } = useSWR<Prospecto[]>(
    "outbound_pipeline",
    fetchProspectos,
    { revalidateOnFocus: false }
  )

  const filtered = prospectos.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.nombre_negocio.toLowerCase().includes(q) ||
      (p.nombre_decisor ?? "").toLowerCase().includes(q) ||
      (p.ubicacion ?? "").toLowerCase().includes(q) ||
      (p.correo ?? "").toLowerCase().includes(q)
    )
  })

  const updateContactado = useCallback(
    async (id: string, val: boolean) => {
      const supabase = createClient()
      await supabase.from("outbound_pipeline").update({ contactado: val }).eq("id", id)
      mutate()
    },
    [mutate]
  )

  const openSheet = (p: Prospecto) => {
    setSelected(p)
    setEditState({
      contactado: p.contactado,
      interesado: p.interesado,
      motivo_rechazo: p.motivo_rechazo ?? "",
      notas: p.notas ?? "",
    })
  }

  const saveSheet = async () => {
    if (!selected) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from("outbound_pipeline")
      .update({
        contactado: editState.contactado,
        interesado: editState.interesado ?? null,
        motivo_rechazo:
          editState.interesado === false ? editState.motivo_rechazo || null : null,
        notas: editState.notas || null,
      })
      .eq("id", selected.id)
    await mutate()
    setSaving(false)
    setSelected(null)
  }

  const stats = [
    { label: "Total", value: prospectos.length, color: "bg-blue-500" },
    { label: "Contactados", value: prospectos.filter((p) => p.contactado).length, color: "bg-yellow-500" },
    { label: "Interesados", value: prospectos.filter((p) => p.interesado === true).length, color: "bg-green-500" },
    { label: "No interesados", value: prospectos.filter((p) => p.interesado === false).length, color: "bg-gray-500" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Pipeline Outbound</h1>
              <p className="text-sm text-muted-foreground">
                Prospección activa · envía prospectos al bot @CorpoFitBot
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={() => mutate()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="relative w-full sm:w-[300px] mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar negocio, decisor, ubicación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {search
              ? "No hay resultados para esa búsqueda."
              : "Sin prospectos aún. Envía uno al bot @CorpoFitBot en Telegram."}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Negocio</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Decisor</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Ubicación</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Contacto</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Contactado</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Interesado</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${
                      i % 2 === 0 ? "" : "bg-muted/10"
                    }`}
                  >
                    <td className="px-4 py-3" onClick={() => openSheet(p)}>
                      <div className="font-medium text-foreground">{p.nombre_negocio}</div>
                      {p.sector && (
                        <div className="text-xs text-muted-foreground mt-0.5 capitalize">{p.sector}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell" onClick={() => openSheet(p)}>
                      {p.nombre_decisor || <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell" onClick={() => openSheet(p)}>
                      {p.ubicacion || <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell" onClick={() => openSheet(p)}>
                      <div className="text-muted-foreground text-xs space-y-0.5">
                        {p.telefono && <div>{p.telefono}</div>}
                        {p.correo && (
                          <div className="truncate max-w-[150px]">{p.correo}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={p.contactado}
                        onCheckedChange={(val) => updateContactado(p.id, val)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 py-3 text-center" onClick={() => openSheet(p)}>
                      <InteresadoBadge interesado={p.interesado} />
                    </td>
                    <td
                      className="px-4 py-3 text-right text-muted-foreground text-xs hidden sm:table-cell"
                      onClick={() => openSheet(p)}
                    >
                      {formatDate(p.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {selected.nombre_negocio}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-3 text-sm mb-6 pb-6 border-b">
                {selected.nombre_decisor && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 shrink-0" />
                    {selected.nombre_decisor}
                  </div>
                )}
                {selected.ubicacion && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {selected.ubicacion}
                  </div>
                )}
                {selected.telefono && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    {selected.telefono}
                  </div>
                )}
                {selected.correo && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    {selected.correo}
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <Label>Contactado</Label>
                  <Switch
                    checked={editState.contactado ?? false}
                    onCheckedChange={(v) => setEditState((s) => ({ ...s, contactado: v }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado de interés</Label>
                  <Select
                    value={
                      editState.interesado === true
                        ? "si"
                        : editState.interesado === false
                        ? "no"
                        : "pendiente"
                    }
                    onValueChange={(v) =>
                      setEditState((s) => ({
                        ...s,
                        interesado: v === "si" ? true : v === "no" ? false : null,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente de evaluar</SelectItem>
                      <SelectItem value="si">Interesado</SelectItem>
                      <SelectItem value="no">No interesado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editState.interesado === false && (
                  <div className="space-y-2">
                    <Label>Motivo de rechazo</Label>
                    <Input
                      placeholder="Ej: Sin presupuesto, ya tienen sistema..."
                      value={editState.motivo_rechazo ?? ""}
                      onChange={(e) =>
                        setEditState((s) => ({ ...s, motivo_rechazo: e.target.value }))
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea
                    placeholder="Notas adicionales..."
                    value={editState.notas ?? ""}
                    onChange={(e) => setEditState((s) => ({ ...s, notas: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button className="w-full" onClick={saveSheet} disabled={saving}>
                  {saving && <Spinner className="h-4 w-4 mr-2" />}
                  Guardar cambios
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

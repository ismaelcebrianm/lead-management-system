"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, Sparkles, Bot } from "lucide-react"

// URL del webhook de n8n - configura tu propia URL aqui
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ""

const dedicacionOptions = [
  { value: "estudiante", label: "Estudiante" },
  { value: "autonomo", label: "Autónomo" },
  { value: "empresa", label: "Empresa" },
  { value: "trabajador_cuenta_ajena", label: "Trabajador por cuenta ajena" },
]

const nivelIAOptions = [
  { value: "basico", label: "Nivel básico", description: "Apenas he usado herramientas de IA" },
  { value: "medio", label: "Nivel medio", description: "Genero documentos con IA y la uso para buscar información" },
  { value: "alto", label: "Nivel alto", description: "Conozco más o menos cómo funcionan las automatizaciones y agentes de IA" },
  { value: "profesional", label: "Nivel profesional", description: "He desarrollado algún agente de IA complejo" },
]

const comoConocidoOptions = [
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "referido", label: "Referido" },
  { value: "google", label: "Búsqueda en Google" },
  { value: "otro", label: "Otro" },
]

interface FormData {
  nombre: string
  apellido: string
  email: string
  dedicacion: string
  nivel_ia: string
  reto: string
  como_conocido: string
}

interface FormErrors {
  nombre?: string
  apellido?: string
  email?: string
  dedicacion?: string
  nivel_ia?: string
}

export function LeadCaptureForm() {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    dedicacion: "",
    nivel_ia: "",
    reto: "",
    como_conocido: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Por favor, introduce un email válido"
    }

    if (!formData.dedicacion) {
      newErrors.dedicacion = "Selecciona una opción"
    }

    if (!formData.nivel_ia) {
      newErrors.nivel_ia = "Selecciona tu nivel de IA"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (!N8N_WEBHOOK_URL) {
        throw new Error("Webhook URL no configurada")
      }

      // Enviar datos a n8n
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          source: "lead-capture-form",
        }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar el formulario")
      }

      setIsSuccess(true)
    } catch {
      setSubmitError("Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl border-primary/20">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            ¡Gracias por tu interés!
          </h2>
          <p className="text-muted-foreground text-lg">
            Hemos recibido tu información. Nos pondremos en contacto contigo pronto.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-primary/20">
      <CardHeader className="space-y-4 pb-8">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <Bot className="h-10 w-10 text-primary" />
            <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Marirrodriga I.A.
          </CardTitle>
        </div>
        <CardDescription className="text-center text-base">
          Completa el formulario y descubre cómo la inteligencia artificial puede transformar tu trabajo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-foreground">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className={errors.nombre ? "border-destructive" : ""}
              />
              {errors.nombre && (
                <p className="text-sm text-destructive">{errors.nombre}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido" className="text-foreground">
                Apellido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="apellido"
                type="text"
                placeholder="Tu apellido"
                value={formData.apellido}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                className={errors.apellido ? "border-destructive" : ""}
              />
              {errors.apellido && (
                <p className="text-sm text-destructive">{errors.apellido}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Dedicación */}
          <div className="space-y-2">
            <Label htmlFor="dedicacion" className="text-foreground">
              ¿A qué te dedicas? <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.dedicacion}
              onValueChange={(value) => handleInputChange("dedicacion", value)}
            >
              <SelectTrigger
                id="dedicacion"
                className={errors.dedicacion ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {dedicacionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dedicacion && (
              <p className="text-sm text-destructive">{errors.dedicacion}</p>
            )}
          </div>

          {/* Nivel IA */}
          <div className="space-y-2">
            <Label htmlFor="nivel_ia" className="text-foreground">
              ¿Cómo usas la IA hoy? <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.nivel_ia}
              onValueChange={(value) => handleInputChange("nivel_ia", value)}
            >
              <SelectTrigger
                id="nivel_ia"
                className={errors.nivel_ia ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Selecciona tu nivel" />
              </SelectTrigger>
              <SelectContent>
                {nivelIAOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.nivel_ia && (
              <p className="text-sm text-destructive">{errors.nivel_ia}</p>
            )}
          </div>

          {/* Optional: Reto */}
          <div className="space-y-2">
            <Label htmlFor="reto" className="text-foreground">
              ¿Cuál es tu mayor reto que te gustaría resolver con IA?{" "}
              <span className="text-muted-foreground text-sm">(opcional)</span>
            </Label>
            <Textarea
              id="reto"
              placeholder="Cuéntanos tu reto principal..."
              value={formData.reto}
              onChange={(e) => handleInputChange("reto", e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Optional: Cómo nos conociste */}
          <div className="space-y-2">
            <Label htmlFor="como_conocido" className="text-foreground">
              ¿Cómo nos has conocido?{" "}
              <span className="text-muted-foreground text-sm">(opcional)</span>
            </Label>
            <Select
              value={formData.como_conocido}
              onValueChange={(value) => handleInputChange("como_conocido", value)}
            >
              <SelectTrigger id="como_conocido">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {comoConocidoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error message */}
          {submitError && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{submitError}</p>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Enviando...
              </>
            ) : (
              "Enviar información"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

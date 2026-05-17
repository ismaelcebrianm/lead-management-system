import { LeadCaptureForm } from "@/components/lead-capture-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Automatiza tu negocio con{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Inteligencia Artificial
              </span>
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Únete a la revolución de la IA y descubre cómo podemos ayudarte a optimizar tus procesos
            </p>
          </div>

          {/* Form */}
          <LeadCaptureForm />

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Al enviar este formulario, aceptas que procesemos tu información para contactarte.
          </p>
        </div>
      </div>
    </main>
  )
}

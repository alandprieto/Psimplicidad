import { Button } from "@/components/ui/button"

export default function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Consultas</h1>
        <p className="text-muted-foreground text-sm">
          Sistema de administración para profesionales de la salud mental.
        </p>
        <div className="pt-4">
          <Button>Iniciar Sesión</Button>
        </div>
      </div>
    </main>
  )
}

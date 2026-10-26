import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (signUpError) throw signUpError;

        if (!data.session) {
          setError(
            "La cuenta se creó, pero Supabase requiere confirmar el correo. Para permitir el acceso sin confirmación, desactiva «Confirm email» en la configuración de autenticación de Supabase y vuelve a intentar.",
          );
          return;
        }
        if (!data.user) {
          throw new Error("No se pudo recuperar el usuario recién creado.");
        }

        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName.trim(),
        });
        if (profileError) {
          throw new Error(
            `La cuenta se creó, pero no se pudo guardar el perfil: ${profileError.message}`,
          );
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
      }

      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error. Inténtalo nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering((registering) => !registering);
    setError(null);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Psimplicidad
          </CardTitle>
          <CardDescription>
            Sistema de gestión profesional para psicólogos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive"
                role="alert"
              >
                {error}
              </div>
            )}
            {isRegistering && (
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="fullName"
                >
                  Nombre y apellido
                </label>
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="profesional@correo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none"
                htmlFor="password"
              >
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                autoComplete={
                  isRegistering ? "new-password" : "current-password"
                }
                minLength={isRegistering ? 6 : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {isRegistering && (
                <p className="text-xs text-muted-foreground">
                  Debe tener al menos 6 caracteres.
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? isRegistering
                  ? "Creando cuenta..."
                  : "Ingresando..."
                : isRegistering
                  ? "Crear cuenta"
                  : "Iniciar Sesión"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isRegistering ? "¿Ya tienes una cuenta?" : "¿Eres nuevo/a?"}{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={toggleMode}
            >
              {isRegistering ? "Inicia sesión" : "Regístrate"}
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

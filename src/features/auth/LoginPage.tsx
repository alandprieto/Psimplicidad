import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ARGENTINE_PROVINCES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseProvince, setLicenseProvince] = useState<string | null>(null);
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
        if (!licenseProvince) {
          throw new Error("Seleccioná la jurisdicción de tu matrícula.");
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              license_number: licenseNumber.trim(),
              license_province: licenseProvince,
            },
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
          license_number: licenseNumber.trim(),
          license_province: licenseProvince,
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
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
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
            {isRegistering && (
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="licenseNumber"
                >
                  Matrícula profesional
                </label>
                <Input
                  id="licenseNumber"
                  type="text"
                  placeholder="MP 12.345"
                  pattern="[A-Za-zÁÉÍÓÚÑáéíóúñ0-9 .,\-]{4,25}"
                  title="Entre 4 y 25 caracteres alfanuméricos (ej. MP 12.345)"
                  value={licenseNumber}
                  onChange={(event) => setLicenseNumber(event.target.value)}
                  required
                />
              </div>
            )}
            {isRegistering && (
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="licenseProvince"
                >
                  Jurisdicción de la matrícula
                </label>
                <Select
                  value={licenseProvince}
                  onValueChange={(value) => setLicenseProvince(value)}
                  required
                >
                  <SelectTrigger className="w-full" id="licenseProvince">
                    <SelectValue>
                      {licenseProvince ?? "Seleccioná la provincia"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ARGENTINE_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  La matrícula la emite el colegio de psicólogos de cada
                  jurisdicción.
                </p>
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

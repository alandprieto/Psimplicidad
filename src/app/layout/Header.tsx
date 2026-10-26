import { useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User as UserIcon } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const fullName = user?.user_metadata?.full_name;
  const displayName =
    typeof fullName === "string" && fullName.trim()
      ? fullName
      : user?.email;

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b bg-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="truncate text-sm font-medium text-muted-foreground">
        Panel de Administración
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden max-w-52 items-center gap-2 truncate text-sm font-medium text-foreground sm:flex">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{displayName}</span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </header>
  );
}

import { useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div className="text-sm font-medium text-muted-foreground">
        Panel de Administración
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-foreground font-medium">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <span>{user?.email}</span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </header>
  );
}

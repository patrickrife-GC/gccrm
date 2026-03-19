import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Upload, Command, MessageCircle, UserSearch } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/command-center", label: "Command Center", icon: Command },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { to: "/prospects", label: "Prospects", icon: UserSearch },
  { to: "/import", label: "Import", icon: Upload },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center gap-8">
          <Link to="/" className="font-semibold text-lg tracking-tight">
            <span className="text-accent">●</span> NetGraph
          </Link>
          <nav className="flex gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === to
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}

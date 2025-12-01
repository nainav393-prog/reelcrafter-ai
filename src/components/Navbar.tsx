import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Sparkles, LayoutDashboard, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink via-neon-purple to-neon-cyan flex items-center justify-center group-hover:shadow-[0_0_20px_hsl(var(--neon-pink)/0.4)] transition-shadow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">
            <span className="gradient-text">Reel</span>
            <span className="text-foreground">Gen</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2",
                location.pathname === "/dashboard" && "bg-secondary"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <Link to="/generate">
            <Button variant="neon" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Reel</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

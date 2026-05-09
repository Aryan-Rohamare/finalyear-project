import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Settings, Zap, Download, Share2, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const Header = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="glass-strong rounded-2xl h-16 px-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-primary)" }}
            >
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-background animate-pulse" />
          </div>
          <div className="leading-tight">
            <h1 className="font-bold text-lg tracking-tight text-rainbow">DroneForge</h1>
            <p className="text-[11px] text-muted-foreground tracking-wide uppercase">Design · Simulate</p>
          </div>
        </div>

        {/* Pill nav */}
        <nav className="flex items-center gap-1 p-1 rounded-full border border-white/10 bg-background/40 backdrop-blur-xl">
          <Link to="/">
            <Button
              variant={location.pathname === "/" ? "glow" : "ghost"}
              size="sm"
              className="gap-2 rounded-full px-4"
            >
              <Settings className="w-4 h-4" />
              Builder
            </Button>
          </Link>
          <Link to="/simulator">
            <Button
              variant={location.pathname === "/simulator" ? "glow" : "ghost"}
              size="sm"
              className="gap-2 rounded-full px-4"
            >
              <Zap className="w-4 h-4" />
              Simulator
            </Button>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-full border border-white/10 hover:border-primary/40 hover:bg-primary/10"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 rounded-full border border-white/10 hover:border-accent/40 hover:bg-accent/10"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            size="sm"
            className="gap-2 rounded-full text-primary-foreground border-0"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-primary)" }}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Settings, Zap, Download } from "lucide-react";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="h-16 border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center glow-primary">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-background" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground tracking-tight">DroneForge</h1>
            <p className="text-xs text-muted-foreground">Design & Simulate</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl border border-border/50">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "glow" : "ghost"}
              size="sm"
              className="gap-2 rounded-lg"
            >
              <Settings className="w-4 h-4" />
              Builder
            </Button>
          </Link>
          <Link to="/simulator">
            <Button 
              variant={location.pathname === "/simulator" ? "glow" : "ghost"}
              size="sm"
              className="gap-2 rounded-lg"
            >
              <Zap className="w-4 h-4" />
              Simulator
            </Button>
          </Link>
        </nav>

        <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>
    </header>
  );
};

export default Header;

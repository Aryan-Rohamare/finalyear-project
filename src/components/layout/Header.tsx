import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Settings, Zap } from "lucide-react";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center glow-primary">
            <Plane className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground tracking-tight">DroneForge</h1>
            <p className="text-xs text-muted-foreground">Design & Simulate</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "navActive" : "nav"}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Builder
            </Button>
          </Link>
          <Link to="/simulator">
            <Button 
              variant={location.pathname === "/simulator" ? "navActive" : "nav"}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Simulator
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="glow" size="sm">
            Export Design
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

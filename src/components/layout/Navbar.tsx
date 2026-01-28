import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, User, Settings, LogOut, Crown } from "lucide-react";

interface NavbarProps {
  showPresence?: React.ReactNode;
}

const Navbar = ({ showPresence }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const isPro = profile?.is_pro ?? false;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const isLandingPage = location.pathname === "/";

  return (
    <header className="relative z-10 flex items-center justify-between p-4 md:p-6">
      <button
        onClick={() => navigate("/")}
        className="text-lg font-semibold text-foreground/80 hover:text-foreground transition-calm"
      >
        focuu
      </button>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Presence indicator slot */}
        {showPresence}

        {/* Navigation links - hide Pricing for Pro users */}
        {!isPro && (
          <button
            onClick={() => navigate("/pricing")}
            className="text-sm text-muted-foreground hover:text-foreground transition-calm"
          >
            Pricing
          </button>
        )}

        {user ? (
          <>
            {/* Logged in user menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 group">
                  <Avatar className="h-8 w-8 border-2 border-primary/20 group-hover:border-primary/50 transition-calm">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isPro && (
                    <Crown className="w-4 h-4 text-primary" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">
                    {user.email}
                  </p>
                  {isPro && (
                    <p className="text-xs text-primary">Pro member</p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app")}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CTA for logged in users - go to work */}
            {isLandingPage && (
              <Button
                onClick={() => navigate("/work")}
                size="sm"
                className="group hidden md:flex"
              >
                Enter work mode
                <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            )}
          </>
        ) : (
          <>
            {/* Not logged in */}
            <button
              onClick={() => navigate("/auth")}
              className="text-sm text-muted-foreground hover:text-foreground transition-calm"
            >
              Sign in
            </button>

            {/* CTA for guests */}
            {isLandingPage && (
              <Button
                onClick={() => navigate("/work")}
                size="sm"
                className="group hidden md:flex"
              >
                Let's work
                <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;

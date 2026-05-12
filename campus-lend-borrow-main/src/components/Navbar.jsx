import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Menu, X, User, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const isLanding = location.pathname === "/";
  const navItems = isAuthenticated && !isLanding
    ? [
      { label: "Browse", path: "/browse" },
      { label: "My Items", path: "/my-items" },
      { label: "Track", path: "/track" },
      { label: "Profile", path: "/profile" },
    ]
    : [{ label: "Browse", path: "/browse" }];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/30"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center glow-sm">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <span className="font-heading font-bold text-lg text-foreground">
            Campus<span className="text-primary">Share</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign up
                </Button>
              </Link>
            </>
          ) : (
            <>
              {!isLanding && (
                <Link to="/add-resource">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
                    <Plus className="w-4 h-4" />
                    List Item
                  </Button>
                </Link>
              )}
              {user?.role === "admin" && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
              {!isLanding && (
                <Link to="/profile">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={logout}
              >
                Logout
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden glass-panel border-t border-border/30 px-4 pb-4"
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-sm text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <div className="flex gap-2 mt-3">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Log in</Button>
              </Link>
              <Link to="/signup" className="flex-1">
                <Button size="sm" className="w-full bg-primary text-primary-foreground">Sign up</Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-2 mt-3">
              {!isLanding && (
                <Link to="/add-resource" className="flex-1">
                  <Button size="sm" className="w-full bg-primary text-primary-foreground">List Item</Button>
                </Link>
              )}
              <Button variant="outline" size="sm" className="flex-1 w-full" onClick={logout}>Logout</Button>
            </div>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;

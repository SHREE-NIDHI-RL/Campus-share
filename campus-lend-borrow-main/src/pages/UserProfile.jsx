import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { ShieldCheck, Star, Package, Clock, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { userService } from "@/services/userService";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const UserProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    userService
      .getPublic(id)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 max-w-3xl space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="surface-elevated rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 max-w-3xl">
          <p className="text-muted-foreground">User not found.</p>
        </div>
      </div>
    );
  }

  const { user, stats, ratings = [] } = data;
  const initials = user?.full_name?.split(" ").map((n) => n[0]).join("") || "?";
  const trustScore = parseFloat(user?.trust_score || 0);
  const tier = trustScore >= 80 ? "Gold" : trustScore >= 50 ? "Silver" : "Bronze";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <Link to="/browse" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-elevated rounded-xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/15 mx-auto flex items-center justify-center glow-sm mb-4">
            <span className="font-heading text-2xl font-bold text-primary">{initials}</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-surface-foreground">{user.full_name}</h1>
          <p className="text-sm text-surface-foreground/60 mt-1">{user.department || "Student"}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            {user.is_verified && <ShieldCheck className="w-4 h-4 text-primary" />}
            <span className="text-xs text-primary font-medium">
              {user.is_verified ? "Verified Student" : "Community Member"} · Member since {fmt(user.created_at)}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: Star, label: "Rating", value: `${parseFloat(user.rating || 0).toFixed(1)}/5`, color: "text-secondary" },
            { icon: Package, label: "Listings", value: stats?.listingsCount ?? "—", color: "text-primary" },
            { icon: Clock, label: "Borrowed", value: user.borrow_count || 0, color: "text-info" },
            { icon: ShieldCheck, label: "Trust Level", value: tier, color: "text-secondary" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="surface-elevated rounded-xl p-4 text-center"
            >
              <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
              <div className="font-heading font-bold text-surface-foreground text-sm">{s.value}</div>
              <div className="text-xs text-surface-foreground/60">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="surface-elevated rounded-xl p-6 mt-6">
          <h2 className="font-heading font-semibold text-surface-foreground mb-3">Community Trust</h2>
          <Progress value={trustScore} className="h-2.5 mb-2" />
          <div className="flex justify-between text-xs text-surface-foreground/60">
            <span>{trustScore.toFixed(0)}% trust score</span>
            <span>{tier} tier</span>
          </div>
          <p className="text-xs text-surface-foreground/60 mt-3">
            Based on {user.borrow_count || 0} successful borrows and {stats?.ratingsCount ?? ratings.length} ratings.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;


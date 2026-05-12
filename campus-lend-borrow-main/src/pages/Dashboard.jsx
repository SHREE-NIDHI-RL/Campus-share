import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { Package, Clock, ArrowUpRight, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { resourceService } from "@/services/resourceService";
import { borrowService } from "@/services/borrowService";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [lent, setLent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      resourceService.getMine(),
      borrowService.getMyBorrows(),
      borrowService.getMyLentItems(),
    ]).then(([l, b, lt]) => {
      setListings(l.resources || []);
      setBorrows(b.borrows || []);
      setLent(lt.borrows || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeBorrows = borrows.filter((b) => ["active", "return-due", "extension-requested", "extension-approved"].includes(b.status));
  const lentOut = lent.filter((b) => b.status === "active");

  const daysLeft = (b) => {
    const due = new Date(b.extended_due_date || b.due_date);
    const diff = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your listings and borrows</p>
          </motion.div>
          <Link to="/add-resource">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              <Plus className="w-4 h-4" />
              List Item
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Package, label: "My Listings", value: listings.length, color: "text-primary" },
            { icon: Clock, label: "Active Borrows", value: activeBorrows.length, color: "text-secondary" },
            { icon: ArrowUpRight, label: "Lent Out", value: lentOut.length, color: "text-info" },
            { icon: TrendingUp, label: "Trust Score", value: user ? parseFloat(user.trust_score || 0).toFixed(1) : "—", color: "text-success" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="surface-elevated rounded-xl p-5"
            >
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <div className="font-heading text-2xl font-bold text-surface-foreground">{s.value}</div>
              <div className="text-xs text-surface-foreground/60">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <section className="mb-10">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">My Listings</h2>
          {loading ? (
            <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="surface-elevated rounded-xl h-20 animate-pulse" />)}</div>
          ) : listings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No listings yet. <Link to="/add-resource" className="text-primary hover:underline">List your first item</Link></p>
          ) : (
            <div className="space-y-3">
              {listings.map((item) => (
                <div key={item.id} className="surface-elevated rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-surface-foreground">{item.title}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-surface-foreground/60">{item.views_count} views · {item.request_count} requests</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">My Borrows</h2>
          {loading ? (
            <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="surface-elevated rounded-xl h-20 animate-pulse" />)}</div>
          ) : activeBorrows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active borrows.</p>
          ) : (
            <div className="space-y-3">
              {activeBorrows.map((item) => {
                const dl = daysLeft(item);
                const progress = item.duration_days > 0 ? ((item.duration_days - dl) / item.duration_days) * 100 : 100;
                return (
                  <div key={item.id} className="surface-elevated rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-surface-foreground">{item.resource_title}</h3>
                        <StatusBadge status={item.status} daysLeft={dl} />
                      </div>
                      <p className="text-xs text-surface-foreground/60">Owner: {item.owner_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <Progress value={progress} className="h-1.5" />
                        <p className="text-xs text-surface-foreground/60 mt-1">{dl}d remaining</p>
                      </div>
                      {item.status === "return-due" && (
                        <Button size="sm" variant="outline" className="text-xs border-secondary/30 text-secondary hover:bg-secondary/10">
                          Request Extension
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

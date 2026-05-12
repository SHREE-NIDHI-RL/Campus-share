import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { ShieldCheck, Star, Package, Clock, Award, Edit, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { profileService } from "@/services/adminService";

const Profile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileService.get()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 max-w-3xl space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="surface-elevated rounded-xl h-24 animate-pulse" />)}
      </div>
    </div>
  );

  const { user, ratings = [], borrows = [], listings = [] } = data || {};
  const initials = user?.full_name?.split(" ").map((n) => n[0]).join("") || "?";
  const trustScore = parseFloat(user?.trust_score || 0);
  const tier = trustScore >= 80 ? "Gold" : trustScore >= 50 ? "Silver" : "Bronze";

  const recentActivity = [
    ...borrows.slice(0, 3).map((b) => ({
      action: "Borrowed",
      item: b.resource_title,
      to: b.owner_name,
      date: new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    })),
  ];

  const approvedContacts = borrows
    .filter((b) => b.owner_email || b.owner_phone)
    .map((b) => ({
      id: b.id,
      ownerName: b.owner_name,
      ownerEmail: b.owner_email,
      ownerPhone: b.owner_phone,
      resourceTitle: b.resource_title,
      requestType: b.request_type === "buy" ? "Buy" : "Rent",
      status: b.status,
    }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-elevated rounded-xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/15 mx-auto flex items-center justify-center glow-sm mb-4">
            <span className="font-heading text-2xl font-bold text-primary">{initials}</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-surface-foreground">{user?.full_name}</h1>
          <p className="text-sm text-surface-foreground/60 mt-1">{user?.department || "Student"}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-medium">Verified Student · {user?.email}</span>
          </div>
          <Button variant="ghost" size="sm" className="mt-4 text-surface-foreground/60 gap-1.5">
            <Edit className="w-3.5 h-3.5" />
            Edit Profile
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: Star, label: "Rating", value: `${parseFloat(user?.rating || 0).toFixed(1)}/5`, color: "text-secondary" },
            { icon: Package, label: "Listed", value: `${listings.length} items`, color: "text-primary" },
            { icon: Clock, label: "Borrowed", value: `${user?.borrow_count || 0} times`, color: "text-info" },
            { icon: Award, label: "Trust Level", value: tier, color: "text-secondary" },
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
            Based on {user?.borrow_count || 0} successful borrows, {listings.length} listings, and {parseFloat(user?.rating || 0).toFixed(1)} avg rating.
          </p>
        </motion.div>

        {recentActivity.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="surface-elevated rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-surface-foreground">
                      <span className="text-surface-foreground/60">{a.action}</span> {a.item}
                    </p>
                    <p className="text-xs text-surface-foreground/60 mt-0.5">From {a.to} · {a.date}</p>
                  </div>
                  <div className="flex items-center gap-1 text-secondary text-xs">
                    <Star className="w-3.5 h-3.5 fill-secondary" />
                    {parseFloat(user?.rating || 0).toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {approvedContacts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-6">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Approved Owner Contacts</h2>
            <div className="space-y-3">
              {approvedContacts.map((c) => (
                <div key={c.id} className="surface-elevated rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-surface-foreground font-medium">{c.ownerName}</p>
                      <p className="text-xs text-surface-foreground/60 mt-0.5">
                        {c.requestType} · {c.resourceTitle}
                      </p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wide">{c.status}</span>
                  </div>
                  <div className="mt-3 grid sm:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/40 p-3 text-xs">
                      <div className="text-muted-foreground mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        Phone
                      </div>
                      <div className="text-surface-foreground font-medium">{c.ownerPhone || "Not shared"}</div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3 text-xs">
                      <div className="text-muted-foreground mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </div>
                      <div className="text-surface-foreground font-medium break-all">{c.ownerEmail || "Not shared"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, ArrowRight, Package, ShoppingBag } from "lucide-react";
import { borrowService } from "@/services/borrowService";
import { toast } from "@/components/ui/sonner";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const daysLeft = (item) => {
  if (!item.extended_due_date && !item.due_date) return null;
  const due = new Date(item.extended_due_date || item.due_date);
  if (isNaN(due.getTime())) return null;
  return Math.max(0, Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24)));
};

const ACTIVE = ["pending", "active", "return-due", "extension-requested", "extension-approved"];

const BorrowTracking = () => {
  const [tab, setTab] = useState("borrowing");
  const [borrows, setBorrows] = useState([]);
  const [lent, setLent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const load = async () => {
    setError(null);
    try {
      const [borrowData, lentData] = await Promise.all([
        borrowService.getMyBorrows(),
        borrowService.getMyLentItems(),
      ]);
      setBorrows((borrowData.borrows || []).filter((b) => ACTIVE.includes(b.status)));
      setLent((lentData.borrows || []).filter((b) => ACTIVE.includes(b.status)));
    } catch (err) {
      console.error("Track load error:", err);
      setError(err?.message || "Failed to load tracking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleBorrowerAction = async (action, borrowId) => {
    setActionLoading((p) => ({ ...p, [borrowId]: true }));
    try {
      if (action === "return") await borrowService.markReturned(borrowId);
      if (action === "extend") await borrowService.requestExtension(borrowId, 7);
      toast.success("Updated");
      await load();
    } catch (err) {
      toast.error("Action failed", { description: err?.message });
    } finally {
      setActionLoading((p) => ({ ...p, [borrowId]: false }));
    }
  };

  const handleOwnerAction = async (action, borrowId) => {
    setActionLoading((p) => ({ ...p, [borrowId]: true }));
    try {
      if (action === "approve") await borrowService.approve(borrowId);
      if (action === "reject") await borrowService.reject(borrowId);
      if (action === "approve-extension") await borrowService.approveExtension(borrowId);
      toast.success(action === "approve" ? "Request approved" : action === "reject" ? "Request rejected" : "Extension approved");
      await load();
    } catch (err) {
      toast.error("Action failed", { description: err?.message });
    } finally {
      setActionLoading((p) => ({ ...p, [borrowId]: false }));
    }
  };

  const items = tab === "borrowing" ? borrows : lent;

  useEffect(() => {
    console.log("Tab:", tab);
    console.log("Borrowing items:", borrows);
    console.log("Lending items:", lent);
    console.log("Current items:", items);
  }, [tab, borrows, lent, items]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-heading text-3xl font-bold text-foreground">Track</h1>
          <p className="text-muted-foreground mt-1">Manage your active rentals and listing requests</p>
        </motion.div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setTab("borrowing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "borrowing" ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Borrowed by me
            {borrows.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs">{borrows.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab("lending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "lending" ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="w-4 h-4" />
            Lent by me (owner view)
            {lent.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs">{lent.length}</span>
            )}
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              Error: {error}
            </div>
          )}
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="surface-elevated rounded-xl h-36 animate-pulse" />)
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              {tab === "borrowing" ? "No active rentals or purchases." : "No pending requests on your listings."}
            </p>
          ) : (items && items.length > 0) ? items.map((item, i) => {
            try {
              if (!item || !item.id) {
                console.error("Invalid item at index", i, item);
                return null;
              }
              const dl = item.due_date ? daysLeft(item) : null;
              const progress = item.duration_days > 0 && dl !== null
                ? ((item.duration_days - dl) / item.duration_days) * 100
                : 0;
              const isBuy = (item.request_type || 'rent') === "buy";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="surface-elevated rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold text-surface-foreground">{item.resource_title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isBuy ? "bg-secondary/15 text-secondary" : "bg-primary/10 text-primary"}`}>
                        {isBuy ? "Buy" : "Rent"}
                      </span>
                    </div>
                    {tab === "borrowing" ? (
                      <p className="text-xs text-surface-foreground/60 mt-0.5">From {item.owner_name}</p>
                    ) : (
                      <p className="text-xs text-surface-foreground/60 mt-0.5">
                        Requested by <span className="font-medium text-surface-foreground">{item.borrower_name}</span>
                        {item.duration_days ? ` · ${item.duration_days} days` : ""}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={item.status} daysLeft={dl ?? undefined} />
                </div>

                {item.status !== "pending" && item.due_date && (
                  <div className="space-y-3">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-surface-foreground/70">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fmt(item.created_at)}
                      </span>
                      <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.status === "extension-approved" && item.extended_due_date ? (
                          <span>
                            <span className="line-through mr-1">{fmt(item.due_date)}</span>
                            <span className="text-primary font-medium">{fmt(item.extended_due_date)}</span>
                          </span>
                        ) : fmt(item.due_date)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  {/* Borrower actions */}
                  {tab === "borrowing" && item.status === "return-due" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                        onClick={() => handleBorrowerAction("return", item.id)}
                        disabled={actionLoading[item.id]}
                      >
                        Mark as Returned
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-secondary/30 text-secondary hover:bg-secondary/10"
                        onClick={() => handleBorrowerAction("extend", item.id)}
                        disabled={actionLoading[item.id]}
                      >
                        Request Extension
                      </Button>
                    </>
                  )}
                  {tab === "borrowing" && item.status === "pending" && (
                    <span className="text-xs text-surface-foreground/60 italic">Waiting for owner approval...</span>
                  )}
                  {tab === "borrowing" && item.status === "extension-requested" && (
                    <span className="text-xs text-surface-foreground/60 italic">Extension requested — waiting for owner...</span>
                  )}
                  {tab === "borrowing" && item.status === "extension-approved" && (
                    <span className="text-xs text-success font-medium">Extension approved! New due date set.</span>
                  )}

                  {/* Owner actions */}
                  {tab === "lending" && item.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700 text-xs"
                        onClick={() => handleOwnerAction("approve", item.id)}
                        disabled={actionLoading[item.id]}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => handleOwnerAction("reject", item.id)}
                        disabled={actionLoading[item.id]}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {tab === "lending" && item.status === "extension-requested" && (
                    <Button
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700 text-xs"
                      onClick={() => handleOwnerAction("approve-extension", item.id)}
                      disabled={actionLoading[item.id]}
                    >
                      Approve Extension
                    </Button>
                  )}
                  {tab === "lending" && item.status === "active" && (
                    <span className="text-xs text-success font-medium">
                      {isBuy ? "Purchase approved — item marked sold" : "Active — item is with borrower"}
                    </span>
                  )}
                  {tab === "lending" && item.status === "return-due" && (
                    <span className="text-xs text-orange-400 font-medium">Return due — waiting for borrower</span>
                  )}
                </div>
              </motion.div>
            );
            } catch (renderErr) {
              console.error("Error rendering item:", renderErr, item);
              return (
                <div key={item?.id || i} className="surface-elevated rounded-xl p-4 bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">Error displaying item. Check console for details.</p>
                </div>
              );
            }
          }) : null}
        </div>
      </div>
    </div>
  );
};

export default BorrowTracking;

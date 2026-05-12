import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users, Package, ArrowUpDown, BarChart3, Search,
  ShieldCheck, Ban, Eye, Star, Trash2, Clock, AlertTriangle, TrendingUp,
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { borrowService } from "@/services/borrowService";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [a, u, r, t] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getUsers(),
        adminService.getResources(),
        adminService.getTransactions(),
      ]);
      setAnalytics(a);
      setUsers(u.users || []);
      setResources(r.resources || []);
      setTransactions(t.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleBlock = async (userId) => {
    try {
      await adminService.blockUser(userId);
      await load();
    } catch (err) { console.error(err); }
  };

  const handleDeleteResource = async (id) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await adminService.deleteResource(id);
      await load();
    } catch (err) { console.error(err); }
  };

  const handleApproveExtension = async (borrowId) => {
    try {
      await borrowService.approveExtension(borrowId);
      await load();
    } catch (err) { console.error(err); }
  };

  const filteredUsers = users.filter(
    (u) => u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredResources = resources.filter(
    (r) => r.title?.toLowerCase().includes(resourceSearch.toLowerCase()) || r.owner_name?.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  const daysLeft = (tx) => {
    if (!tx.due_date) return 0;
    return Math.ceil((new Date(tx.due_date) - new Date()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-destructive/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-destructive" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground mt-1 ml-12">Manage users, resources, transactions and analytics</p>
        </motion.div>

        <Tabs defaultValue="analytics" className="mt-8">
          <TabsList className="bg-card border border-border/50 mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="analytics" className="gap-1.5 text-xs"><BarChart3 className="w-3.5 h-3.5" />Analytics</TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" />Users</TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5 text-xs"><Package className="w-3.5 h-3.5" />Resources</TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1.5 text-xs"><ArrowUpDown className="w-3.5 h-3.5" />Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Users", value: analytics?.totalUsers ?? "—", icon: Users, color: "text-primary" },
                { label: "Total Listings", value: analytics?.totalListings ?? "—", icon: Package, color: "text-secondary" },
                { label: "Active Borrows", value: analytics?.activeBorrows ?? "—", icon: Clock, color: "text-info" },
                { label: "Overdue Items", value: analytics?.overdueItems ?? "—", icon: AlertTriangle, color: "text-destructive" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="surface-elevated rounded-xl p-5">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <div className="font-heading text-2xl font-bold text-surface-foreground">{s.value}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-surface-foreground/60">{s.label}</span>
                    <span className="text-xs text-success font-medium flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /></span>
                  </div>
                </motion.div>
              ))}
            </div>

            <h3 className="font-heading font-semibold text-foreground mb-4">Category Usage</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(analytics?.categoryStats || []).map((cat, i) => (
                <motion.div key={cat.category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="surface-elevated rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-surface-foreground">{cat.category}</span>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                    <span className="font-heading text-xl font-bold text-surface-foreground">{cat.total}</span>
                    <span className="text-xs text-surface-foreground/60">{cat.active} active</span>
                  </div>
                  <Progress value={cat.total > 0 ? (cat.active / cat.total) * 100 : 0} className="h-1.5" />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="relative mb-4 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-10 bg-card border-border/50 text-foreground" />
            </div>
            <div className="surface-elevated rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-surface-foreground/70">User</TableHead>
                    <TableHead className="text-surface-foreground/70">Department</TableHead>
                    <TableHead className="text-surface-foreground/70 text-center">Rating</TableHead>
                    <TableHead className="text-surface-foreground/70 text-center">Borrows</TableHead>
                    <TableHead className="text-surface-foreground/70 text-center">Status</TableHead>
                    <TableHead className="text-surface-foreground/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-border/20">
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-surface-foreground text-sm">{user.full_name}</span>
                            {user.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <span className="text-xs text-surface-foreground/60">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-surface-foreground/70">{user.department || "—"}</TableCell>
                      <TableCell className="text-center">
                        <span className="flex items-center justify-center gap-1 text-sm text-secondary">
                          <Star className="w-3.5 h-3.5 fill-secondary" />{parseFloat(user.rating || 0).toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm text-surface-foreground/70">{user.borrow_count}</TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.is_blocked ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
                          {user.is_blocked ? "Blocked" : "Active"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-surface-foreground/60 hover:text-surface-foreground">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className={`h-8 w-8 p-0 ${user.is_blocked ? "text-success/70 hover:text-success" : "text-destructive/70 hover:text-destructive"}`}
                            onClick={() => handleBlock(user.id)}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="relative mb-4 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search resources..." value={resourceSearch} onChange={(e) => setResourceSearch(e.target.value)} className="pl-10 bg-card border-border/50 text-foreground" />
            </div>
            <div className="surface-elevated rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-surface-foreground/70">Resource</TableHead>
                    <TableHead className="text-surface-foreground/70">Owner</TableHead>
                    <TableHead className="text-surface-foreground/70">Category</TableHead>
                    <TableHead className="text-surface-foreground/70 text-center">Status</TableHead>
                    <TableHead className="text-surface-foreground/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((res) => (
                    <TableRow key={res.id} className="border-border/20">
                      <TableCell className="font-medium text-surface-foreground text-sm">{res.title}</TableCell>
                      <TableCell className="text-sm text-surface-foreground/70">{res.owner_name}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{res.category}</span>
                      </TableCell>
                      <TableCell className="text-center"><StatusBadge status={res.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-surface-foreground/60 hover:text-surface-foreground">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive" onClick={() => handleDeleteResource(res.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-4">
              {transactions.map((tx, i) => {
                const dl = daysLeft(tx);
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`surface-elevated rounded-xl p-5 ${dl < 0 ? "border-destructive/30" : ""}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-surface-foreground text-sm">{tx.resource_title}</h3>
                          <StatusBadge status={tx.status} daysLeft={Math.max(0, dl)} />
                        </div>
                        <p className="text-xs text-surface-foreground/60">
                          {tx.borrower_name} ← {tx.owner_name} · Due: {tx.due_date ? new Date(tx.due_date).toLocaleDateString() : "—"}
                        </p>
                        {dl < 0 && (
                          <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Overdue by {Math.abs(dl)} days
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {tx.status === "extension-requested" && (
                          <>
                            <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90 text-xs h-8" onClick={() => handleApproveExtension(tx.id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10">
                              Deny
                            </Button>
                          </>
                        )}
                        {dl < 0 && (
                          <Button size="sm" variant="outline" className="text-xs h-8 border-warning/30 text-warning hover:bg-warning/10">
                            Send Reminder
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-surface-foreground/60">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

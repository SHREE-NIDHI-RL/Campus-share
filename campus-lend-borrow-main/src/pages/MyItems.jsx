import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Eye, ArrowUpRight, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { resourceService } from "@/services/resourceService";

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resourceService
      .getMine()
      .then((data) => setItems(data.resources || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="font-heading text-3xl font-bold text-foreground">My Items</h1>
            <p className="text-muted-foreground mt-1">All resources you have listed</p>
          </motion.div>
          <Link to="/add-resource">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              <Plus className="w-4 h-4" />
              List Item
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="surface-elevated rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="surface-elevated rounded-xl p-10 text-center">
            <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">You have not listed any items yet.</p>
            <Link to="/add-resource" className="inline-block mt-4">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Create your first listing</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="surface-elevated rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium text-surface-foreground">{item.title}</h3>
                    <StatusBadge status={item.status} />
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted/50 text-surface-foreground/70 uppercase tracking-wide">
                      {item.listing_type}
                    </span>
                  </div>
                  <p className="text-xs text-surface-foreground/60">{item.category}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-surface-foreground/70">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {item.views_count ?? 0} views
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {item.request_count ?? 0} requests
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyItems;

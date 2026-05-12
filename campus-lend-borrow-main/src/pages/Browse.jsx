import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import FilterSidebar from "@/components/FilterSidebar";
import ResourceCard from "@/components/ResourceCard";
import { resourceService } from "@/services/resourceService";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const UPLOAD_BASE = API_URL.startsWith("http") ? API_URL.replace(/\/api\/?$/, "") : "";

// Normalise API resource shape → card shape
const toCard = (r) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  image: r.image_url
    ? r.image_url.startsWith("/uploads")
      ? `${UPLOAD_BASE}${r.image_url}`
      : r.image_url
    : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop",
  status: r.status,
  rentPrice: r.rent_price ? parseFloat(r.rent_price) : undefined,
  buyPrice: r.buy_price ? parseFloat(r.buy_price) : undefined,
  owner: r.owner_name || r.owner,
  daysLeft: r.daysLeft,
});

// Client-side filter applied to both mock and API data
const applyFilters = (list, { category, type, search }) => {
  return list.filter((r) => {
    const matchCat = !category || category === "All" || r.category === category;

    const listingType = r.listing_type || (r.rentPrice && r.buyPrice ? "both" : r.rentPrice ? "rent" : "buy");
    const matchType =
      !type || type === "All" ||
      listingType === type.toLowerCase() ||
      listingType === "both";

    const matchSearch =
      !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase()) ||
      r.owner?.toLowerCase().includes(search.toLowerCase());

    return matchCat && matchType && matchSearch;
  });
};

const Browse = () => {
  const [allResources, setAllResources] = useState([]);
  const [filters, setFilters] = useState({ category: "All", type: "All", search: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resourceService.getAll({})
      .then((data) => {
        if (cancelled) return;
        setAllResources((data.resources || []).map(toCard));
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const [displayed, setDisplayed] = useState([]);
  useEffect(() => {
    const t = setTimeout(() => setDisplayed(applyFilters(allResources, filters)), 150);
    return () => clearTimeout(t);
  }, [allResources, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-heading text-3xl font-bold text-foreground">Browse Resources</h1>
          <p className="text-muted-foreground mt-1">Find what you need from verified campus peers</p>
        </motion.div>

        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          <FilterSidebar
            onCategoryChange={(cat) => setFilters((f) => ({ ...f, category: cat }))}
            onModeChange={(type) => setFilters((f) => ({ ...f, type }))}
            onSearch={(search) => setFilters((f) => ({ ...f, search }))}
          />

          <div className="flex-1">
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="surface-elevated rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg font-heading">No resources found</p>
                <p className="text-sm mt-1">Try a different category or search term</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {displayed.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <ResourceCard resource={r} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;

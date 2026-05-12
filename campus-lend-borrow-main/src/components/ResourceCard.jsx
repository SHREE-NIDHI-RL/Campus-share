import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";
import TrustBadge from "./TrustBadge";
import { Clock, Tag } from "lucide-react";

const ResourceCard = ({ resource }) => {
  const isSold = resource.status === "sold";

  return (
    <motion.div
      whileHover={!isSold ? { y: -4 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={isSold ? "#" : `/resource/${resource.id}`}
        className={`block group surface-elevated rounded-xl overflow-hidden transition-all ${
          isSold ? "opacity-50 pointer-events-none" : "hover:glow-sm"
        }`}
      >
        <div className="relative h-44 overflow-hidden bg-muted">
          <img
            src={resource.image}
            alt={resource.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <StatusBadge status={resource.status} daysLeft={resource.daysLeft} />
          </div>
          {isSold && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="font-heading font-bold text-lg text-destructive tracking-wider uppercase">Sold</span>
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div>
            <span className="text-xs text-primary font-medium uppercase tracking-wider">{resource.category}</span>
            <h3 className="font-heading font-semibold text-surface-foreground mt-1 line-clamp-1">{resource.title}</h3>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {resource.rentPrice && (
              <span className="flex items-center gap-1 text-surface-foreground/70">
                <Clock className="w-3.5 h-3.5" />
                ₹{resource.rentPrice}/day
              </span>
            )}
            {resource.buyPrice && (
              <span className="flex items-center gap-1 text-secondary">
                <Tag className="w-3.5 h-3.5" />
                ₹{resource.buyPrice}
              </span>
            )}
          </div>
          <TrustBadge />
        </div>
      </Link>
    </motion.div>
  );
};

export default ResourceCard;

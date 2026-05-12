import { ShieldCheck, Star } from "lucide-react";

const TrustBadge = ({ verified = true, rating = 4.5, borrowCount = 12 }) => (
  <div className="flex items-center gap-3 text-xs">
    {verified && (
      <span className="flex items-center gap-1 text-primary">
        <ShieldCheck className="w-3.5 h-3.5" />
        Verified
      </span>
    )}
    <span className="flex items-center gap-1 text-secondary">
      <Star className="w-3.5 h-3.5 fill-secondary" />
      {rating}
    </span>
    <span className="text-muted-foreground">{borrowCount} borrows</span>
  </div>
);

export default TrustBadge;

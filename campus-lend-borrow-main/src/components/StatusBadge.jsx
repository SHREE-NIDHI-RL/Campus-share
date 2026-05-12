import { Badge } from "@/components/ui/badge";

const statusConfig = {
  pending: { label: "Pending", className: "bg-muted/15 text-muted-foreground border-muted/30" },
  available: { label: "Available", className: "bg-success/15 text-success border-success/30" },
  active: { label: "Active", className: "bg-primary/15 text-primary border-primary/30" },
  borrowed: { label: "Currently Unavailable", className: "bg-warning/15 text-warning border-warning/30" },
  "return-due": { label: "Return Due", className: "bg-info/15 text-info border-info/30" },
  "extension-requested": { label: "Extension Requested", className: "bg-secondary/15 text-secondary border-secondary/30" },
  "extension-approved": { label: "Extension Approved", className: "bg-primary/15 text-primary border-primary/30" },
  approved: { label: "Approved", className: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive border-destructive/30" },
  sold: { label: "Sold", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const StatusBadge = ({ status, daysLeft }) => {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={`${config.className} text-xs font-medium`}>
      {config.label}
      {status === "return-due" && daysLeft !== undefined && ` · ${daysLeft}d`}
    </Badge>
  );
};

export default StatusBadge;

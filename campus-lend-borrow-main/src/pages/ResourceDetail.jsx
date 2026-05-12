import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Tag,
  Calendar,
  ShieldCheck,
  Star,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import TrustBadge from "@/components/TrustBadge";
import { useState, useEffect } from "react";
import { resourceService } from "@/services/resourceService";
import { borrowService } from "@/services/borrowService";
import { useAuth } from "@/context/AuthContext";
import { ratingService } from "@/services/adminService";
import { toast } from "@/components/ui/sonner";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const BASE = API_URL.startsWith("http") ? API_URL.replace(/\/api\/?$/, "") : "";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const addDays = (start, days) => {
  const dt = new Date(start);
  dt.setHours(12, 0, 0, 0);
  dt.setDate(dt.getDate() + Number(days || 0));
  return dt;
};

const clampInt = (v, min, max) => {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
};

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [resource, setResource] = useState(null);
  const [activeBorrow, setActiveBorrow] = useState(null);
  const [pendingBorrow, setPendingBorrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowDays, setBorrowDays] = useState(7);
  const [customDays, setCustomDays] = useState("7");
  const [galleryIdx, setGalleryIdx] = useState(0);

  const [reviews, setReviews] = useState({ reviews: [], average: 0, count: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const [submittingBorrow, setSubmittingBorrow] = useState(false);
  const [borrowActionLoading, setBorrowActionLoading] = useState(false);

  const [eligibleBorrow, setEligibleBorrow] = useState(null);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setResource(null);
    setActiveBorrow(null);
    setPendingBorrow(null);
    setGalleryIdx(0);

    resourceService
      .getById(id)
      .then((data) => {
        if (cancelled) return;
        setResource(data.resource || null);
        setActiveBorrow(data.activeBorrow || null);
        setPendingBorrow(data.pendingBorrow || null);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setResource(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setReviewsLoading(true);
    resourceService
      .getReviews(id)
      .then((data) => {
        if (cancelled) return;
        setReviews({
          reviews: data.reviews || [],
          average: data.average || 0,
          count: data.count || 0,
        });
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setReviews({ reviews: [], average: 0, count: 0 });
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setRelatedLoading(true);
    resourceService
      .getRelated(id)
      .then((data) => {
        if (cancelled) return;
        setRelated(data.resources || []);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setRelated([]);
      })
      .finally(() => {
        if (!cancelled) setRelatedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setEligibleBorrow(null);
    if (!isAuthenticated) return undefined;

    borrowService
      .getMyBorrows()
      .then((data) => {
        if (cancelled) return;
        const list = data.borrows || [];
        const candidate = list.find((b) => String(b.resource_id) === String(id) && b.status === "returned");
        setEligibleBorrow(candidate || null);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setEligibleBorrow(null);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated]);

  const handleBorrowRequest = async (type = 'rent') => {
    if (!isAuthenticated) return navigate("/login");
    try {
      setSubmittingBorrow(true);
      await borrowService.request(id, borrowDays, type);
      toast.success(type === 'buy' ? "Purchase request sent" : "Rent request sent", { description: "Waiting for owner approval. You'll see their contact in your profile once approved." });
    } catch (err) {
      toast.error("Request failed", { description: err?.message || "Please try again." });
    } finally {
      setSubmittingBorrow(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <div className="h-96 surface-elevated rounded-xl animate-pulse" />
      </div>
    </div>
  );

  if (!resource) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 text-center text-muted-foreground">Resource not found</div>
    </div>
  );

  const imageUrl = resource.image_url?.startsWith("/uploads")
    ? `${BASE}${resource.image_url}`
    : resource.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=500&fit=crop";

  const normaliseImg = (src) => {
    if (!src) return null;
    if (src.startsWith("/uploads")) return `${BASE}${src}`;
    return src;
  };

  const gallery = [
    ...((Array.isArray(resource.images) ? resource.images : []).map(normaliseImg).filter(Boolean)),
    normaliseImg(resource.image_url),
  ].filter(Boolean);
  const selectedImage = gallery[galleryIdx] || imageUrl;

  const initials = resource.owner_name?.split(" ").map((n) => n[0]).join("") || "?";
  const isOwner = Boolean(user?.id && String(user.id) === String(resource.owner_id));

  const rentPerDay = resource.rent_price ? parseFloat(resource.rent_price) : 0;
  const totalRent = rentPerDay ? rentPerDay * borrowDays : 0;
  const returnDate = addDays(new Date(), borrowDays);

  const borrowDueDate = activeBorrow?.extended_due_date || activeBorrow?.due_date;
  const daysRemaining = borrowDueDate
    ? Math.max(0, Math.ceil((new Date(borrowDueDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const statusAllowsBorrow = resource.status === "available" && resource.listing_type !== "buy";
  const showBorrowTracking = Boolean(activeBorrow);

  const showPendingBorrowPanel = Boolean(pendingBorrow) && (String(pendingBorrow.owner_id) === String(user?.id) || user?.role === "admin");

  const handleBorrowAction = async (action) => {
    if (!activeBorrow?.id) return;
    setBorrowActionLoading(true);
    try {
      if (action === "return") await borrowService.markReturned(activeBorrow.id);
      if (action === "request-extension") await borrowService.requestExtension(activeBorrow.id, 7);
      if (action === "approve-extension") await borrowService.approveExtension(activeBorrow.id);
      toast.success("Updated");
      const fresh = await resourceService.getById(id);
      setResource(fresh.resource || null);
      setActiveBorrow(fresh.activeBorrow || null);
      setPendingBorrow(fresh.pendingBorrow || null);
    } catch (err) {
      toast.error("Action failed", { description: err?.message || "Please try again." });
    } finally {
      setBorrowActionLoading(false);
    }
  };

  const submitReview = async () => {
    if (!eligibleBorrow) {
      toast.error("Not eligible", { description: "You can review after completing a borrow." });
      return;
    }
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      setSubmittingReview(true);
      await ratingService.add(resource.owner_id, eligibleBorrow.id, reviewScore, reviewFeedback);
      toast.success("Review submitted");
      setReviewFeedback("");
      const fresh = await resourceService.getReviews(id);
      setReviews({
        reviews: fresh.reviews || [],
        average: fresh.average || 0,
        count: fresh.count || 0,
      });
    } catch (err) {
      toast.error("Could not submit review", { description: err?.message || "Please try again." });
    } finally {
      setSubmittingReview(false);
    }
  };

  const relatedCards = related.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    image: r.image_url
      ? r.image_url.startsWith("/uploads")
        ? `${BASE}${r.image_url}`
        : r.image_url
      : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop",
    status: r.status,
    rentPrice: r.rent_price ? parseFloat(r.rent_price) : undefined,
    buyPrice: r.buy_price ? parseFloat(r.buy_price) : undefined,
    owner: r.owner_name,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Link to="/browse" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3 space-y-6">
            <div className="surface-elevated rounded-xl overflow-hidden">
              <div className="relative bg-muted aspect-video">
                <img src={selectedImage} alt={resource.title} className="w-full h-full object-cover" />
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/70 border border-border/40 flex items-center justify-center hover:bg-background"
                      onClick={() => setGalleryIdx((p) => (p - 1 + gallery.length) % gallery.length)}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/70 border border-border/40 flex items-center justify-center hover:bg-background"
                      onClick={() => setGalleryIdx((p) => (p + 1) % gallery.length)}
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <div className="p-4 border-t border-border/30">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-primary font-medium uppercase tracking-wider shrink-0">{resource.category}</span>
                    <StatusBadge status={resource.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{resource.views_count ?? 0}</span>
                    <span className="flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" />{resource.request_count ?? 0}</span>
                  </div>
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground mt-2">{resource.title}</h1>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed whitespace-pre-line">{resource.description}</p>
              </div>

              {gallery.length > 1 && (
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-6 gap-2">
                    {gallery.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setGalleryIdx(i)}
                        className={`rounded-md overflow-hidden bg-muted aspect-square border transition-colors ${
                          galleryIdx === i ? "border-primary/40" : "border-border/30 hover:border-border/60"
                        }`}
                        aria-label={`Select image ${i + 1}`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="surface-elevated rounded-xl p-6">
              <h2 className="font-heading font-semibold text-surface-foreground">Details</h2>
              <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
                <div className="rounded-lg bg-muted/40 p-4">
                  <div className="text-xs text-muted-foreground mb-1">Condition</div>
                  <div className="font-medium text-surface-foreground">{resource.condition || "—"}</div>
                </div>
                <div className="rounded-lg bg-muted/40 p-4">
                  <div className="text-xs text-muted-foreground mb-1">Quantity</div>
                  <div className="font-medium text-surface-foreground">{resource.quantity ?? "—"}</div>
                </div>
                <div className="rounded-lg bg-muted/40 p-4 sm:col-span-2">
                  <div className="text-xs text-muted-foreground mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(resource.tags) ? resource.tags : [])
                      .slice(0, 10)
                      .map((t) => (
                        <span key={t} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {t}
                        </span>
                      ))}
                    {(!resource.tags || (Array.isArray(resource.tags) && resource.tags.length === 0)) && (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-surface-foreground">Reviews</h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-1 text-secondary">
                    <Star className="w-4 h-4 fill-secondary" />
                    {Number(reviews.average || 0).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">({reviews.count || 0})</span>
                </div>
              </div>

              {reviewsLoading ? (
                <div className="mt-4 space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="rounded-xl h-20 bg-muted/40 animate-pulse" />)}
                </div>
              ) : reviews.reviews.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {reviews.reviews.map((r, idx) => (
                    <div key={`${r.created_at}-${idx}`} className="rounded-xl bg-muted/30 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-surface-foreground">{r.reviewer_name}</div>
                          <div className="text-xs text-muted-foreground">{r.reviewer_dept || "Student"} · {fmtDate(r.created_at)}</div>
                        </div>
                        <div className="flex items-center gap-1 text-secondary text-sm shrink-0">
                          <Star className="w-4 h-4 fill-secondary" />
                          {Number(r.score || 0).toFixed(1)}
                        </div>
                      </div>
                      {r.feedback && <p className="text-sm text-surface-foreground/80 mt-3 whitespace-pre-line">{r.feedback}</p>}
                    </div>
                  ))}
                </div>
              )}

              {!isOwner && isAuthenticated && (
                <div className="mt-6 border-t border-border/30 pt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-surface-foreground text-sm">Add a review</h3>
                    {!eligibleBorrow && (
                      <span className="text-xs text-muted-foreground">Complete a borrow to review</span>
                    )}
                  </div>
                  <div className="mt-3 grid sm:grid-cols-5 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground">Rating</label>
                      <div className="mt-2 flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setReviewScore(s)}
                            className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
                              reviewScore === s
                                ? "bg-secondary/15 text-secondary border border-secondary/30"
                                : "bg-muted/50 text-surface-foreground/60 hover:text-surface-foreground"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-xs text-muted-foreground">Feedback</label>
                      <textarea
                        value={reviewFeedback}
                        onChange={(e) => setReviewFeedback(e.target.value)}
                        placeholder="Share your experience..."
                        className="mt-2 w-full min-h-24 rounded-md bg-muted/30 border border-border/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={submitReview}
                      disabled={submittingReview || !eligibleBorrow}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {submittingReview ? "Submitting..." : "Submit review"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="surface-elevated rounded-xl p-6">
              <h2 className="font-heading font-semibold text-surface-foreground">Related resources</h2>
              {relatedLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {[...Array(4)].map((_, i) => <div key={i} className="surface-elevated rounded-xl h-56 animate-pulse" />)}
                </div>
              ) : relatedCards.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No related resources found.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {relatedCards.map((r) => (
                    <Link
                      key={r.id}
                      to={`/resource/${r.id}`}
                      className="block surface-elevated rounded-xl overflow-hidden hover:glow-sm transition-shadow"
                    >
                      <div className="h-32 bg-muted overflow-hidden">
                        <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-primary font-medium uppercase tracking-wider">{r.category}</span>
                          <StatusBadge status={r.status} />
                        </div>
                        <div className="font-heading font-semibold text-surface-foreground text-sm line-clamp-1">{r.title}</div>
                        <div className="flex items-center gap-3 text-xs">
                          {r.rentPrice && (
                            <span className="flex items-center gap-1 text-surface-foreground/70">
                              <Clock className="w-3.5 h-3.5" />₹{r.rentPrice}/day
                            </span>
                          )}
                          {r.buyPrice && (
                            <span className="flex items-center gap-1 text-secondary">
                              <Tag className="w-3.5 h-3.5" />₹{r.buyPrice}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">By {r.owner || "—"}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            <div className="surface-elevated rounded-xl p-5 space-y-4">
              <h2 className="font-heading font-semibold text-surface-foreground">Pricing</h2>

              {resource.rent_price && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-surface-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-heading font-semibold">Rent</span>
                  </div>
                  <span className="font-heading font-bold text-primary text-lg">₹{resource.rent_price}/day</span>
                </div>
              )}
              {resource.buy_price && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-surface-foreground">
                    <Tag className="w-4 h-4 text-secondary" />
                    <span className="font-heading font-semibold">Buy</span>
                  </div>
                  <span className="font-heading font-bold text-secondary text-lg">₹{resource.buy_price}</span>
                </div>
              )}
              {resource.availability_days && (
                <div className="flex items-center gap-2 text-sm text-surface-foreground/70">
                  <Calendar className="w-4 h-4" />
                  Available for {resource.availability_days} days
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: "Security deposit", value: resource.security_deposit },
                  { label: "Late fee / day", value: resource.late_fee_per_day },
                  { label: "Min duration", value: resource.min_duration ? `${resource.min_duration} days` : null },
                  { label: "Max duration", value: resource.max_duration ? `${resource.max_duration} days` : null },
                ].map((x) => (
                  <div key={x.label} className="rounded-lg bg-muted/40 p-3">
                    <div className="text-muted-foreground">{x.label}</div>
                    <div className="text-surface-foreground font-medium mt-1">{x.value ?? "—"}</div>
                  </div>
                ))}
              </div>

              {statusAllowsBorrow && (
                <div>
                  <label className="text-xs text-surface-foreground/60 block mb-2">Borrow duration</label>
                  <div className="flex gap-2">
                    {[3, 7, 14, 30].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setBorrowDays(d);
                          setCustomDays(String(d));
                        }}
                        className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
                          borrowDays === d
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "bg-muted/50 text-surface-foreground/60 hover:text-surface-foreground"
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">Custom:</span>
                    <input
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      onBlur={() => {
                        const v = clampInt(customDays, 1, 365);
                        setBorrowDays(v);
                        setCustomDays(String(v));
                      }}
                      className="h-9 w-24 rounded-md bg-muted/30 border border-border/40 px-3 text-sm text-foreground outline-none focus:border-primary/40"
                      inputMode="numeric"
                    />
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>

                  <div className="mt-3 rounded-lg bg-muted/40 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total rent</span>
                      <span className="text-surface-foreground font-medium">{rentPerDay ? `₹${totalRent}` : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-muted-foreground">Return date</span>
                      <span className="text-surface-foreground font-medium">{fmtDate(returnDate)}</span>
                    </div>
                  </div>
                </div>
              )}

              {resource.status === "available" && (
                <div className="flex gap-3 pt-2">
                  {resource.listing_type !== "buy" && (
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                      onClick={() => handleBorrowRequest('rent')}
                      disabled={submittingBorrow}
                    >
                      {submittingBorrow ? "Sending..." : `Rent for ${borrowDays} days`}
                    </Button>
                  )}
                  {resource.listing_type !== "rent" && (
                    <Button
                      variant="outline"
                      className="flex-1 border-secondary/30 text-secondary hover:bg-secondary/10 h-11"
                      onClick={() => handleBorrowRequest('buy')}
                      disabled={submittingBorrow}
                    >
                      {submittingBorrow ? "Sending..." : "Buy Now"}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="surface-elevated rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-surface-foreground text-sm">Owner</h3>
                <TrustBadge
                  verified={Boolean(resource.owner_verified)}
                  rating={parseFloat(resource.owner_rating || 0).toFixed(1)}
                  borrowCount={resource.owner_borrow_count || 0}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="font-heading font-semibold text-sm text-surface-foreground">{initials}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-surface-foreground text-sm truncate">{resource.owner_name}</span>
                    {resource.owner_verified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <p className="text-xs text-surface-foreground/60">{resource.owner_department || "Student"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Trust score", value: resource.owner_trust_score != null ? `${parseFloat(resource.owner_trust_score).toFixed(0)}%` : "—" },
                  { label: "Rating", value: parseFloat(resource.owner_rating || 0).toFixed(1) },
                  { label: "Borrow count", value: resource.owner_borrow_count || 0 },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-muted/40 p-3">
                    <div className="font-heading font-bold text-surface-foreground text-sm">{s.value}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                Member since <span className="text-surface-foreground font-medium">{fmtDate(resource.owner_member_since)}</span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-border/50 text-surface-foreground hover:bg-muted/40 gap-1.5"
                  onClick={() => toast("Messaging not implemented yet")}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-border/50 text-surface-foreground hover:bg-muted/40"
                  onClick={() => navigate(`/user/${resource.owner_id}`)}
                >
                  View Profile
                </Button>
              </div>
            </div>

            {showPendingBorrowPanel && (
              <div className="surface-elevated rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading font-semibold text-surface-foreground text-sm">Pending borrow request</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      From <span className="text-surface-foreground font-medium">{pendingBorrow.borrower_name}</span> · {pendingBorrow.duration_days} days
                    </p>
                  </div>
                  <StatusBadge status={pendingBorrow.status} />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-success text-success-foreground hover:bg-success/90 text-xs"
                    disabled={borrowActionLoading}
                    onClick={async () => {
                      setBorrowActionLoading(true);
                      try {
                        await borrowService.approve(pendingBorrow.id);
                        toast.success("Borrow approved");
                        const fresh = await resourceService.getById(id);
                        setResource(fresh.resource || null);
                        setActiveBorrow(fresh.activeBorrow || null);
                        setPendingBorrow(fresh.pendingBorrow || null);
                      } catch (err) {
                        toast.error("Approve failed", { description: err?.message || "Please try again." });
                      } finally {
                        setBorrowActionLoading(false);
                      }
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                    disabled={borrowActionLoading}
                    onClick={async () => {
                      setBorrowActionLoading(true);
                      try {
                        await borrowService.reject(pendingBorrow.id);
                        toast.success("Borrow rejected");
                        const fresh = await resourceService.getById(id);
                        setResource(fresh.resource || null);
                        setActiveBorrow(fresh.activeBorrow || null);
                        setPendingBorrow(fresh.pendingBorrow || null);
                      } catch (err) {
                        toast.error("Reject failed", { description: err?.message || "Please try again." });
                      } finally {
                        setBorrowActionLoading(false);
                      }
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {showBorrowTracking && (
              <div className="surface-elevated rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading font-semibold text-surface-foreground text-sm">Borrow tracking</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Status: <span className="text-surface-foreground font-medium">{activeBorrow.status}</span>
                    </p>
                  </div>
                  <StatusBadge status={activeBorrow.status} daysLeft={daysRemaining ?? undefined} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <div className="text-muted-foreground">Due date</div>
                    <div className="text-surface-foreground font-medium mt-1">
                      {activeBorrow.status === "extension-approved" && activeBorrow.extended_due_date ? (
                        <span>
                          <span className="line-through mr-1 text-muted-foreground">{fmtDate(activeBorrow.due_date)}</span>
                          <span className="text-primary">{fmtDate(activeBorrow.extended_due_date)}</span>
                        </span>
                      ) : (
                        fmtDate(activeBorrow.due_date)
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <div className="text-muted-foreground">Days remaining</div>
                    <div className="text-surface-foreground font-medium mt-1">{daysRemaining ?? "—"}</div>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex flex-wrap gap-2">
                    {String(activeBorrow.borrower_id) === String(user?.id) && activeBorrow.status === "return-due" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                          disabled={borrowActionLoading}
                          onClick={() => handleBorrowAction("return")}
                        >
                          Mark returned
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-secondary/30 text-secondary hover:bg-secondary/10"
                          disabled={borrowActionLoading}
                          onClick={() => handleBorrowAction("request-extension")}
                        >
                          Request extension
                        </Button>
                      </>
                    )}

                    {(String(activeBorrow.owner_id) === String(user?.id) || user?.role === "admin") &&
                      activeBorrow.status === "extension-requested" && (
                        <Button
                          size="sm"
                          className="bg-success text-success-foreground hover:bg-success/90 text-xs"
                          disabled={borrowActionLoading}
                          onClick={() => handleBorrowAction("approve-extension")}
                        >
                          Approve extension
                        </Button>
                      )}

                    {(String(activeBorrow.borrower_id) === String(user?.id) || String(activeBorrow.owner_id) === String(user?.id)) &&
                      activeBorrow.status === "return-due" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-border/50"
                          disabled={borrowActionLoading}
                          onClick={() => handleBorrowAction("return")}
                        >
                          Mark returned
                        </Button>
                      )}

                    {activeBorrow.status === "extension-requested" && (
                      <span className="text-xs text-muted-foreground italic">Extension requested — waiting for approval.</span>
                    )}
                    {activeBorrow.status === "extension-approved" && (
                      <span className="text-xs text-success font-medium">Extension approved — new due date set.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;

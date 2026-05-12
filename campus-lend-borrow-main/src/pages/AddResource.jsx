import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ImagePlus } from "lucide-react";
import { resourceService } from "@/services/resourceService";

const categories = ["Textbooks", "Lab Equipment", "Electronics", "Project Tools", "Stationery", "Calculators", "Exam Prep"];

const AddResource = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("both");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", rent_price: "", buy_price: "", availability_days: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("listing_type", mode);
      if (form.rent_price) fd.append("rent_price", form.rent_price);
      if (form.buy_price) fd.append("buy_price", form.buy_price);
      if (form.availability_days) fd.append("availability_days", form.availability_days);
      if (imageFile) fd.append("image", imageFile);

      await resourceService.create(fd);
      navigate("/my-items");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-heading text-3xl font-bold text-foreground">List a Resource</h1>
          <p className="text-muted-foreground mt-1">Share your items with the campus community</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 space-y-6 surface-elevated rounded-xl p-6"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>
          )}

          <label className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center cursor-pointer hover:border-primary/30 transition-colors block">
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="mx-auto max-h-40 rounded-lg object-cover" />
            ) : (
              <>
                <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Click to upload images</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
              </>
            )}
          </label>

          <div className="space-y-2">
            <Label className="text-foreground">Title</Label>
            <Input value={form.title} onChange={set("title")} placeholder="e.g. Engineering Mathematics — Kreyszig" className="bg-card border-border/50 text-foreground" required />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Description</Label>
            <Textarea value={form.description} onChange={set("description")} placeholder="Describe condition, edition, usage notes..." className="bg-card border-border/50 text-foreground min-h-[100px]" />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Category</Label>
            <Select onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger className="bg-card border-border/50 text-foreground">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Listing Type</Label>
            <div className="flex gap-2">
              {["both", "rent", "buy"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 h-10 rounded-md text-sm font-medium capitalize transition-colors ${
                    mode === m
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "both" ? "Rent & Buy" : m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(mode === "rent" || mode === "both") && (
              <div className="space-y-2">
                <Label className="text-foreground">Rent Price (₹/day)</Label>
                <Input type="number" value={form.rent_price} onChange={set("rent_price")} placeholder="e.g. 15" className="bg-card border-border/50 text-foreground" />
              </div>
            )}
            {(mode === "buy" || mode === "both") && (
              <div className="space-y-2">
                <Label className="text-foreground">Buy Price (₹)</Label>
                <Input type="number" value={form.buy_price} onChange={set("buy_price")} placeholder="e.g. 350" className="bg-card border-border/50 text-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Available Duration (days)</Label>
            <Input type="number" value={form.availability_days} onChange={set("availability_days")} placeholder="e.g. 30" className="bg-card border-border/50 text-foreground" />
          </div>

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 gap-2" disabled={loading}>
            <Upload className="w-4 h-4" />
            {loading ? "Publishing..." : "Publish Listing"}
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default AddResource;

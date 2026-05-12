import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Shield, Users, Repeat, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { value: "2,400+", label: "Resources Listed" },
  { value: "850+", label: "Active Students" },
  { value: "12", label: "Campuses" },
  { value: "98%", label: "Trust Score" },
];

const features = [
  { icon: Repeat, title: "Rent or Buy", desc: "Flexible options — borrow for a few days or purchase outright." },
  { icon: Shield, title: "Verified Trust", desc: "College email verification ensures every user is accountable." },
  { icon: Zap, title: "Smart Tracking", desc: "Real-time borrow tracking with due dates and extension requests." },
  { icon: Users, title: "Campus Community", desc: "Connect with peers, rate transactions, build your reputation." },
];

const categories = [
  { name: "Textbooks", count: 340 },
  { name: "Lab Equipment", count: 120 },
  { name: "Electronics", count: 95 },
  { name: "Project Tools", count: 78 },
  { name: "Stationery", count: 210 },
  { name: "Calculators", count: 45 },
];

const Landing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    <section className="relative pt-16 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>
      <div className="relative container mx-auto px-4 pt-24 pb-20 lg:pt-36 lg:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
            <span className="text-xs font-medium text-primary">Trusted by 850+ students across 12 campuses</span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Your Campus
            <br />
            <span className="text-gradient-primary">Resource Hub</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-xl leading-relaxed">
            Rent textbooks, borrow lab gear, trade project tools — all verified through your college email. Safe, tracked, and community-driven.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link to="/browse">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-8 text-base">
                Explore Resources
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="border-border/50 text-foreground hover:bg-muted/50 h-12 px-8 text-base">
                Join CampusShare
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    <section className="border-y border-border/30 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-heading text-3xl md:text-4xl font-bold text-gradient-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section className="container mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          Built for <span className="text-primary">Campus Life</span>
        </h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">
          Everything you need to share, borrow, and track resources across your campus.
        </p>
      </motion.div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="surface-elevated rounded-xl p-6 group hover:glow-sm transition-all"
          >
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-surface-foreground">{f.title}</h3>
            <p className="text-sm text-surface-foreground/70 mt-2 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    <section className="container mx-auto px-4 pb-24">
      <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Popular Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to="/browse" className="block glass-panel rounded-xl p-5 text-center hover:glow-sm transition-all group">
              <div className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.count} items</div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>

    <footer className="border-t border-border/30 bg-card/30">
      <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-heading font-bold text-foreground">CampusShare</span>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 CampusShare. Built for students, by students.</p>
      </div>
    </footer>
  </div>
);

export default Landing;

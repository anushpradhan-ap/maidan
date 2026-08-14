import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListNews } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Search, ChevronRight, Zap, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const BREAKING_KEY = "ggm_breaking_dismissed";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "tournament", label: "Tournaments" },
  { id: "gaming", label: "Gaming" },
  { id: "recap", label: "Recaps" },
  { id: "announcement", label: "Announcements" },
  { id: "patch", label: "Patch Notes" },
];

const CAT_COLORS: Record<string, string> = {
  tournament:   "bg-purple-500/20 text-purple-300 border-purple-500/30",
  gaming:       "bg-blue-500/20 text-blue-300 border-blue-500/30",
  recap:        "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  announcement: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  patch:        "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

function BreakingBanner() {
  const [post, setPost] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/news/breaking`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return;
        if (localStorage.getItem(BREAKING_KEY) === String(data.id)) return;
        setPost(data);
      })
      .catch(() => {});
  }, []);

  if (!post || dismissed) return null;

  return (
    <motion.div
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -48, opacity: 0 }}
      className="bg-red-600 text-white"
    >
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex items-center gap-1 bg-white text-red-600 font-black text-[10px] uppercase tracking-widest px-2 py-1 rounded">
            <Zap className="w-3 h-3" /> Breaking
          </span>
          <Link href={`/news/${post.id}`}>
            <span className="font-medium text-sm hover:underline cursor-pointer truncate">{post.title}</span>
          </Link>
        </div>
        <button
          onClick={() => { localStorage.setItem(BREAKING_KEY, String(post.id)); setDismissed(true); }}
          className="shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function FeaturedCard({ post }: { post: any }) {
  return (
    <Link href={`/news/${post.id}`}>
      <div className="relative h-[420px] rounded-2xl overflow-hidden group cursor-pointer border border-white/5">
        {post.coverUrl ? (
          <img src={post.coverUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-card" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
          <div className="flex gap-2 mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${CAT_COLORS[post.category] ?? "bg-muted/50 text-muted-foreground border-white/10"}`}>
              {post.category}
            </span>
            {post.isBreaking && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-red-500/80 text-white border border-red-400/50 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Breaking
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight text-white leading-tight mb-3 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          <p className="text-sm text-gray-300 line-clamp-2 mb-4">{post.excerpt}</p>
          <div className="flex items-center text-xs text-gray-400 font-mono gap-3">
            <Calendar className="w-3 h-3" />
            {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            <span>·</span>
            <span>{post.author}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function News() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const { data: allNews, isLoading } = useListNews(
    category !== "all" ? { category } : undefined,
    { query: { queryKey: ["news", category] } }
  );

  const news = allNews?.filter(post => {
    if (!search) return true;
    const q = search.toLowerCase();
    return post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q);
  });

  const featured = news?.[0];
  const rest = news?.slice(1);

  return (
    <div className="flex flex-col">
      <BreakingBanner />

      {/* Hero headline */}
      <div className="border-b border-white/5 bg-card/20">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight">
              G.G. Maidan <span className="text-primary">News</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Latest from Nepal's premier esports platform</p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-background/80 border-white/10 focus:border-primary/50"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="container mx-auto px-4 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                category === c.id
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                  : "bg-card border-white/10 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-[420px] rounded-2xl bg-card/30 animate-pulse border border-white/5" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-[300px] rounded-xl bg-card/30 animate-pulse border border-white/5" />)}
            </div>
          </div>
        ) : news && news.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-muted-foreground text-lg">No articles found{search ? ` for "${search}"` : " in this category"}.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured (first post — big card) */}
            {featured && !search && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <FeaturedCard post={featured} />
              </motion.div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {(search ? news : rest)?.map((post, i) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(i * 0.05, 0.25) }}
                  >
                    <Link href={`/news/${post.id}`}>
                      <Card className="glass-card glass-card-hover h-full flex flex-col overflow-hidden group cursor-pointer border-white/5">
                        <div className="h-48 w-full overflow-hidden relative bg-muted/10">
                          {(post as any).coverUrl ? (
                            <img
                              src={(post as any).coverUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-card/50 flex items-center justify-center">
                              <span className="text-5xl opacity-10">📰</span>
                            </div>
                          )}
                          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${CAT_COLORS[post.category] ?? "bg-muted/50 text-muted-foreground border-white/10"}`}>
                              {post.category}
                            </span>
                            {(post as any).isBreaking && (
                              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Breaking
                              </span>
                            )}
                          </div>
                        </div>
                        <CardContent className="p-5 flex-1 flex flex-col">
                          <div className="flex items-center text-xs text-muted-foreground mb-2.5 font-mono gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            <span>·</span>
                            <span className="truncate">{post.author}</span>
                          </div>
                          <h3 className="text-lg font-display font-bold uppercase leading-tight mb-2.5 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-5 flex-1">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center text-primary text-xs font-bold uppercase tracking-wider mt-auto">
                            Read More <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

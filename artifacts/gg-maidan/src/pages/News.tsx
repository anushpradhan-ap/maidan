import { useState } from "react";
import { Link } from "wouter";
import { useListNews } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Search, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

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

export default function News() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const { data: allNews, isLoading } = useListNews(
    category !== "all" ? { category } : undefined
  );

  // Client-side search filter
  const news = allNews?.filter(post => {
    if (!search) return true;
    const q = search.toLowerCase();
    return post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q);
  });

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-3">
          Latest News
        </h1>
        <p className="text-muted-foreground text-lg">Updates, tournament recaps, and announcements from G.G. Maidan.</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search articles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-white/10 focus:border-primary/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                category === c.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-white/10 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[400px] rounded-xl bg-card/30 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news?.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <Link href={`/news/${post.id}`}>
                <Card className="glass-card glass-card-hover h-full flex flex-col overflow-hidden group cursor-pointer border-white/5">
                  {/* Image */}
                  <div className="h-48 w-full overflow-hidden relative bg-muted/20">
                    {(post as any).coverUrl ? (
                      <img
                        src={(post as any).coverUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-card/50 flex items-center justify-center">
                        <span className="text-4xl opacity-20">📰</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
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

                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center text-xs text-muted-foreground mb-3 font-mono gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      <span>·</span>
                      <span>{post.author}</span>
                    </div>
                    <h3 className="text-xl font-display font-bold uppercase leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-primary text-sm font-bold uppercase tracking-wider">
                      Read More <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
          {news?.length === 0 && (
            <div className="col-span-full py-24 text-center">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-muted-foreground text-lg">No articles found{search ? ` for "${search}"` : " in this category"}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

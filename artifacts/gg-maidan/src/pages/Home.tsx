import { useState, useEffect } from "react";
import { useGetFeaturedContent, useGetCommunityStats, useListAnnouncements } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Trophy, Activity, X, Zap, Calendar, ChevronRight, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL;
const API_BASE = import.meta.env.VITE_API_URL ?? "";
const BREAKING_KEY = "ggm_breaking_dismissed";

function BreakingNewsBanner() {
  const [news, setNews] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/news/breaking`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return;
        if (localStorage.getItem(BREAKING_KEY) === String(data.id)) return;
        setNews(data);
      })
      .catch(() => {});
  }, []);

  if (!news || dismissed) return null;

  function dismiss() {
    localStorage.setItem(BREAKING_KEY, String(news.id));
    setDismissed(true);
  }

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-red-600 text-white"
    >
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex items-center gap-1 bg-white text-red-600 font-black text-[10px] uppercase tracking-widest px-2 py-1 rounded">
            <Zap className="w-3 h-3" /> Breaking
          </span>
          <Link href={`/news/${news.id}`}>
            <span className="font-medium text-sm hover:underline cursor-pointer truncate">{news.title}</span>
          </Link>
        </div>
        <button onClick={dismiss} className="shrink-0 hover:opacity-70 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { data: featured, isLoading: isFeaturedLoading } = useGetFeaturedContent();
  const { data: stats, isLoading: isStatsLoading } = useGetCommunityStats();
  const { data: announcements } = useListAnnouncements({ limit: 3 });

  return (
    <div className="flex flex-col gap-0 pb-20">
      <BreakingNewsBanner />

      <div className="flex flex-col gap-20">
        {/* Hero */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_50%)] z-10" />
            <img
              src={`${BASE}images/hero-bg.jpg`}
              alt="Esports Arena"
              className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>

          <div className="container relative z-20 px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {announcements && announcements.length > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary-foreground backdrop-blur-md mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-sm font-medium">{announcements[0].title}</span>
                </div>
              )}

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tighter leading-none">
                Nepal's <span className="text-gradient">Premier</span><br />Esports Arena
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
                Where squads become legends. Register for the biggest PUBG Mobile, Free Fire, and Valorant tournaments in the region.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <Link href="/tournaments">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 h-14 font-display uppercase tracking-wider font-bold shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] transition-all w-full sm:w-auto">
                    Find Events <Trophy className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/news">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-display uppercase tracking-wider font-bold border-white/10 hover:bg-white/5 w-full sm:w-auto backdrop-blur-md">
                    Latest News
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Stats bar */}
          {!isStatsLoading && stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-20"
            >
              <div className="glass-card rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
                <div>
                  <p className="text-3xl font-display font-bold text-white">{(stats as any).totalRegistrations?.toLocaleString() ?? (stats as any).totalPlayers}+</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Registrations</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-white">{(stats as any).totalTournaments}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Tournaments</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-primary">{stats.totalPrizeDistributed}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Prize Distributed</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-emerald-400">{stats.activeTournaments}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Active Events</p>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* Featured Tournaments */}
        <section className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight flex items-center gap-3">
                <Activity className="text-primary" /> Upcoming Events
              </h2>
              <p className="text-muted-foreground mt-2">The most competitive tournaments coming up.</p>
            </div>
            <Link href="/tournaments">
              <Button variant="ghost" className="hidden md:flex uppercase font-display tracking-wider hover:text-primary">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isFeaturedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-[300px] rounded-xl bg-card/50 animate-pulse border border-white/5" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured?.featuredTournaments.slice(0, 3).map((tournament, i) => (
                <motion.div key={tournament.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/tournaments/${tournament.id}`}>
                    <Card className="glass-card glass-card-hover h-full border-white/5 overflow-hidden group cursor-pointer relative">
                      {tournament.bannerUrl && (
                        <div className="h-40 w-full overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                          <img src={tournament.bannerUrl} alt={tournament.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <CardContent className="p-6 relative z-20">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant={tournament.status === "live" ? "default" : "secondary"} className={tournament.status === "live" ? "bg-emerald-500 hover:bg-emerald-600 live-glow" : ""}>
                            {tournament.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-mono text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(tournament.startDate).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-display font-bold mb-2 uppercase line-clamp-2">{tournament.title}</h3>
                        {tournament.gameName && <p className="text-sm text-muted-foreground mb-4">{tournament.gameName}</p>}
                        <div className="flex items-center justify-between border-t border-white/10 pt-4">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Prize Pool</p>
                            <p className="font-display font-bold text-primary">{tournament.prizePool}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Teams</p>
                            <p className="font-mono text-sm">{tournament.registeredTeams} / {tournament.maxTeams}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
              {(!featured?.featuredTournaments || featured.featuredTournaments.length === 0) && (
                <div className="col-span-full py-16 text-center text-muted-foreground">No upcoming events right now. Check back soon!</div>
              )}
            </div>
          )}
        </section>

        {/* Latest News */}
        {featured?.latestNews && featured.latestNews.length > 0 && (
          <section className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight flex items-center gap-3">
                  <Newspaper className="text-primary" /> Latest News
                </h2>
                <p className="text-muted-foreground mt-2">Stay up to date with the esports scene.</p>
              </div>
              <Link href="/news">
                <Button variant="ghost" className="hidden md:flex uppercase font-display tracking-wider hover:text-primary">
                  All Articles <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.latestNews.slice(0, 4).map((post: any, i: number) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/news/${post.id}`}>
                    <Card className="glass-card glass-card-hover h-full border-white/5 overflow-hidden group cursor-pointer">
                      <div className="h-32 overflow-hidden relative bg-muted/20">
                        {post.coverUrl ? (
                          <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-card/50" />
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/80 text-white">{post.category}</span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-mono mb-2">{new Date(post.publishedAt).toLocaleDateString()}</p>
                        <h3 className="font-display font-bold uppercase text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-3">{post.title}</h3>
                        <div className="flex items-center text-primary text-xs font-bold uppercase tracking-wider">
                          Read <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

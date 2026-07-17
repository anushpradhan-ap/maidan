import { useGetFeaturedContent, useGetCommunityStats, useListAnnouncements } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Trophy, Users, MonitorPlay, ChevronRight, Activity, Gamepad2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: featured, isLoading: isFeaturedLoading } = useGetFeaturedContent();
  const { data: stats, isLoading: isStatsLoading } = useGetCommunityStats();
  const { data: announcements } = useListAnnouncements({ limit: 3 });

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_50%)] z-10" />
          <img 
            src="/images/hero-bg.jpg" 
            alt="Esports Arena" 
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium">{announcements[0].title}</span>
              </div>
            )}

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tighter leading-none">
              Nepal's <span className="text-gradient">Premier</span><br />
              Esports Arena
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
              Where squads become legends. Register for the biggest PUBG Mobile, Free Fire, and Valorant tournaments in the region.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/tournaments">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 h-14 font-display uppercase tracking-wider font-bold shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] transition-all w-full sm:w-auto">
                  Find Tournaments <Trophy className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-display uppercase tracking-wider font-bold border-white/10 hover:bg-white/5 w-full sm:w-auto backdrop-blur-md">
                  View Leaderboards
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats Bar */}
        {!isStatsLoading && stats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-20"
          >
            <div className="glass-card rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
              <div>
                <p className="text-3xl font-display font-bold text-white">{stats.totalPlayers.toLocaleString()}+</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Players</p>
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-white">{stats.totalTeams.toLocaleString()}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Registered Teams</p>
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
              <Activity className="text-primary" /> Top Tournaments
            </h2>
            <p className="text-muted-foreground mt-2">The most competitive events right now.</p>
          </div>
          <Link href="/tournaments">
            <Button variant="ghost" className="hidden md:flex uppercase font-display tracking-wider hover:text-primary">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isFeaturedLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[300px] rounded-xl bg-card/50 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured?.featuredTournaments.slice(0, 3).map((tournament, i) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/tournaments/${tournament.id}`}>
                  <Card className="glass-card glass-card-hover h-full border-white/5 overflow-hidden group cursor-pointer relative">
                    {tournament.bannerUrl && (
                      <div className="h-40 w-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                        <img 
                          src={tournament.bannerUrl} 
                          alt={tournament.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className="p-6 relative z-20">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant={tournament.status === 'live' ? 'default' : 'secondary'} className={tournament.status === 'live' ? 'bg-emerald-500 hover:bg-emerald-600 live-glow' : ''}>
                          {tournament.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-mono text-muted-foreground">{new Date(tournament.startDate).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl font-display font-bold mb-2 uppercase line-clamp-2">{tournament.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Gamepad2 className="w-4 h-4" /> {tournament.gameName}
                      </div>
                      <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
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
          </div>
        )}
      </section>

      {/* Live Action Banner */}
      {featured?.liveTournaments && featured.liveTournaments.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden bg-card border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)]" />
            
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-display font-bold uppercase tracking-wider">Live Now</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-black uppercase leading-tight mb-4">
                {featured.liveTournaments[0].title}
              </h2>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-primary" /> {featured.liveTournaments[0].gameName}</span>
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {featured.liveTournaments[0].teamsAlive} Teams Alive</span>
                <span className="flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> Round {featured.liveTournaments[0].currentRound}/{featured.liveTournaments[0].totalRounds}</span>
              </div>
            </div>

            <div className="relative z-10 w-full md:w-auto">
              <Link href="/live">
                <Button size="lg" className="w-full bg-white text-black hover:bg-white/90 font-display uppercase font-bold tracking-wider px-8 h-14">
                  Watch Stream <MonitorPlay className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

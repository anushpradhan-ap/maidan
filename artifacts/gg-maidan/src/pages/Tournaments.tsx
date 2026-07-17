import { useState } from "react";
import { Link } from "wouter";
import { useListTournaments } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Gamepad2, Trophy, Users, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function Tournaments() {
  const [status, setStatus] = useState<"upcoming" | "live" | "completed">("upcoming");
  const { data: tournaments, isLoading } = useListTournaments({ status });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-4">
          Tournaments
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Discover and register for the most competitive esports events in Nepal. Prove your worth on the Maidan.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
        <Tabs defaultValue="upcoming" onValueChange={(v) => setStatus(v as any)} className="w-full md:w-auto">
          <TabsList className="bg-card/50 border border-white/5">
            <TabsTrigger value="upcoming" className="font-display uppercase tracking-wider text-xs px-6">Upcoming</TabsTrigger>
            <TabsTrigger value="live" className="font-display uppercase tracking-wider text-xs px-6">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="font-display uppercase tracking-wider text-xs px-6">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            className="pl-9 bg-card/30 border-white/10 font-sans focus-visible:ring-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[350px] rounded-xl bg-card/30 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : tournaments?.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-xl">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-display font-bold uppercase mb-2">No Tournaments Found</h3>
          <p className="text-muted-foreground">There are no {status} tournaments at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments?.map((tournament, i) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/tournaments/${tournament.id}`}>
                <Card className="glass-card glass-card-hover h-full border-white/5 overflow-hidden group cursor-pointer flex flex-col">
                  {tournament.bannerUrl ? (
                    <div className="h-48 w-full overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
                      <img 
                        src={tournament.bannerUrl} 
                        alt={tournament.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <Badge className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur-md text-white border-white/10">
                        {tournament.gameName}
                      </Badge>
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-muted/20 flex items-center justify-center relative">
                      <Gamepad2 className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  
                  <CardContent className="p-6 flex-1 flex flex-col relative z-20 -mt-10">
                    <div className="mb-4">
                      {status === 'live' ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 live-glow">
                          LIVE NOW
                        </Badge>
                      ) : status === 'completed' ? (
                        <Badge variant="outline" className="bg-card">COMPLETED</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">UPCOMING</Badge>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-display font-bold uppercase line-clamp-2 mb-4">
                      {tournament.title}
                    </h3>
                    
                    <div className="space-y-3 mb-6 mt-auto">
                      <div className="flex items-center text-sm text-muted-foreground gap-3">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-3">
                        <Users className="w-4 h-4 text-secondary" />
                        <span>{tournament.registeredTeams} / {tournament.maxTeams} Teams</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Prize Pool</p>
                        <p className="font-display font-bold text-lg text-primary">{tournament.prizePool}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="font-display uppercase tracking-wider text-xs hover:bg-white/5">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

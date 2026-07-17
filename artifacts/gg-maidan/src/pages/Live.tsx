import { useGetLiveTournaments } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crosshair, Map, Skull, Users, PlayCircle, Radio } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export default function Live() {
  const { data: liveTournaments, isLoading } = useGetLiveTournaments({
    query: { refetchInterval: 5000 } // Poll every 5s for real-time feel
  });

  const activeTournament = liveTournaments?.[0]; // Show the most prominent live tournament

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-primary animate-spin-slow"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Radio className="w-8 h-8 text-emerald-500 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-emerald-500 animate-pulse">Establishing Connection</h2>
        <p className="text-muted-foreground font-mono mt-2">Connecting to game server...</p>
      </div>
    );
  }

  if (!activeTournament) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <Radio className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
        <h2 className="text-3xl font-display font-bold uppercase mb-4 text-white">No Live Matches</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          There are currently no active tournaments. Check the schedule for upcoming events.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative pb-20">
      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.2),transparent_50%)]" />
        <div className="absolute w-full h-full bg-[url('/images/live-bg.jpg')] bg-cover bg-center mix-blend-screen opacity-30" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.2)_2px,rgba(0,0,0,0.2)_4px)]" />
      </div>

      <div className="container mx-auto px-4 pt-6 relative z-10">
        
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between bg-card/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-bold uppercase tracking-wider">Live</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-black uppercase text-white leading-tight">
                {activeTournament.title}
              </h1>
              <p className="text-sm text-primary font-mono">{activeTournament.gameName}</p>
            </div>
          </div>

          <div className="flex gap-6 md:gap-10 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            <div className="flex flex-col items-center min-w-max">
              <span className="text-[10px] uppercase text-muted-foreground tracking-widest mb-1">Round</span>
              <span className="font-display font-bold text-2xl text-white">{activeTournament.currentRound}/{activeTournament.totalRounds}</span>
            </div>
            <div className="flex flex-col items-center min-w-max">
              <span className="text-[10px] uppercase text-muted-foreground tracking-widest mb-1">Teams Alive</span>
              <span className="font-display font-bold text-2xl text-emerald-400">{activeTournament.teamsAlive}</span>
            </div>
            <div className="flex flex-col items-center min-w-max">
              <span className="text-[10px] uppercase text-muted-foreground tracking-widest mb-1">Current Zone</span>
              <span className="font-display font-bold text-2xl text-secondary">{activeTournament.currentZone || 'Phase 1'}</span>
            </div>
            {activeTournament.topFragger && (
              <div className="flex flex-col items-center min-w-max bg-white/5 px-4 rounded-lg">
                <span className="text-[10px] uppercase text-yellow-500 tracking-widest mb-1">Top Fragger</span>
                <span className="font-display font-bold text-xl text-white">{activeTournament.topFragger} <span className="text-sm text-muted-foreground font-mono">({activeTournament.topFraggerKills}K)</span></span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Stream Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black border-white/10 overflow-hidden shadow-2xl relative group">
              <div className="aspect-video w-full bg-zinc-900 relative">
                {activeTournament.streamUrl ? (
                  <iframe 
                    src={activeTournament.streamUrl} 
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-display uppercase tracking-widest">Stream Starting Soon</p>
                  </div>
                )}
                
                {/* Simulated game HUD overlay */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-white/10 rounded px-3 py-1 flex items-center gap-4 text-xs font-mono">
                  <span className="text-white"><Users className="w-3 h-3 inline mr-1 text-emerald-500"/> ALIVE: {activeTournament.teamsAlive * 4}</span>
                  <span className="text-white"><Map className="w-3 h-3 inline mr-1 text-primary"/> ZONE: {activeTournament.currentZone}</span>
                </div>
              </div>
            </Card>

            {/* Standings Table */}
            <Card className="glass-card border-white/10">
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <h3 className="font-display font-bold uppercase tracking-wider text-white">Live Standings</h3>
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 font-mono text-[10px]">UPDATING</Badge>
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="w-[60px] text-center">#</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center">Kills</TableHead>
                      <TableHead className="text-right pr-6">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeTournament.standings.map((team, idx) => (
                      <TableRow key={team.teamId} className={`border-white/5 ${idx < 3 ? 'bg-primary/5' : ''}`}>
                        <TableCell className="text-center font-mono text-muted-foreground">{team.rank}</TableCell>
                        <TableCell className="font-bold text-white">{team.teamName}</TableCell>
                        <TableCell className="text-center font-mono text-gray-300">{team.kills}</TableCell>
                        <TableCell className="text-right pr-6 font-display font-bold text-primary">{team.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Kill Feed Sidebar */}
          <div className="lg:h-[calc(100vh-140px)]">
            <Card className="glass-card border-white/10 h-full flex flex-col">
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-emerald-400" />
                <h3 className="font-display font-bold uppercase tracking-wider text-white">Match Feed</h3>
              </div>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-3 flex flex-col-reverse">
                    <AnimatePresence>
                      {activeTournament.recentUpdates.map((update) => (
                        <motion.div
                          key={update.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border text-sm ${
                            update.type === 'kill' ? 'bg-red-500/10 border-red-500/20' :
                            update.type === 'zone' ? 'bg-blue-500/10 border-blue-500/20' :
                            update.type === 'round_start' ? 'bg-emerald-500/10 border-emerald-500/20 text-center' :
                            'bg-white/5 border-white/10'
                          }`}
                        >
                          {update.type === 'kill' && (
                            <div className="flex items-start gap-2">
                              <Skull className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                              <div>
                                <span className="font-bold text-white">{update.playerName}</span> 
                                <span className="text-muted-foreground mx-1">knocked out</span>
                                <span className="font-bold text-red-200">{update.teamName}</span>
                              </div>
                            </div>
                          )}
                          {update.type === 'zone' && (
                            <div className="flex items-center gap-2">
                              <Map className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-100">{update.message}</span>
                            </div>
                          )}
                          {update.type === 'round_start' && (
                            <span className="font-display uppercase tracking-widest text-emerald-400 font-bold">
                              {update.message}
                            </span>
                          )}
                          {(update.type === 'event' || update.type === 'round_end') && (
                            <span className="text-gray-300">{update.message}</span>
                          )}
                          <div className="text-[10px] text-muted-foreground font-mono mt-1 text-right">
                            {new Date(update.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

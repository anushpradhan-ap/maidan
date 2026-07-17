import { useRoute } from "wouter";
import { useGetTournament, useGetTournamentStandings, useRegisterForTournament } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, Info, Crosshair, AlertCircle, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TournamentDetail() {
  const [, params] = useRoute("/tournaments/:id");
  const id = Number(params?.id);

  const { data: tournament, isLoading } = useGetTournament(id, {
    query: { enabled: !!id, queryKey: ['/api/tournaments', id] } // Fallback key if generated is missing
  });

  const { data: standings } = useGetTournamentStandings(id, {
    query: { enabled: !!id && tournament?.status !== 'upcoming', queryKey: ['/api/tournaments', id, 'standings'] }
  });

  const registerMutation = useRegisterForTournament();

  if (isLoading) {
    return <div className="container mx-auto px-4 py-20 text-center animate-pulse">Loading tournament data...</div>;
  }

  if (!tournament) {
    return <div className="container mx-auto px-4 py-20 text-center">Tournament not found</div>;
  }

  return (
    <div className="pb-20">
      {/* Banner Header */}
      <div className="relative h-[40vh] md:h-[50vh] w-full border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        {tournament.bannerUrl ? (
          <img 
            src={tournament.bannerUrl} 
            alt={tournament.title}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-muted/20" />
        )}
        
        <div className="absolute bottom-0 left-0 w-full z-20 p-6 md:p-12">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={tournament.status === 'live' ? 'bg-emerald-500' : 'bg-primary'}>
                {tournament.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="backdrop-blur-md bg-black/20 border-white/20">
                {tournament.gameName}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight mb-4 text-white drop-shadow-lg">
              {tournament.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-200">
              <span className="flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> {tournament.prizePool}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-secondary" /> {tournament.registeredTeams} / {tournament.maxTeams} Teams</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-400" /> {new Date(tournament.startDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-card border border-white/5 h-12 p-1">
                <TabsTrigger value="overview" className="font-display uppercase tracking-wider text-xs h-full">Overview</TabsTrigger>
                <TabsTrigger value="standings" className="font-display uppercase tracking-wider text-xs h-full">Standings</TabsTrigger>
                <TabsTrigger value="brackets" className="font-display uppercase tracking-wider text-xs h-full">Brackets</TabsTrigger>
                <TabsTrigger value="rules" className="font-display uppercase tracking-wider text-xs h-full">Rules</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 pt-6">
                {tournament.description && (
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><Info className="w-5 h-5 text-primary" /> About Event</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {tournament.description}
                    </CardContent>
                  </Card>
                )}

                <h3 className="text-2xl font-display font-bold uppercase mt-8 mb-4">Schedule</h3>
                <div className="space-y-3">
                  {tournament.schedule?.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-card/50 border border-white/5 hover:bg-white/5 transition-colors">
                      <div className="mb-2 sm:mb-0">
                        <p className="font-display font-bold text-lg">{item.label}</p>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 text-primary font-mono text-sm">
                        <Clock className="w-4 h-4" /> {new Date(item.datetime).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {(!tournament.schedule || tournament.schedule.length === 0) && (
                    <p className="text-muted-foreground italic">Schedule TBA</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="standings" className="pt-6">
                <Card className="glass-card">
                  <CardContent className="p-0">
                    {standings && standings.length > 0 ? (
                      <Table>
                        <TableHeader className="bg-white/5">
                          <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="w-[80px] font-display uppercase text-xs">Rank</TableHead>
                            <TableHead className="font-display uppercase text-xs">Team</TableHead>
                            <TableHead className="text-right font-display uppercase text-xs">Kills</TableHead>
                            <TableHead className="text-right font-display uppercase text-xs">Points</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {standings.map((s) => (
                            <TableRow key={s.teamId} className="border-white/5 hover:bg-white/5">
                              <TableCell className="font-mono text-muted-foreground">#{s.rank}</TableCell>
                              <TableCell className="font-bold">{s.teamName}</TableCell>
                              <TableCell className="text-right font-mono">{s.kills}</TableCell>
                              <TableCell className="text-right font-mono text-primary font-bold">{s.points}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        Standings will be available once matches begin.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="brackets" className="pt-6">
                <div className="p-8 text-center text-muted-foreground glass-card rounded-xl">
                  Bracket visualization requires at least 4 teams to be seeded.
                </div>
              </TabsContent>

              <TabsContent value="rules" className="pt-6">
                <Card className="glass-card">
                  <CardContent className="p-6 prose prose-invert max-w-none text-muted-foreground">
                    {tournament.rules ? (
                      <div dangerouslySetInnerHTML={{ __html: tournament.rules }} />
                    ) : (
                      <p>Standard G.G. Maidan competitive rules apply.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar CTA */}
          <div className="space-y-6">
            <Card className="glass-card border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
              <CardContent className="p-6">
                <h3 className="font-display font-bold uppercase text-xl mb-6 text-center">Registration</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-bold text-white capitalize">{tournament.status}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground">Slots</span>
                    <span className="font-mono">{tournament.registeredTeams} / {tournament.maxTeams}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground">Entry Fee</span>
                    <span className="font-bold text-emerald-400">Free</span>
                  </div>
                </div>

                {tournament.status === 'upcoming' ? (
                  <Button 
                    className="w-full h-14 text-lg font-display uppercase tracking-widest font-bold bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                    disabled={tournament.registeredTeams >= tournament.maxTeams}
                  >
                    {tournament.registeredTeams >= tournament.maxTeams ? 'Event Full' : 'Register Team'}
                  </Button>
                ) : (
                  <Button variant="secondary" className="w-full h-14" disabled>
                    Registration Closed
                  </Button>
                )}
                
                <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Must be team captain to register
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg uppercase font-display">Prize Pool</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary mb-4 text-center">
                  {tournament.prizePool}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="font-bold text-yellow-500">1st Place</span>
                    <span>50%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="font-bold text-slate-300">2nd Place</span>
                    <span>30%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="font-bold text-orange-400">3rd Place</span>
                    <span>20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

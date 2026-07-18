import { useState } from 'react';
import { useRoute } from "wouter";
import { useGetTournament, useGetTournamentStandings, useListTeams } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Calendar, Users, Info, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TournamentDetail() {
  const [, params] = useRoute("/tournaments/:id");
  const id = Number(params?.id);

  const { data: tournament, isLoading } = useGetTournament(id, {
    query: { enabled: !!id }
  });
  const { data: standings } = useGetTournamentStandings(id, {
    query: { enabled: !!id && tournament?.status !== 'upcoming' }
  });
  const { data: teams } = useListTeams({ gameId: tournament?.gameId } as any, {
    query: { enabled: !!tournament }
  });

  const [regOpen, setRegOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  async function handleRegister() {
    if (!selectedTeam || !id) return;
    setRegLoading(true);
    setRegError('');
    try {
      const apiBase = import.meta.env.VITE_API_URL ?? '';
      const res = await fetch(`${apiBase}/api/tournaments/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: Number(selectedTeam) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(err.error || 'Registration failed');
      }
      setRegSuccess(true);
    } catch (e: any) {
      setRegError(e.message);
    } finally {
      setRegLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading tournament…</p>
      </div>
    );
  }

  if (!tournament) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Tournament not found</div>;
  }

  return (
    <div className="pb-20">
      {/* Banner Header */}
      <div className="relative h-[40vh] md:h-[50vh] w-full border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        {tournament.bannerUrl ? (
          <img src={tournament.bannerUrl} alt={tournament.title} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        )}
        <div className="absolute bottom-0 left-0 w-full z-20 p-6 md:p-12">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={tournament.status === 'live' ? 'bg-emerald-500 text-white' : tournament.status === 'completed' ? 'bg-gray-600' : 'bg-primary'}>
                {tournament.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-1.5" />}
                {tournament.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="backdrop-blur-md bg-black/20 border-white/20">{tournament.gameName}</Badge>
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
          {/* Main Content */}
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
                    <CardContent className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{tournament.description}</CardContent>
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
                      <div className="p-8 text-center text-muted-foreground">Standings will be available once matches begin.</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="brackets" className="pt-6">
                {tournament.brackets && tournament.brackets.length > 0 ? (
                  <div className="space-y-3">
                    {tournament.brackets.map((b) => (
                      <div key={b.id} className="flex items-center gap-4 p-4 glass-card rounded-xl">
                        <span className="text-xs text-muted-foreground font-mono w-16">Round {b.round}</span>
                        <div className={`flex-1 text-center font-bold ${b.winner === b.team1Name ? 'text-white' : 'text-muted-foreground'}`}>{b.team1Name}</div>
                        <div className="text-center font-mono text-sm bg-card px-3 py-1 rounded-lg border border-white/10">
                          <span className="text-white">{b.score1}</span>
                          <span className="text-muted-foreground mx-1">—</span>
                          <span className="text-white">{b.score2}</span>
                        </div>
                        <div className={`flex-1 text-center font-bold ${b.winner === b.team2Name ? 'text-white' : 'text-muted-foreground'}`}>{b.team2Name}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground glass-card rounded-xl">Bracket will be published before the tournament begins.</div>
                )}
              </TabsContent>

              <TabsContent value="rules" className="pt-6">
                <Card className="glass-card">
                  <CardContent className="p-6 text-muted-foreground leading-relaxed">
                    {tournament.rules ? (
                      <pre className="whitespace-pre-wrap font-sans text-sm">{tournament.rules}</pre>
                    ) : (
                      <p>Standard G.G. Maidan competitive rules apply.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
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
                    onClick={() => { setRegOpen(true); setRegSuccess(false); setRegError(''); }}
                  >
                    {tournament.registeredTeams >= tournament.maxTeams ? 'Event Full' : 'Register Team'}
                  </Button>
                ) : (
                  <Button variant="secondary" className="w-full h-14" disabled>
                    {tournament.status === 'live' ? '🔴 Ongoing' : 'Registration Closed'}
                  </Button>
                )}
                <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Must be team captain to register
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader><CardTitle className="text-lg uppercase font-display">Prize Pool</CardTitle></CardHeader>
              <CardContent>
                <div className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary mb-4 text-center">
                  {tournament.prizePool}
                </div>
                <div className="space-y-2 text-sm">
                  {[['1st Place','text-yellow-500','50%'],['2nd Place','text-slate-300','30%'],['3rd Place','text-orange-400','20%']].map(([label,color,pct]) => (
                    <div key={label} className="flex justify-between p-2 bg-white/5 rounded">
                      <span className={`font-bold ${color}`}>{label}</span>
                      <span>{pct}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <Dialog open={regOpen} onOpenChange={open => { setRegOpen(open); if (!open) { setRegSuccess(false); setRegError(''); setSelectedTeam(''); } }}>
        <DialogContent className="bg-card border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase text-xl">Register for {tournament.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select your team to claim a slot. Registration is first-come, first-served.
            </DialogDescription>
          </DialogHeader>

          {regSuccess ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-400" />
              <p className="font-display uppercase text-xl font-bold text-white">You're Registered!</p>
              <p className="text-muted-foreground text-center text-sm">Your team has been registered. Good luck in the tournament!</p>
              <Button className="w-full bg-primary" onClick={() => setRegOpen(false)}>Close</Button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Select Your Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-full bg-black/40 border-white/10 text-white">
                    <SelectValue placeholder="Choose a team…" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    {teams?.filter(t => t.gameId === tournament.gameId).map(t => (
                      <SelectItem key={t.id} value={String(t.id)} className="text-white hover:bg-white/10">
                        [{t.tag}] {t.name}
                      </SelectItem>
                    ))}
                    {(!teams || teams.filter(t => t.gameId === tournament.gameId).length === 0) && (
                      <SelectItem value="_none" disabled>No teams found for this game</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {regError && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {regError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 font-display uppercase tracking-wider"
                  disabled={!selectedTeam || selectedTeam === '_none' || regLoading}
                  onClick={handleRegister}
                >
                  {regLoading ? 'Registering…' : 'Confirm Registration'}
                </Button>
                <Button variant="outline" className="border-white/10" onClick={() => setRegOpen(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

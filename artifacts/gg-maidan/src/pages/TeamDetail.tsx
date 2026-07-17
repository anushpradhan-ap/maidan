import { useRoute, Link } from "wouter";
import { useGetTeam } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Trophy, Swords, User, Activity, ArrowLeft } from "lucide-react";

export default function TeamDetail() {
  const [, params] = useRoute("/teams/:id");
  const id = Number(params?.id);

  const { data: team, isLoading } = useGetTeam(id, {
    query: { enabled: !!id, queryKey: ['/api/teams', id] }
  });

  if (isLoading) return <div className="container py-20 text-center animate-pulse">Loading team...</div>;
  if (!team) return <div className="container py-20 text-center">Team not found</div>;

  return (
    <div className="pb-20">
      {/* Banner */}
      <div className="relative h-64 md:h-80 w-full border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        {team.bannerUrl ? (
          <img src={team.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="w-full h-full bg-primary/10 pattern-dots" />
        )}
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-20">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Logo & Core Stats */}
          <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
            <Card className="glass-card overflow-hidden text-center border-primary/20">
              <div className="p-8 pb-4">
                <div className="w-32 h-32 mx-auto bg-card rounded-2xl border-2 border-primary/50 shadow-[0_0_30px_rgba(139,92,246,0.3)] flex items-center justify-center overflow-hidden mb-6">
                  {team.logoUrl ? (
                    <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-16 h-16 text-primary" />
                  )}
                </div>
                <h1 className="text-3xl font-display font-black uppercase mb-1">{team.name}</h1>
                <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-widest mb-4">
                  [{team.tag}]
                </Badge>
                <p className="text-sm text-muted-foreground">{team.gameName}</p>
              </div>
              
              <div className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 bg-white/5">
                <div className="p-4">
                  <p className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Rank</p>
                  <p className="text-2xl font-display font-bold text-white">#{team.rank}</p>
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Rating</p>
                  <p className="text-2xl font-display font-bold text-primary">{team.points}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Win/Loss Record
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-400 font-bold">{team.wins} Wins</span>
                  <span className="text-destructive font-bold">{team.losses} Losses</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${(team.wins / (team.wins + team.losses || 1)) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-destructive" 
                    style={{ width: `${(team.losses / (team.wins + team.losses || 1)) * 100}%` }} 
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="text-xl font-mono font-bold">
                    {Math.round((team.wins / (team.wins + team.losses || 1)) * 100)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roster & History */}
          <div className="flex-1 space-y-8 w-full">
            <div>
              <h3 className="text-2xl font-display font-bold uppercase mb-4 flex items-center gap-2">
                <User className="text-primary" /> Active Roster
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {team.members.map(player => (
                  <Link key={player.id} href={`/players/${player.id}`}>
                    <Card className="glass-card glass-card-hover cursor-pointer border-white/5">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted/20 overflow-hidden border border-white/10">
                          {player.avatarUrl ? (
                            <img src={player.avatarUrl} alt={player.username} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 m-3 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white mb-0.5">{player.username}</p>
                          <p className="text-xs text-muted-foreground uppercase">{player.role || 'Player'}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-xs text-muted-foreground uppercase">K/D</p>
                          <p className="font-mono font-bold text-primary">
                            {(player.kills / (player.deaths || 1)).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-display font-bold uppercase mb-4 flex items-center gap-2">
                <Trophy className="text-secondary" /> Recent Matches
              </h3>
              <Card className="glass-card overflow-hidden">
                <div className="divide-y divide-white/5">
                  {team.recentMatches.map(match => (
                    <div key={match.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/5 transition-colors gap-4">
                      <div>
                        <p className="font-bold text-white mb-1">{match.tournamentName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(match.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground uppercase">Kills</p>
                          <p className="font-mono font-bold">{match.kills}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground uppercase">Placement</p>
                          <p className="font-mono font-bold text-white">#{match.placement}</p>
                        </div>
                        <Badge className={`w-16 justify-center ${
                          match.result === 'win' ? 'bg-emerald-500' : 
                          match.result === 'loss' ? 'bg-destructive' : 'bg-muted text-foreground'
                        }`}>
                          {match.result.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {team.recentMatches.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">No recent matches found.</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

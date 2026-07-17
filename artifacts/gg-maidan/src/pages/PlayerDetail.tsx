import { useRoute } from "wouter";
import { useGetPlayer } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Crosshair, Trophy, Skull, Medal, Shield } from "lucide-react";

export default function PlayerDetail() {
  const [, params] = useRoute("/players/:id");
  const id = Number(params?.id);

  const { data: player, isLoading } = useGetPlayer(id, {
    query: { enabled: !!id, queryKey: ['/api/players', id] }
  });

  if (isLoading) return <div className="container py-20 text-center animate-pulse">Loading player...</div>;
  if (!player) return <div className="container py-20 text-center">Player not found</div>;

  const kdRatio = (player.kills / (player.deaths || 1)).toFixed(2);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Profile Column */}
        <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
          <Card className="glass-card text-center overflow-hidden border-t-4 border-t-primary">
            <div className="p-8">
              <div className="w-32 h-32 mx-auto rounded-full bg-card border-4 border-white/10 p-1 mb-6 relative">
                <div className="absolute inset-0 rounded-full border border-primary/50 animate-[spin_4s_linear_infinite]" />
                <div className="w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {player.avatarUrl ? (
                    <img src={player.avatarUrl} alt={player.username} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
              </div>
              <h1 className="text-3xl font-display font-black uppercase tracking-tight text-white mb-1">
                {player.username}
              </h1>
              {player.fullName && (
                <p className="text-muted-foreground text-sm mb-4">{player.fullName}</p>
              )}
              
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">
                  {player.gameName}
                </Badge>
                {player.role && (
                  <Badge variant="outline" className="border-white/20">
                    {player.role}
                  </Badge>
                )}
                {player.country && (
                  <Badge variant="outline" className="border-white/20">
                    {player.country}
                  </Badge>
                )}
              </div>

              {player.teamName ? (
                <div className="flex items-center justify-center gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
                  <Shield className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-bold">{player.teamName}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">Free Agent</div>
              )}
            </div>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-gray-300">
                {player.bio || "This player prefers to let their gameplay do the talking."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats & History Column */}
        <div className="flex-1 space-y-8">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card border-white/5 bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6 text-center">
                <Crosshair className="w-6 h-6 text-primary mx-auto mb-2 opacity-80" />
                <p className="text-3xl font-display font-bold text-white">{player.kills}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Total Kills</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/5 bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6 text-center">
                <Skull className="w-6 h-6 text-destructive mx-auto mb-2 opacity-80" />
                <p className="text-3xl font-display font-bold text-white">{player.deaths}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Total Deaths</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/5 border-b-primary/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-50" />
              <CardContent className="p-6 text-center relative z-10">
                <p className="text-xs uppercase tracking-wider text-primary mb-2 font-bold">K/D Ratio</p>
                <p className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{kdRatio}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/5">
              <CardContent className="p-6 text-center">
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2 opacity-80" />
                <p className="text-3xl font-display font-bold text-white">{player.tournamentWins}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Tournament Wins</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Matches */}
            <div>
              <h3 className="text-xl font-display font-bold uppercase mb-4 flex items-center gap-2">
                <Activity className="text-secondary" /> Match History
              </h3>
              <Card className="glass-card overflow-hidden">
                <div className="divide-y divide-white/5">
                  {player.matchHistory?.map((match) => (
                    <div key={match.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div>
                        <p className="font-bold text-white mb-1 line-clamp-1">{match.tournamentName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(match.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-primary font-bold">{match.kills} Kills</p>
                        <p className="text-xs text-muted-foreground">Placement: #{match.placement}</p>
                      </div>
                    </div>
                  ))}
                  {(!player.matchHistory || player.matchHistory.length === 0) && (
                    <div className="p-8 text-center text-muted-foreground">No match history available.</div>
                  )}
                </div>
              </Card>
            </div>

            {/* Badges/Achievements */}
            <div>
              <h3 className="text-xl font-display font-bold uppercase mb-4 flex items-center gap-2">
                <Medal className="text-yellow-500" /> Achievements
              </h3>
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {player.badges?.map((badge) => (
                      <div key={badge.id} className="bg-white/5 rounded-lg p-4 border border-white/5 flex flex-col items-center text-center hover:bg-white/10 transition-colors cursor-help group">
                        <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          {badge.iconUrl ? (
                            <img src={badge.iconUrl} alt={badge.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <Medal className="w-6 h-6 text-yellow-500" />
                          )}
                        </div>
                        <p className="font-bold text-sm text-white mb-1">{badge.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
                      </div>
                    ))}
                    {(!player.badges || player.badges.length === 0) && (
                      <div className="col-span-2 text-center text-muted-foreground py-4">
                        No achievements unlocked yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Just add Activity import since I used it but forgot it
import { Activity } from "lucide-react";
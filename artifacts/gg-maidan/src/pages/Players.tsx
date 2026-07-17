import { useState } from "react";
import { Link } from "wouter";
import { useListPlayers, useListGames } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, Crosshair, Trophy } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Players() {
  const [gameId, setGameId] = useState<string>("all");
  const { data: players, isLoading } = useListPlayers(gameId !== "all" ? { gameId: Number(gameId) } : undefined);
  const { data: games } = useListGames();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-2 text-white">
            Player Leaderboard
          </h1>
          <p className="text-muted-foreground">Top fraggers and MVPs.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search players..." 
              className="pl-9 bg-card/50 border-white/10"
            />
          </div>
          <Select value={gameId} onValueChange={setGameId}>
            <SelectTrigger className="w-full sm:w-48 bg-card/50 border-white/10">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              {games?.map(g => (
                <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="glass-card border-white/10 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-[80px] text-center font-display uppercase text-xs tracking-wider">Rank</TableHead>
                  <TableHead className="font-display uppercase text-xs tracking-wider">Player</TableHead>
                  <TableHead className="font-display uppercase text-xs tracking-wider">Team</TableHead>
                  <TableHead className="text-center font-display uppercase text-xs tracking-wider">K/D</TableHead>
                  <TableHead className="text-center font-display uppercase text-xs tracking-wider">Tournament Wins</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-white/5">
                      <TableCell colSpan={5} className="h-16">
                        <div className="h-full w-full bg-white/5 animate-pulse rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : players?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No players found.
                    </TableCell>
                  </TableRow>
                ) : (
                  players?.map((player) => (
                    <TableRow key={player.id} className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                      <TableCell className="text-center font-mono text-muted-foreground">
                        #{player.rank}
                      </TableCell>
                      <TableCell>
                        <Link href={`/players/${player.id}`} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center overflow-hidden border border-white/10">
                            {player.avatarUrl ? (
                              <img src={player.avatarUrl} alt={player.username} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-primary transition-colors">
                              {player.username}
                            </div>
                            <div className="text-xs text-muted-foreground">{player.gameName}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {player.teamName ? (
                          <Badge variant="outline" className="border-white/10 text-gray-300">
                            {player.teamName}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Free Agent</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-primary font-bold">
                          {(player.kills / (player.deaths || 1)).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Trophy className={`w-4 h-4 ${player.tournamentWins > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                          <span className="font-mono">{player.tournamentWins}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

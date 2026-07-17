import { useState } from "react";
import { Link } from "wouter";
import { useListTeams, useListGames } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trophy, Shield, Swords, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Teams() {
  const [gameId, setGameId] = useState<string>("all");
  const { data: teams, isLoading } = useListTeams(gameId !== "all" ? { gameId: Number(gameId) } : undefined);
  const { data: games } = useListGames();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-2 text-white">
            Team Rankings
          </h1>
          <p className="text-muted-foreground">The best squads in the region.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search teams..." 
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
                  <TableHead className="w-[100px] text-center font-display uppercase text-xs tracking-wider">Rank</TableHead>
                  <TableHead className="font-display uppercase text-xs tracking-wider">Team</TableHead>
                  <TableHead className="font-display uppercase text-xs tracking-wider">Game</TableHead>
                  <TableHead className="text-center font-display uppercase text-xs tracking-wider">W - L</TableHead>
                  <TableHead className="text-right font-display uppercase text-xs tracking-wider pr-6">Rating</TableHead>
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
                ) : teams?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No teams found.
                    </TableCell>
                  </TableRow>
                ) : (
                  teams?.map((team) => (
                    <TableRow key={team.id} className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                      <TableCell className="text-center">
                        <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center font-display font-bold
                          ${team.rank === 1 ? 'bg-yellow-500/20 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 
                            team.rank === 2 ? 'bg-slate-300/20 text-slate-300' : 
                            team.rank === 3 ? 'bg-orange-600/20 text-orange-500' : 'text-muted-foreground'}`}>
                          {team.rank}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/teams/${team.id}`} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded bg-muted/20 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
                            {team.logoUrl ? (
                              <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                            ) : (
                              <Shield className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                              {team.name}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">[{team.tag}]</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/10 text-muted-foreground bg-black/20">
                          {team.gameName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2 font-mono text-sm">
                          <span className="text-emerald-400">{team.wins}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-destructive">{team.losses}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="font-display font-bold text-lg text-white">{team.points}</span>
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

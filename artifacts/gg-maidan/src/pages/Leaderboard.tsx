import { useState } from "react";
import { useGetLeaderboard, useListGames } from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal, User, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Leaderboard() {
  const [type, setType] = useState<"individual" | "team">("individual");
  const [gameId, setGameId] = useState<string>("all");
  
  const { data: games } = useListGames();
  const { data: leaderboard, isLoading } = useGetLeaderboard({ 
    type, 
    gameId: gameId !== "all" ? Number(gameId) : undefined,
    limit: 50 
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">
          Global Leaderboard
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          The pinnacle of Nepal's esports talent. Rank up by participating and winning in official tournaments.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 bg-card/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        <Tabs value={type} onValueChange={(v) => setType(v as "individual" | "team")} className="w-full md:w-auto">
          <TabsList className="grid w-full md:w-64 grid-cols-2">
            <TabsTrigger value="individual" className="font-display uppercase">Players</TabsTrigger>
            <TabsTrigger value="team" className="font-display uppercase">Teams</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-full md:w-64">
          <Select value={gameId} onValueChange={setGameId}>
            <SelectTrigger className="bg-background border-white/10">
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

      <Card className="glass-card overflow-hidden shadow-2xl shadow-primary/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-black/40 border-b border-white/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px] text-center font-display uppercase tracking-wider text-xs">Rank</TableHead>
                <TableHead className="font-display uppercase tracking-wider text-xs">{type === "team" ? "Team" : "Player"}</TableHead>
                <TableHead className="font-display uppercase tracking-wider text-xs">Game</TableHead>
                <TableHead className="text-right font-display uppercase tracking-wider text-xs">Wins</TableHead>
                <TableHead className="text-right font-display uppercase tracking-wider text-xs pr-8">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="h-16">
                      <div className="w-full h-full bg-white/5 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : leaderboard?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                    No ranking data available for these filters.
                  </TableCell>
                </TableRow>
              ) : (
                leaderboard?.map((entry, index) => (
                  <TableRow 
                    key={`${entry.entityType}-${entry.entityId}`} 
                    className={`border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${index < 3 ? 'bg-primary/5' : ''}`}
                  >
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {entry.rank === 1 ? <Medal className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" /> :
                         entry.rank === 2 ? <Medal className="w-6 h-6 text-slate-300" /> :
                         entry.rank === 3 ? <Medal className="w-6 h-6 text-orange-500" /> :
                         <span className="font-mono text-muted-foreground font-bold">{entry.rank}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/${type}s/${entry.entityId}`} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-card flex items-center justify-center overflow-hidden border ${index < 3 ? 'border-primary/50' : 'border-white/10'}`}>
                          {entry.avatarUrl ? (
                            <img src={entry.avatarUrl} alt={entry.entityName} className="w-full h-full object-cover" />
                          ) : type === "team" ? (
                            <Shield className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className={`font-bold ${index < 3 ? 'text-white' : 'text-gray-300'}`}>
                          {entry.entityName}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.gameName || "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-gray-300">
                      {entry.wins}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <span className="font-display font-bold text-lg text-primary">{entry.points}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

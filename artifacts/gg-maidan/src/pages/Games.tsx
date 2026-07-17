import { useListGames } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Users, Trophy } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Games() {
  const { data: games, isLoading } = useListGames();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-4">
          Supported Games
        </h1>
        <p className="text-muted-foreground text-lg">
          We host tournaments across the most popular competitive titles. Choose your arena.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[400px] rounded-2xl bg-card/50 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games?.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Card className="glass-card glass-card-hover h-full border-white/10 overflow-hidden group">
                <div className="h-56 w-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10" />
                  {game.coverUrl ? (
                    <img 
                      src={game.coverUrl} 
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                      <Gamepad2 className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  {game.logoUrl && (
                    <img 
                      src={game.logoUrl} 
                      alt={`${game.name} logo`}
                      className="absolute bottom-4 left-6 w-16 h-16 object-contain z-20 drop-shadow-xl"
                    />
                  )}
                </div>
                
                <CardContent className="p-6 relative z-20">
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">
                    {game.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                    {game.description || `Join the competitive scene for ${game.name}.`}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
                        <Users className="w-3 h-3" /> Players
                      </div>
                      <div className="font-mono text-lg font-bold">{game.activePlayers.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
                        <Trophy className="w-3 h-3 text-primary" /> Events
                      </div>
                      <div className="font-mono text-lg font-bold text-primary">{game.activeTournaments}</div>
                    </div>
                  </div>
                  
                  <Link href={`/tournaments?gameId=${game.id}`}>
                    <Button className="w-full font-display uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white">
                      View Tournaments
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Users, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="relative h-[50vh] w-full border-b border-white/10 flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background z-10" />
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-30 mix-blend-screen" />
        
        <div className="relative z-20 container px-4">
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
            About G.G. Maidan
          </h1>
          <p className="text-xl text-primary font-mono tracking-widest uppercase">Building Nepal's Esports Ecosystem</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="prose prose-invert prose-lg max-w-none mb-20 text-gray-300 font-sans leading-relaxed">
          <p className="text-2xl leading-normal text-white font-medium">
            G.G. Maidan started with a simple vision: to give talented gamers in Nepal a professional platform to compete, grow, and be recognized globally.
          </p>
          <p>
            The word "Maidan" translates to "Ground" or "Arena" — a place where battles are fought and legends are made. We saw countless grassroots tournaments being run on spreadsheets and WhatsApp groups, creating friction for both organizers and players. We built G.G. Maidan to professionalize this experience.
          </p>
          <p>
            Today, we are Nepal's premier esports tournament platform, hosting hundreds of teams across titles like PUBG Mobile, Free Fire, and Valorant. We provide the infrastructure, the live coverage, and the community hub that the scene deserves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <Card className="glass-card border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold uppercase mb-3">Our Mission</h3>
              <p className="text-muted-foreground">
                To structure, support, and scale the competitive gaming ecosystem in Nepal by providing world-class platform infrastructure for players and organizers.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card border-secondary/20 bg-secondary/5">
            <CardContent className="p-8 text-center">
              <Zap className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold uppercase mb-3">Our Vision</h3>
              <p className="text-muted-foreground">
                To see Nepali esports teams competing and winning on the global stage, backed by a strong, sustainable domestic industry.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold uppercase mb-4">Core Values</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card/50 border border-white/5 p-6 rounded-xl text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h4 className="font-display font-bold uppercase text-lg mb-2">Competitive Integrity</h4>
            <p className="text-sm text-muted-foreground">Fair play, strict anti-cheat rules, and transparent bracket management.</p>
          </div>
          <div className="bg-card/50 border border-white/5 p-6 rounded-xl text-center">
            <Users className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-display font-bold uppercase text-lg mb-2">Community First</h4>
            <p className="text-sm text-muted-foreground">Built for the players, shaped by their feedback. We grow when the community grows.</p>
          </div>
          <div className="bg-card/50 border border-white/5 p-6 rounded-xl text-center">
            <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="font-display font-bold uppercase text-lg mb-2">Innovation</h4>
            <p className="text-sm text-muted-foreground">Continuously pushing the boundaries of what a tournament platform can offer.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

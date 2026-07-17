import { useListSponsors } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Sponsors() {
  const { data: sponsors, isLoading } = useListSponsors();

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'platinum': return 'from-cyan-300 to-blue-500 border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]';
      case 'gold': return 'from-yellow-300 to-amber-500 border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.15)]';
      case 'silver': return 'from-slate-300 to-slate-400 border-slate-400/30';
      case 'bronze': return 'from-orange-700 to-amber-800 border-orange-800/30';
      default: return 'from-white/10 to-white/5 border-white/10';
    }
  };

  const getGridCols = (tier: string) => {
    switch(tier) {
      case 'platinum': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
      case 'gold': return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-3';
      default: return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-4';
    }
  };

  const grouped = sponsors?.reduce((acc, s) => {
    if (!acc[s.tier]) acc[s.tier] = [];
    acc[s.tier].push(s);
    return acc;
  }, {} as Record<string, typeof sponsors>) || {};

  const order = ['platinum', 'gold', 'silver', 'bronze'];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-4">
          Our Partners
        </h1>
        <p className="text-muted-foreground text-lg">
          G.G. Maidan is powered by brands that believe in the future of esports in Nepal.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 animate-pulse text-muted-foreground">Loading sponsors...</div>
      ) : (
        <div className="space-y-20">
          {order.map(tier => {
            if (!grouped[tier] || grouped[tier].length === 0) return null;
            
            return (
              <section key={tier}>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display font-bold uppercase tracking-widest inline-block text-transparent bg-clip-text bg-gradient-to-r mb-2">
                    <span className={getTierColor(tier).split(' ')[0] + ' ' + getTierColor(tier).split(' ')[1]}>
                      {tier} Partners
                    </span>
                  </h2>
                  <div className={`h-0.5 w-24 mx-auto bg-gradient-to-r ${getTierColor(tier).split(' ')[0]} ${getTierColor(tier).split(' ')[1]}`} />
                </div>
                
                <div className={`grid gap-6 ${getGridCols(tier)}`}>
                  {grouped[tier].map((sponsor, i) => (
                    <motion.div
                      key={sponsor.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <a href={sponsor.websiteUrl || '#'} target="_blank" rel="noreferrer" className={sponsor.websiteUrl ? "cursor-pointer block h-full" : "block h-full cursor-default"}>
                        <Card className={`glass-card h-full flex flex-col items-center justify-center p-8 bg-black/40 hover:bg-white/5 transition-all border ${getTierColor(tier).split(' ')[2]} ${tier === 'platinum' || tier === 'gold' ? getTierColor(tier).split(' ')[3] : ''}`}>
                          <div className={`relative flex items-center justify-center w-full ${tier === 'platinum' ? 'h-32' : tier === 'gold' ? 'h-24' : 'h-16'}`}>
                            <img 
                              src={sponsor.logoUrl} 
                              alt={sponsor.name} 
                              className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-500 brightness-200 hover:brightness-100" 
                            />
                          </div>
                          {(tier === 'platinum' || tier === 'gold') && sponsor.description && (
                            <p className="text-center mt-6 text-sm text-muted-foreground line-clamp-2">
                              {sponsor.description}
                            </p>
                          )}
                        </Card>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

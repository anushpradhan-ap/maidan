import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Trophy, Gamepad2, Users, Flame, LayoutDashboard, Radio, X } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
import { useListAnnouncements } from "@workspace/api-client-react";

function NavLink({ href, icon: Icon, children, isActive }: { href: string, icon: any, children: ReactNode, isActive: boolean }) {
  return (
    <Link href={href}>
      <span
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md font-display uppercase tracking-wider text-sm font-semibold transition-all duration-300 cursor-pointer",
          isActive 
            ? "bg-primary/10 text-primary border-b-2 border-primary shadow-[inset_0_-2px_10px_rgba(139,92,246,0.1)]" 
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        )}
      >
        <Icon className="w-4 h-4" />
        {children}
      </span>
    </Link>
  );
}

const TYPE_STYLES: Record<string, string> = {
  info:    'bg-blue-600/90',
  warning: 'bg-yellow-600/90',
  success: 'bg-emerald-600/90',
  event:   'bg-primary/90',
};

function AnnouncementBanner() {
  const { data } = useListAnnouncements({ limit: 1 });
  const [dismissed, setDismissed] = useState(false);
  const latest = data?.[0];
  if (!latest || dismissed) return null;
  const bg = TYPE_STYLES[latest.type] ?? 'bg-primary/90';
  return (
    <div className={`${bg} backdrop-blur-sm text-white text-sm`}>
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="font-semibold shrink-0">{latest.title}</span>
          {latest.content && (
            <span className="text-white/80 truncate hidden sm:block">— {latest.content}</span>
          )}
        </div>
        <button onClick={() => setDismissed(true)} className="shrink-0 text-white/70 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/tournaments", label: "Tournaments", icon: Trophy },
    { href: "/games", label: "Games", icon: Gamepad2 },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/players", label: "Players", icon: Flame },
    { href: "/leaderboard", label: "Rankings", icon: LayoutDashboard },
    { href: "/live", label: "Live", icon: Radio, highlight: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      {/* Announcement banner */}
      <AnnouncementBanner />

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2.5 cursor-pointer group">
              <img
                src={`${BASE}logo.png`}
                alt="G.G. Maidan"
                className="h-10 w-auto object-contain group-hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.6)] transition-all duration-300"
              />
              <span className="font-display font-bold text-xl uppercase tracking-widest text-foreground">
                G.G. Maidan
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <NavLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                isActive={location.startsWith(link.href)}
              >
                {link.highlight ? (
                  <span className="flex items-center gap-2 text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    {link.label}
                  </span>
                ) : link.label}
              </NavLink>
            ))}
          </nav>

          {/* No login button — admin is at /gg-maidan-admin/ */}
          <div />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-card/30 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link href="/">
                <span className="flex items-center cursor-pointer">
                  <img src={`${BASE}logo.png`} alt="G.G. Maidan" className="h-9 w-auto object-contain" />
                </span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nepal's premier esports tournament platform. Join tournaments, build teams, and climb the leaderboard.
              </p>
            </div>
            
            <div>
              <h4 className="font-display font-bold text-lg uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/tournaments"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Tournaments</span></Link></li>
                <li><Link href="/games"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Games</span></Link></li>
                <li><Link href="/leaderboard"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Rankings</span></Link></li>
                <li><Link href="/live"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Live Matches</span></Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold text-lg uppercase tracking-wider mb-4">Community</h4>
              <ul className="space-y-2">
                <li><Link href="/news"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">News & Updates</span></Link></li>
                <li><Link href="/gallery"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Gallery</span></Link></li>
                <li><Link href="/sponsors"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Sponsors</span></Link></li>
                <li><Link href="/about"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">About Us</span></Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold text-lg uppercase tracking-wider mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><Link href="/contact"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Contact Us</span></Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Discord</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">YouTube</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Facebook</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} G.G. Maidan. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

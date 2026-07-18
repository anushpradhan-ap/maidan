import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Trophy, Gamepad2, Users, Flame, LayoutDashboard, Radio, X, ThumbsUp, Share2 } from "lucide-react";
import { useListAnnouncements } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL;

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

const TYPE_META: Record<string, { accent: string; badge: string; badgeText: string; icon: string }> = {
  event:   { accent: 'border-violet-500/60',  badge: 'bg-violet-500/20 text-violet-300',  badgeText: '📣 Update',    icon: '📣' },
  success: { accent: 'border-emerald-500/60', badge: 'bg-emerald-500/20 text-emerald-300', badgeText: '✅ Good News', icon: '✅' },
  warning: { accent: 'border-yellow-500/60',  badge: 'bg-yellow-500/20 text-yellow-300',  badgeText: '⚠️ Alert',    icon: '⚠️' },
  info:    { accent: 'border-blue-500/60',    badge: 'bg-blue-500/20 text-blue-300',      badgeText: 'ℹ️ Info',     icon: 'ℹ️' },
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function AnnouncementPost() {
  const { data } = useListAnnouncements({ limit: 1 });
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [liked, setLiked] = useState(false);
  const seenId = useRef<number | null>(null);

  const latest = data?.[0];

  useEffect(() => {
    if (!latest) return;
    if (latest.id === seenId.current) return;
    seenId.current = latest.id;
    setDismissed(false);
    setLiked(false);
    // Small delay so it feels like it "arrives"
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, [latest?.id]);

  if (!latest || dismissed) return null;

  const meta = TYPE_META[latest.type] ?? TYPE_META.info;

  function dismiss() {
    setVisible(false);
    setTimeout(() => setDismissed(true), 350);
  }

  return (
    <div
      className={cn(
        'fixed bottom-5 right-5 z-50 w-[340px] sm:w-[380px] transition-all duration-350 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      )}
      style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.55))' }}
    >
      {/* Card */}
      <div className={cn(
        'bg-[#1a1a2e] border rounded-2xl overflow-hidden',
        meta.accent
      )}>

        {/* Header — like a FB post header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/5">
          <div className="relative shrink-0">
            <img
              src={`${BASE}logo.png`}
              alt="G.G. Maidan"
              className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#1a1a2e]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">G.G. Maidan</p>
            <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
              <span>{timeAgo(latest.createdAt)}</span>
              <span>·</span>
              <span>🌐</span>
            </p>
          </div>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full shrink-0', meta.badge)}>
            {meta.badgeText}
          </span>
          <button onClick={dismiss} className="shrink-0 text-white/30 hover:text-white/70 transition-colors ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Post body */}
        <div className="px-4 py-3">
          <p className="font-bold text-white text-base leading-snug">{latest.title}</p>
          {latest.content && (
            <p className="text-white/60 text-sm mt-1.5 leading-relaxed">{latest.content}</p>
          )}
        </div>

        {/* Reaction bar — like Facebook */}
        <div className="border-t border-white/5 flex">
          <button
            onClick={() => setLiked(l => !l)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
              liked ? 'text-primary' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            )}
          >
            <ThumbsUp className={cn('w-4 h-4', liked && 'fill-primary')} />
            {liked ? 'Liked' : 'Like'}
          </button>
          <div className="w-px bg-white/5" />
          <button
            onClick={dismiss}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Dismiss
          </button>
        </div>
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
      {/* Announcement post popup */}
      <AnnouncementPost />

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

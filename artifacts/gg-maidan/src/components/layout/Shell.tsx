import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Trophy, Handshake, Newspaper, X, ThumbsUp, Share2 } from "lucide-react";
import { useListAnnouncements } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL;

function NavLink({ href, icon: Icon, children, isActive }: { href: string; icon: any; children: ReactNode; isActive: boolean }) {
  return (
    <Link href={href}>
      <span className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md font-display uppercase tracking-wider text-sm font-semibold transition-all duration-300 cursor-pointer",
        isActive
          ? "bg-primary/10 text-primary border-b-2 border-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}>
        <Icon className="w-4 h-4" />
        {children}
      </span>
    </Link>
  );
}

const TYPE_META: Record<string, { accent: string; badge: string; badgeText: string }> = {
  event:   { accent: "border-violet-500/60",  badge: "bg-violet-500/20 text-violet-300",  badgeText: "📣 Update" },
  success: { accent: "border-emerald-500/60", badge: "bg-emerald-500/20 text-emerald-300", badgeText: "✅ Good News" },
  warning: { accent: "border-yellow-500/60",  badge: "bg-yellow-500/20 text-yellow-300",  badgeText: "⚠️ Alert" },
  info:    { accent: "border-blue-500/60",    badge: "bg-blue-500/20 text-blue-300",      badgeText: "ℹ️ Info" },
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const DISMISSED_KEY = "ggm_dismissed_ann";

function AnnouncementPost() {
  const { data } = useListAnnouncements({ limit: 1 }, { query: { queryKey: [], refetchInterval: 15_000 } });
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [liked, setLiked] = useState(false);
  const seenId = useRef<number | null>(null);
  const latest = data?.[0];

  useEffect(() => {
    if (!latest) return;
    if (latest.id === seenId.current) return;
    const dismissedId = Number(localStorage.getItem(DISMISSED_KEY) ?? 0);
    if (latest.id === dismissedId) { seenId.current = latest.id; return; }
    seenId.current = latest.id;
    setDismissed(false); setLiked(false);
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, [latest?.id]);

  if (!latest || dismissed) return null;
  const meta = TYPE_META[latest.type] ?? TYPE_META.info;

  function dismiss() {
    if (latest) localStorage.setItem(DISMISSED_KEY, String(latest.id));
    setVisible(false);
    setTimeout(() => setDismissed(true), 350);
  }

  return (
    <div className={cn(
      "fixed bottom-5 right-5 z-50 w-[340px] sm:w-[380px] transition-all duration-350 ease-out",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
    )} style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.55))" }}>
      <div className={cn("bg-[#1a1a2e] border rounded-2xl overflow-hidden", meta.accent)}>
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/5">
          <div className="relative shrink-0">
            <img src={`${BASE}logo.png`} alt="G.G. Maidan" className="w-10 h-10 rounded-full object-cover border-2 border-white/10" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#1a1a2e]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">G.G. Maidan</p>
            <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
              <span>{timeAgo(latest.createdAt)}</span><span>·</span><span>🌐</span>
            </p>
          </div>
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full shrink-0", meta.badge)}>{meta.badgeText}</span>
          <button onClick={dismiss} className="shrink-0 text-white/30 hover:text-white/70 transition-colors ml-1"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-4 py-3">
          <p className="font-bold text-white text-base leading-snug">{latest.title}</p>
          {latest.content && <p className="text-white/60 text-sm mt-1.5 leading-relaxed">{latest.content}</p>}
        </div>
        <div className="border-t border-white/5 flex">
          <button onClick={() => setLiked(l => !l)} className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors", liked ? "text-primary" : "text-white/40 hover:text-white/70 hover:bg-white/5")}>
            <ThumbsUp className={cn("w-4 h-4", liked && "fill-primary")} />{liked ? "Liked" : "Like"}
          </button>
          <div className="w-px bg-white/5" />
          <button onClick={dismiss} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors">
            <Share2 className="w-4 h-4" />Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isNewsActive = location === "/" || location.startsWith("/news");

  const navLinks = [
    { href: "/tournaments", label: "Events", icon: Trophy },
    { href: "/sponsors", label: "Sponsors", icon: Handshake },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <AnnouncementPost />

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo → home (news) */}
          <Link href="/">
            <span className="flex items-center gap-2.5 cursor-pointer group">
              <img src={`${BASE}logo.png`} alt="G.G. Maidan" className="h-10 w-auto object-contain group-hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.6)] transition-all duration-300" />
              <span className="font-display font-bold text-xl uppercase tracking-widest hidden sm:block">G.G. Maidan</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* News = home */}
            <NavLink href="/" icon={Newspaper} isActive={isNewsActive}>
              News
            </NavLink>
            {navLinks.map(link => (
              <NavLink key={link.href} href={link.href} icon={link.icon} isActive={location.startsWith(link.href)}>
                {link.label}
              </NavLink>
            ))}
            <Link href="/about"><span className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors">About</span></Link>
            <Link href="/contact"><span className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Contact</span></Link>
          </nav>

          {/* Mobile hamburger */}
          <button className="md:hidden text-muted-foreground hover:text-foreground p-2" onClick={() => setMobileOpen(o => !o)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-md px-4 py-4 space-y-1">
            <Link href="/"><span onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors", isNewsActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}><Newspaper className="w-4 h-4" />News</span></Link>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <span onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors", location.startsWith(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>
                  <link.icon className="w-4 h-4" />{link.label}
                </span>
              </Link>
            ))}
            <Link href="/about"><span onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer">About</span></Link>
            <Link href="/contact"><span onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer">Contact</span></Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-card/30 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 md:col-span-1">
              <Link href="/"><span className="flex items-center cursor-pointer"><img src={`${BASE}logo.png`} alt="G.G. Maidan" className="h-9 w-auto object-contain" /></span></Link>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                Nepal's premier esports platform — news, tournaments, and community all in one place.
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4 text-muted-foreground">Navigate</h4>
              <ul className="space-y-2">
                <li><Link href="/"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Latest News</span></Link></li>
                <li><Link href="/tournaments"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Events</span></Link></li>
                <li><Link href="/sponsors"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Sponsors</span></Link></li>
                <li><Link href="/about"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">About Us</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4 text-muted-foreground">Connect</h4>
              <ul className="space-y-2">
                <li><Link href="/contact"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Contact Us</span></Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Discord</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">YouTube</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} G.G. Maidan E-sports Pvt. Ltd. All rights reserved.</p>
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

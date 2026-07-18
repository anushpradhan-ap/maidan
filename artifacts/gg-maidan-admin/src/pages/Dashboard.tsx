import { useState, useEffect, useCallback } from 'react';
import { clearToken, listAdminTournaments, listAdminGames, AdminTournament, AdminGame } from '@/lib/api';
import TournamentsSection from '@/sections/TournamentsSection';
import GamesSection from '@/sections/GamesSection';
import TeamsSection from '@/sections/TeamsSection';
import PlayersSection from '@/sections/PlayersSection';
import NewsSection from '@/sections/NewsSection';
import GallerySection from '@/sections/GallerySection';
import SponsorsSection from '@/sections/SponsorsSection';
import AnnouncementsSection from '@/sections/AnnouncementsSection';
import LiveSection from '@/sections/LiveSection';

type SectionId = 'announcements' | 'live' | 'tournaments' | 'games' | 'teams' | 'players' | 'news' | 'gallery' | 'sponsors';

const NAV: { id: SectionId; icon: string; label: string }[] = [
  { id: 'announcements', icon: '📣', label: 'Announcements' },
  { id: 'live',          icon: '🔴', label: 'Live Control' },
  { id: 'tournaments',   icon: '🏆', label: 'Tournaments' },
  { id: 'games',         icon: '🎮', label: 'Games' },
  { id: 'teams',         icon: '👥', label: 'Teams' },
  { id: 'players',       icon: '👤', label: 'Players' },
  { id: 'news',          icon: '📰', label: 'News' },
  { id: 'gallery',       icon: '🖼️', label: 'Gallery' },
  { id: 'sponsors',      icon: '🤝', label: 'Sponsors' },
];

interface Props { onLogout: () => void; }

export default function Dashboard({ onLogout }: Props) {
  const [section, setSection] = useState<SectionId>('announcements');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [games, setGames] = useState<AdminGame[]>([]);

  const loadTournaments = useCallback(() => listAdminTournaments().then(setTournaments).catch(() => {}), []);
  const loadGames = useCallback(() => listAdminGames().then(setGames).catch(() => {}), []);

  useEffect(() => { loadTournaments(); loadGames(); }, [loadTournaments, loadGames]);

  const live = tournaments.filter(t => t.status === 'live').length;

  return (
    <div className="min-h-screen bg-background flex">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-card border-r border-border flex flex-col transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
          <img src="/gg-maidan-admin/logo.png" alt="G.G. Maidan" className="h-8 w-auto object-contain" />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map(item => (
            <button key={item.id} onClick={() => { setSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                section === item.id
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}>
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
              {item.id === 'live' && live > 0 && (
                <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">{live}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <a href="/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mb-1">
            <span>↗</span> View Site
          </a>
          <button onClick={() => { clearToken(); onLogout(); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-red-400 transition-colors">
            <span>⏏</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-card/80 backdrop-blur-sm border-b border-border flex items-center gap-3 px-4">
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div>
            <p className="text-xs text-muted-foreground">GG Maidan Admin</p>
            <h1 className="font-semibold text-sm text-foreground leading-tight">
              {NAV.find(n => n.id === section)?.icon} {NAV.find(n => n.id === section)?.label}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {live > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{live} Live
              </span>
            )}
          </div>
        </header>

        {/* Section content */}
        <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">
          {section === 'announcements' && <AnnouncementsSection />}
          {section === 'live'          && <LiveSection tournaments={tournaments} onRefresh={loadTournaments} />}
          {section === 'tournaments'   && <TournamentsSection tournaments={tournaments} games={games} onRefresh={loadTournaments} />}
          {section === 'games'         && <GamesSection games={games} onRefresh={loadGames} />}
          {section === 'teams'         && <TeamsSection games={games} />}
          {section === 'players'       && <PlayersSection games={games} />}
          {section === 'news'          && <NewsSection />}
          {section === 'gallery'       && <GallerySection tournaments={tournaments} />}
          {section === 'sponsors'      && <SponsorsSection />}
        </main>
      </div>
    </div>
  );
}

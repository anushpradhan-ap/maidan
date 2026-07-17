import { useState, useEffect, useCallback } from 'react';
import { listAdminTournaments, AdminTournament, clearToken } from '@/lib/api';
import LiveControl from '@/components/LiveControl';
import TournamentManager from '@/components/TournamentManager';
import NewsManager from '@/components/NewsManager';
import AnnouncementsManager from '@/components/AnnouncementsManager';

interface Props { onLogout: () => void; }

const TABS = [
  { id: 'live',          label: '🔴 Live Control',        desc: 'Post match updates & manage live feed' },
  { id: 'tournaments',   label: '🏆 Tournaments',          desc: 'Manage all tournaments & statuses' },
  { id: 'news',          label: '📰 News',                 desc: 'Create & delete news posts' },
  { id: 'announcements', label: '📣 Announcements',        desc: 'Post & delete announcements' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function Dashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<TabId>('live');
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTournaments = useCallback(async () => {
    try { setTournaments(await listAdminTournaments()); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTournaments(); }, [loadTournaments]);

  const live  = tournaments.filter(t => t.status === 'live').length;
  const upcoming = tournaments.filter(t => t.status === 'upcoming').length;

  function handleLogout() {
    clearToken();
    onLogout();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-base">🎮</div>
            <span className="font-bold text-foreground">GG Maidan Admin</span>
            <span className="text-muted-foreground text-sm hidden sm:block">/ Control Center</span>
          </div>
          <div className="flex items-center gap-3">
            {live > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {live} Live
              </span>
            )}
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              View Site ↗
            </a>
            <button onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent text-secondary-foreground border border-border transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Tournaments', value: tournaments.length, color: 'text-foreground' },
            { label: 'Live Now',          value: live,              color: 'text-emerald-400' },
            { label: 'Upcoming',          value: upcoming,          color: 'text-yellow-400' },
            { label: 'Completed',         value: tournaments.filter(t => t.status === 'completed').length, color: 'text-muted-foreground' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold font-mono ${stat.color}`}>{loading ? '—' : stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-max px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab description */}
        <p className="text-xs text-muted-foreground mb-4 font-mono">
          {TABS.find(t => t.id === tab)?.desc}
        </p>

        {/* Tab content */}
        {tab === 'live' && (
          <LiveControl tournaments={tournaments} onRefresh={loadTournaments} />
        )}
        {tab === 'tournaments' && (
          <TournamentManager tournaments={tournaments} onRefresh={loadTournaments} />
        )}
        {tab === 'news' && <NewsManager />}
        {tab === 'announcements' && <AnnouncementsManager />}
      </div>
    </div>
  );
}

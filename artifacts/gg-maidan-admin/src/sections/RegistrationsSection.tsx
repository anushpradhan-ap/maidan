import { useState, useEffect } from 'react';
import { AdminRegistration, AdminTournament, listAdminRegistrations, listTournamentRegistrations } from '@/lib/api';

interface Props { tournaments: AdminTournament[]; }

export default function RegistrationsSection({ tournaments }: Props) {
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTournament, setFilterTournament] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const promise = filterTournament === 'all'
      ? listAdminRegistrations()
      : listTournamentRegistrations(Number(filterTournament));
    promise.then(setRegistrations).catch(() => setRegistrations([])).finally(() => setLoading(false));
  }, [filterTournament]);

  const filtered = registrations.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || (r.teamName ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input placeholder="Search by name, email, team…" value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
        <select value={filterTournament} onChange={e => setFilterTournament(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none">
          <option value="all">All Events</option>
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} registration{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Phone</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Team</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Event</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Registered</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground animate-pulse">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No registrations found.</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{r.fullName}</p>
                    {r.message && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">"{r.message}"</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{r.email}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{r.phone ?? '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {r.teamName
                      ? <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">{r.teamName}</span>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">{r.tournamentName ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden lg:table-cell">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

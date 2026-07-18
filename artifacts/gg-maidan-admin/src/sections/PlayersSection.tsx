import { useState, useEffect } from 'react';
import { AdminGame, AdminPlayer, AdminTeam, listAdminPlayers, listAdminTeams, createPlayer, deletePlayer } from '@/lib/api';

const ROLES = ['Fragger', 'IGL', 'Support', 'Scout', 'Sniper', 'Entry', 'Coach'];

interface Props { games: AdminGame[]; }

export default function PlayersSection({ games }: Props) {
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [form, setForm] = useState({ username: '', fullName: '', gameId: '', teamId: '', role: '', country: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false); const [flash, setFlash] = useState('');
  const [filter, setFilter] = useState('');

  const load = () => {
    listAdminPlayers().then(setPlayers).catch(() => {});
    listAdminTeams().then(setTeams).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const filteredTeams = form.gameId ? teams.filter(t => t.gameId === Number(form.gameId)) : teams;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await createPlayer({
        username: form.username, fullName: form.fullName || undefined,
        gameId: Number(form.gameId), teamId: form.teamId ? Number(form.teamId) : undefined,
        role: form.role || undefined, country: form.country || undefined, avatarUrl: form.avatarUrl || undefined,
      });
      setFlash('Player added!'); setForm({ username: '', fullName: '', gameId: '', teamId: '', role: '', country: '', avatarUrl: '' }); setTimeout(() => setFlash(''), 3000); load();
    } catch (err: any) { setFlash('Error: ' + err.message); } finally { setSaving(false); }
  }

  async function handleDelete(p: AdminPlayer) {
    if (!confirm(`Delete "${p.username}"?`)) return;
    try { await deletePlayer(p.id); setPlayers(prev => prev.filter(x => x.id !== p.id)); } catch (err: any) { alert(err.message); }
  }

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";
  const filtered = filter ? players.filter(p => p.gameId === Number(filter)) : players;

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg">
        <h2 className="font-semibold text-foreground mb-4">Add Player</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Username *</label>
              <input required value={form.username} onChange={e => setForm(p => ({...p, username: e.target.value}))} placeholder="ShadowStrike" className={inp} /></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Full Name</label>
              <input value={form.fullName} onChange={e => setForm(p => ({...p, fullName: e.target.value}))} placeholder="Arjun Thapa" className={inp} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Game *</label>
              <select required value={form.gameId} onChange={e => setForm(p => ({...p, gameId: e.target.value, teamId: ''}))} className={inp}>
                <option value="">Select…</option>
                {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Team</label>
              <select value={form.teamId} onChange={e => setForm(p => ({...p, teamId: e.target.value}))} className={inp}>
                <option value="">None</option>
                {filteredTeams.map(t => <option key={t.id} value={t.id}>[{t.tag}] {t.name}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))} className={inp}>
                <option value="">Select…</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Country</label>
              <input value={form.country} onChange={e => setForm(p => ({...p, country: e.target.value}))} placeholder="Nepal" className={inp} /></div>
          </div>
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Avatar URL</label>
            <input value={form.avatarUrl} onChange={e => setForm(p => ({...p, avatarUrl: e.target.value}))} placeholder="https://…" className={inp} /></div>
          {flash && <div className={`text-sm px-4 py-2.5 rounded-lg ${flash.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>{flash}</div>}
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-sm rounded-xl transition-colors">{saving ? 'Saving…' : 'Add Player'}</button>
        </form>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">All Players ({filtered.length})</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="ml-auto text-xs bg-card border border-border rounded-lg px-2 py-1 text-muted-foreground">
            <option value="">All games</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Player</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Team</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Role</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium">Kills</th>
              <th className="text-right px-4 py-3 text-muted-foreground font-medium">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3"><p className="font-medium text-foreground">{p.username}</p><p className="text-xs text-muted-foreground">{p.fullName}</p></td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.teamName ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.role ?? '—'}</td>
                  <td className="px-4 py-3 text-center font-mono text-muted-foreground">{p.kills}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(p)} className="px-2 py-1 rounded text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors">Delete</button></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No players yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

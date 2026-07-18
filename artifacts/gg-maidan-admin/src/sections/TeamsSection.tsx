import { useState, useEffect } from 'react';
import { AdminGame, AdminTeam, listAdminTeams, createTeam, deleteTeam } from '@/lib/api';

interface Props { games: AdminGame[]; }

export default function TeamsSection({ games }: Props) {
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [form, setForm] = useState({ name: '', tag: '', gameId: '', logoUrl: '', description: '' });
  const [saving, setSaving] = useState(false); const [flash, setFlash] = useState('');
  const [filter, setFilter] = useState('');

  const load = () => listAdminTeams().then(setTeams).catch(() => {});
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await createTeam({ name: form.name, tag: form.tag, gameId: Number(form.gameId), logoUrl: form.logoUrl || undefined, description: form.description || undefined });
      setFlash('Team added!'); setForm({ name: '', tag: '', gameId: '', logoUrl: '', description: '' }); setTimeout(() => setFlash(''), 3000); load();
    } catch (err: any) { setFlash('Error: ' + err.message); } finally { setSaving(false); }
  }

  async function handleDelete(t: AdminTeam) {
    if (!confirm(`Delete "${t.name}"?`)) return;
    try { await deleteTeam(t.id); setTeams(p => p.filter(x => x.id !== t.id)); } catch (err: any) { alert(err.message); }
  }

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";
  const filtered = filter ? teams.filter(t => t.gameId === Number(filter)) : teams;

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg">
        <h2 className="font-semibold text-foreground mb-4">Add Team</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Storm Raiders" className={inp} /></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Tag *</label>
              <input required maxLength={6} value={form.tag} onChange={e => setForm(p => ({...p, tag: e.target.value.toUpperCase()}))} placeholder="SR" className={inp} /></div>
          </div>
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Game *</label>
            <select required value={form.gameId} onChange={e => setForm(p => ({...p, gameId: e.target.value}))} className={inp}>
              <option value="">Select game…</option>
              {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select></div>
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Logo URL</label>
            <input value={form.logoUrl} onChange={e => setForm(p => ({...p, logoUrl: e.target.value}))} placeholder="https://…" className={inp} /></div>
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className={inp + ' resize-none'} /></div>
          {flash && <div className={`text-sm px-4 py-2.5 rounded-lg ${flash.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>{flash}</div>}
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-sm rounded-xl transition-colors">{saving ? 'Saving…' : 'Add Team'}</button>
        </form>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">All Teams ({filtered.length})</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="ml-auto text-xs bg-card border border-border rounded-lg px-2 py-1 text-muted-foreground">
            <option value="">All games</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Team</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Game</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium">W/L</th>
              <th className="text-right px-4 py-3 text-muted-foreground font-medium">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {t.logoUrl ? <img src={t.logoUrl} alt={t.name} className="w-8 h-8 rounded-lg object-cover" /> : <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{t.tag.slice(0,2)}</div>}
                    <div><p className="font-medium text-foreground">{t.name}</p><p className="text-xs text-muted-foreground font-mono">[{t.tag}]</p></div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.gameName}</td>
                  <td className="px-4 py-3 text-center font-mono text-sm text-muted-foreground">{t.wins ?? 0}/{t.losses ?? 0}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(t)} className="px-2 py-1 rounded text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors">Delete</button></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No teams yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

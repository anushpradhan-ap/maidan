import { useState } from 'react';
import { AdminTournament, AdminGame, createTournament, patchTournament, deleteTournament } from '@/lib/api';

interface Props { tournaments: AdminTournament[]; games: AdminGame[]; onRefresh: () => void; }

const STATUS_COLORS = {
  upcoming:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  live:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  completed: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

export default function TournamentsSection({ tournaments, games, onRefresh }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminTournament | null>(null);
  const [flash, setFlash] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ title: '', gameId: '', startDate: '', endDate: '', prizePool: '', maxTeams: '16', totalRounds: '6', description: '', rules: '' });
  const [editForm, setEditForm] = useState<Partial<AdminTournament & { rules?: string }>>({});

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";
  const ok = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 3000); };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await createTournament({ ...form, gameId: Number(form.gameId), maxTeams: Number(form.maxTeams), totalRounds: Number(form.totalRounds) });
      ok('Tournament created!'); setForm({ title: '', gameId: '', startDate: '', endDate: '', prizePool: '', maxTeams: '16', totalRounds: '6', description: '', rules: '' });
      setShowCreate(false); onRefresh();
    } catch (err: any) { setFlash('Error: ' + err.message); } finally { setSaving(false); }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault(); if (!editing) return; setSaving(true);
    try { await patchTournament(editing.id, editForm); ok('Updated!'); setEditing(null); onRefresh(); }
    catch (err: any) { setFlash('Error: ' + err.message); } finally { setSaving(false); }
  }

  async function quickStatus(t: AdminTournament, status: string) {
    try { await patchTournament(t.id, { status } as any); ok(`${t.title} → ${status}`); onRefresh(); }
    catch (err: any) { alert(err.message); }
  }

  async function handleDelete(t: AdminTournament) {
    if (!confirm(`Delete "${t.title}"? This cannot be undone.`)) return;
    try { await deleteTournament(t.id); ok(`"${t.title}" deleted.`); onRefresh(); }
    catch (err: any) { alert(err.message); }
  }

  function openEdit(t: AdminTournament) {
    setEditing(t);
    setEditForm({ title: t.title, status: t.status, gameId: t.gameId, startDate: t.startDate, endDate: t.endDate ?? undefined, prizePool: t.prizePool, maxTeams: t.maxTeams, totalRounds: t.totalRounds ?? undefined, description: t.description ?? undefined });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {flash && <span className={`px-3 py-1.5 rounded-lg text-sm ${flash.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>{flash}</span>}
        <button onClick={() => setShowCreate(!showCreate)} className="ml-auto px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">
          {showCreate ? '✕ Cancel' : '+ New Tournament'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Create Tournament</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="PUBG Nationals S5" className={inp} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Game *</label>
                <select required value={form.gameId} onChange={e => setForm(p => ({...p, gameId: e.target.value}))} className={inp}>
                  <option value="">Select game…</option>
                  {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Start Date *</label>
                <input required type="date" value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))} className={inp} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm(p => ({...p, endDate: e.target.value}))} className={inp} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Prize Pool *</label>
                <input required value={form.prizePool} onChange={e => setForm(p => ({...p, prizePool: e.target.value}))} placeholder="NPR 50,000" className={inp} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Max Teams *</label>
                <input required type="number" value={form.maxTeams} onChange={e => setForm(p => ({...p, maxTeams: e.target.value}))} className={inp} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Total Rounds</label>
                <input type="number" value={form.totalRounds} onChange={e => setForm(p => ({...p, totalRounds: e.target.value}))} className={inp} /></div>
            </div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className={inp + ' resize-none'} /></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Rules</label>
              <textarea rows={3} value={form.rules} onChange={e => setForm(p => ({...p, rules: e.target.value}))} className={inp + ' resize-none'} /></div>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-sm rounded-lg transition-colors">{saving ? 'Creating…' : 'Create Tournament'}</button>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Tournament</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Game</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium">Status</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Teams</th>
              <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {tournaments.map(t => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3"><p className="font-medium text-foreground">{t.title}</p><p className="text-xs text-muted-foreground font-mono">{t.prizePool}</p></td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{t.gameName}</td>
                  <td className="px-4 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[t.status]}`}>{t.status}</span></td>
                  <td className="px-4 py-3 text-center font-mono text-muted-foreground hidden sm:table-cell">{t.registeredTeams}/{t.maxTeams}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {t.status !== 'live'      && <button onClick={() => quickStatus(t, 'live')}      className="px-2 py-1 rounded text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors">→ Live</button>}
                      {t.status !== 'completed' && <button onClick={() => quickStatus(t, 'completed')} className="px-2 py-1 rounded text-xs bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/30 transition-colors">Finish</button>}
                      {t.status !== 'upcoming'  && <button onClick={() => quickStatus(t, 'upcoming')}  className="px-2 py-1 rounded text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 transition-colors">Reset</button>}
                      <button onClick={() => openEdit(t)} className="px-2 py-1 rounded text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(t)} className="px-2 py-1 rounded text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {tournaments.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No tournaments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <h3 className="font-semibold text-foreground">Edit: {editing.title}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleEdit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm(p => ({...p, status: e.target.value as any}))} className={inp}>
                    <option value="upcoming">Upcoming</option><option value="live">Live</option><option value="completed">Completed</option>
                  </select></div>
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Game</label>
                  <select value={editForm.gameId} onChange={e => setEditForm(p => ({...p, gameId: Number(e.target.value)}))} className={inp}>
                    {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select></div>
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Title</label>
                  <input value={editForm.title ?? ''} onChange={e => setEditForm(p => ({...p, title: e.target.value}))} className={inp} /></div>
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Prize Pool</label>
                  <input value={editForm.prizePool ?? ''} onChange={e => setEditForm(p => ({...p, prizePool: e.target.value}))} className={inp} /></div>
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Max Teams</label>
                  <input type="number" value={editForm.maxTeams ?? ''} onChange={e => setEditForm(p => ({...p, maxTeams: Number(e.target.value)}))} className={inp} /></div>
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Total Rounds</label>
                  <input type="number" value={editForm.totalRounds ?? ''} onChange={e => setEditForm(p => ({...p, totalRounds: Number(e.target.value)}))} className={inp} /></div>
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Start Date</label>
                  <input type="date" value={editForm.startDate ?? ''} onChange={e => setEditForm(p => ({...p, startDate: e.target.value}))} className={inp} /></div>
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">End Date</label>
                  <input type="date" value={editForm.endDate ?? ''} onChange={e => setEditForm(p => ({...p, endDate: e.target.value}))} className={inp} /></div>
              </div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Description</label>
                <textarea rows={3} value={editForm.description ?? ''} onChange={e => setEditForm(p => ({...p, description: e.target.value}))} className={inp + ' resize-none'} /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold text-sm rounded-lg transition-colors">{saving ? 'Saving…' : 'Save Changes'}</button>
                <button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-semibold text-sm rounded-lg transition-colors border border-border">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

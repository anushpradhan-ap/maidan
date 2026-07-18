import { useState } from 'react';
import { AdminGame, createGame, deleteGame } from '@/lib/api';

interface Props { games: AdminGame[]; onRefresh: () => void; }

export default function GamesSection({ games, onRefresh }: Props) {
  const [form, setForm] = useState({ name: '', logoUrl: '', description: '' });
  const [saving, setSaving] = useState(false); const [flash, setFlash] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await createGame({ name: form.name, logoUrl: form.logoUrl || undefined, description: form.description || undefined });
      setFlash('Game added!'); setForm({ name: '', logoUrl: '', description: '' }); setTimeout(() => setFlash(''), 3000); onRefresh();
    } catch (err: any) { setFlash('Error: ' + err.message); } finally { setSaving(false); }
  }

  async function handleDelete(g: AdminGame) {
    if (!confirm(`Delete "${g.name}"? This may affect tournaments and teams.`)) return;
    try { await deleteGame(g.id); onRefresh(); } catch (err: any) { alert(err.message); }
  }

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg">
        <h2 className="font-semibold text-foreground mb-4">Add Game</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Name *</label>
            <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="PUBG Mobile" className={inp} /></div>
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Logo URL</label>
            <input value={form.logoUrl} onChange={e => setForm(p => ({...p, logoUrl: e.target.value}))} placeholder="https://…" className={inp} /></div>
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className={inp + ' resize-none'} /></div>
          {flash && <div className={`text-sm px-4 py-2.5 rounded-lg ${flash.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>{flash}</div>}
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-sm rounded-xl transition-colors">{saving ? 'Saving…' : 'Add Game'}</button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Games ({games.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {games.map(g => (
            <div key={g.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 group hover:border-primary/20 transition-colors">
              {g.logoUrl ? <img src={g.logoUrl} alt={g.name} className="w-10 h-10 rounded-lg object-cover shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0">🎮</div>}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{g.name}</p>
                {g.description && <p className="text-xs text-muted-foreground truncate">{g.description}</p>}
              </div>
              <button onClick={() => handleDelete(g)} className="shrink-0 text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xl leading-none">×</button>
            </div>
          ))}
          {games.length === 0 && <div className="col-span-full py-10 text-center text-muted-foreground">No games yet.</div>}
        </div>
      </div>
    </div>
  );
}

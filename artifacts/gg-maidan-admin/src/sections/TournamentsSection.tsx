import { useState } from 'react';
import { AdminTournament, createTournament, patchTournament, deleteTournament } from '@/lib/api';

interface Props { tournaments: AdminTournament[]; onRefresh: () => void; }

const STATUS_COLORS = {
  upcoming:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  live:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  completed: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

const EMPTY_FORM = { title: '', gameName: '', startDate: '', endDate: '', prizePool: '', maxTeams: '16', totalRounds: '6', description: '', rules: '', bannerUrl: '' };

export default function TournamentsSection({ tournaments, onRefresh }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminTournament | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminTournament | null>(null);
  const [flash, setFlash] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState<Partial<AdminTournament & { rules?: string; bannerUrl?: string }>>({});

  const inp = 'w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors';
  const ok  = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 3000); };
  const err = (msg: string) => { setFlash('Error: ' + msg); setTimeout(() => setFlash(''), 4000); };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await createTournament({ ...form, maxTeams: Number(form.maxTeams), totalRounds: Number(form.totalRounds) });
      ok('Tournament created!'); setForm({ ...EMPTY_FORM }); setShowCreate(false); onRefresh();
    } catch (e: any) { err(e.message); } finally { setSaving(false); }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault(); if (!editing) return; setSaving(true);
    try { await patchTournament(editing.id, editForm); ok('Updated!'); setEditing(null); onRefresh(); }
    catch (e: any) { err(e.message); } finally { setSaving(false); }
  }

  async function quickStatus(t: AdminTournament, status: string) {
    try { await patchTournament(t.id, { status }); ok(`${t.title} → ${status}`); onRefresh(); }
    catch (e: any) { err(e.message); }
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    try { await deleteTournament(deleteConfirm.id); ok(`"${deleteConfirm.title}" deleted.`); onRefresh(); }
    catch (e: any) { err(e.message); }
    setDeleteConfirm(null);
  }

  function openEdit(t: AdminTournament) {
    setEditing(t);
    setEditForm({ title: t.title, status: t.status, startDate: t.startDate, endDate: t.endDate ?? undefined, prizePool: t.prizePool, maxTeams: t.maxTeams, totalRounds: t.totalRounds ?? undefined, description: t.description ?? undefined, bannerUrl: t.bannerUrl ?? undefined });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {flash && <span className={`px-3 py-1.5 rounded-lg text-sm ${flash.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>{flash}</span>}
        <button onClick={() => setShowCreate(!showCreate)} className="ml-auto px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">
          {showCreate ? '✕ Cancel' : '+ New Event'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Create Event</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="PUBG Nationals Season 5" className={inp} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Game *</label>
                <input required value={form.gameName} onChange={e => setForm(p => ({ ...p, gameName: e.target.value }))} placeholder="PUBG Mobile" className={inp} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Start Date *</label>
                <input required type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className={inp} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className={inp} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Prize Pool *</label>
                <input required value={form.prizePool} onChange={e => setForm(p => ({ ...p, prizePool: e.target.value }))} placeholder="NPR 50,000" className={inp} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Max Teams *</label>
                <input required type="number" value={form.maxTeams} onChange={e => setForm(p => ({ ...p, maxTeams: e.target.value }))} className={inp} /></div>
              <div className="sm:col-span-2"><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Banner Image URL</label>
                <input value={form.bannerUrl} onChange={e => setForm(p => ({ ...p, bannerUrl: e.target.value }))} placeholder="https://…" className={inp} /></div>
            </div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inp + ' resize-none'} /></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Rules</label>
              <textarea rows={3} value={form.rules} onChange={e => setForm(p => ({ ...p, rules: e.target.value }))} className={inp + ' resize-none'} /></div>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-sm rounded-lg transition-colors">{saving ? 'Creating…' : 'Create Event'}</button>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Event</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Game</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium">Status</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Registrations</th>
              <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {tournaments.map(t => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3"><p className="font-medium text-foreground">{t.title}</p><p className="text-xs text-muted-foreground font-mono">{t.prizePool} · {t.startDate}</p></td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{t.gameName ?? '—'}</td>
                  <td className="px-4 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[t.status]}`}>{t.status}</span></td>
                  <td className="px-4 py-3 text-center font-mono text-muted-foreground hidden sm:table-cell">{t.registeredTeams}/{t.maxTeams}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {t.status !== 'live'      && <button onClick={() => quickStatus(t, 'live')}      className="px-2 py-1 rounded text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors">→ Live</button>}
                      {t.status !== 'completed' && <button onClick={() => quickStatus(t, 'completed')} className="px-2 py-1 rounded text-xs bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/30 transition-colors">Finish</button>}
                      {t.status !== 'upcoming'  && <button onClick={() => quickStatus(t, 'upcoming')}  className="px-2 py-1 rounded text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 transition-colors">Reset</button>}
                      <button onClick={() => openEdit(t)} className="px-2 py-1 rounded text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors">Edit</button>
                      <button onClick={() => setDeleteConfirm(t)} className="px-2 py-1 rounded text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {tournaments.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No events yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
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
                  <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as any }))} className={inp}>
                    <option value="upcoming">Upcoming</option><option value="live">Live</option><option value="completed">Completed</option>
                  </select></div>
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Title</label>
                  <input value={editForm.title ?? ''} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} className={inp} /></div>
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Prize Pool</label>
                  <input value={editForm.prizePool ?? ''} onChange={e => setEditForm(p => ({ ...p, prizePool: e.target.value }))} className={inp} /></div>
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Max Teams</label>
                  <input type="number" value={editForm.maxTeams ?? ''} onChange={e => setEditForm(p => ({ ...p, maxTeams: Number(e.target.value) }))} className={inp} /></div>
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Start Date</label>
                  <input type="date" value={editForm.startDate ?? ''} onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value }))} className={inp} /></div>
                <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">End Date</label>
                  <input type="date" value={editForm.endDate ?? ''} onChange={e => setEditForm(p => ({ ...p, endDate: e.target.value }))} className={inp} /></div>
                <div className="col-span-2"><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Banner URL</label>
                  <input value={editForm.bannerUrl ?? ''} onChange={e => setEditForm(p => ({ ...p, bannerUrl: e.target.value }))} placeholder="https://…" className={inp} /></div>
              </div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Description</label>
                <textarea rows={3} value={editForm.description ?? ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className={inp + ' resize-none'} /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold text-sm rounded-lg transition-colors">{saving ? 'Saving…' : 'Save Changes'}</button>
                <button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-semibold text-sm rounded-lg transition-colors border border-border">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-semibold text-foreground mb-2">Delete Event?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete <span className="text-foreground font-medium">"{deleteConfirm.title}"</span>? All registrations will also be deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-lg transition-colors">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-semibold text-sm rounded-lg transition-colors border border-border">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

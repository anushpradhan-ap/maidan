import { useState, useEffect } from 'react';
import { AdminGalleryItem, AdminTournament, listAdminGallery, createGalleryItem, deleteGalleryItem } from '@/lib/api';

interface Props { tournaments: AdminTournament[]; }
const TYPES = ['image', 'video', 'highlight'];

export default function GallerySection({ tournaments }: Props) {
  const [items, setItems] = useState<AdminGalleryItem[]>([]);
  const [form, setForm] = useState({ title: '', type: 'image', url: '', thumbnailUrl: '', tournamentId: '' });
  const [saving, setSaving] = useState(false); const [flash, setFlash] = useState('');

  const load = () => listAdminGallery().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await createGalleryItem({ title: form.title, type: form.type, url: form.url, thumbnailUrl: form.thumbnailUrl || undefined, tournamentId: form.tournamentId ? Number(form.tournamentId) : undefined });
      setFlash('Added!'); setForm({ title: '', type: 'image', url: '', thumbnailUrl: '', tournamentId: '' }); setTimeout(() => setFlash(''), 3000); load();
    } catch (err: any) { setFlash('Error: ' + err.message); } finally { setSaving(false); }
  }

  async function handleDelete(item: AdminGalleryItem) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try { await deleteGalleryItem(item.id); setItems(p => p.filter(x => x.id !== item.id)); } catch (err: any) { alert(err.message); }
  }

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg">
        <h2 className="font-semibold text-foreground mb-4">Add Gallery Item</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Title *</label>
              <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Finals Highlights" className={inp} /></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Type *</label>
              <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className={inp}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
          </div>
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">URL *</label>
            <input required value={form.url} onChange={e => setForm(p => ({...p, url: e.target.value}))} placeholder="https://…" className={inp} /></div>
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Thumbnail URL</label>
            <input value={form.thumbnailUrl} onChange={e => setForm(p => ({...p, thumbnailUrl: e.target.value}))} placeholder="https://…" className={inp} /></div>
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Tournament (optional)</label>
            <select value={form.tournamentId} onChange={e => setForm(p => ({...p, tournamentId: e.target.value}))} className={inp}>
              <option value="">None</option>
              {tournaments.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select></div>
          {flash && <div className={`text-sm px-4 py-2.5 rounded-lg ${flash.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>{flash}</div>}
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-sm rounded-xl transition-colors">{saving ? 'Saving…' : 'Add Item'}</button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Gallery ({items.length} items)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/20 transition-colors">
              {item.thumbnailUrl || item.url ? (
                <div className="h-32 bg-muted overflow-hidden">
                  <img src={item.thumbnailUrl ?? item.url} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              ) : <div className="h-32 bg-muted flex items-center justify-center text-3xl">{item.type === 'video' ? '🎬' : item.type === 'highlight' ? '⚡' : '🖼️'}</div>}
              <div className="p-3 flex items-center gap-2">
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">{item.type}</span>
                <p className="text-sm font-medium text-foreground truncate flex-1">{item.title}</p>
                <button onClick={() => handleDelete(item)} className="shrink-0 text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xl leading-none">×</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="col-span-full py-10 text-center text-muted-foreground">No gallery items yet.</div>}
        </div>
      </div>
    </div>
  );
}

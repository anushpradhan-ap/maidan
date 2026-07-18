import { useState, useEffect } from 'react';
import { AdminAnnouncement, listAdminAnnouncements, createAnnouncement, deleteAnnouncement } from '@/lib/api';

const TYPES = [
  { value: 'event',   label: '📣 Update',    color: 'bg-purple-500/10 border-purple-500/30 text-purple-300' },
  { value: 'success', label: '✅ Good News', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' },
  { value: 'warning', label: '⚠️ Alert',     color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' },
  { value: 'info',    label: 'ℹ️ Info',      color: 'bg-blue-500/10 border-blue-500/30 text-blue-300' },
] as const;
type T = typeof TYPES[number]['value'];
const typeColor = (t: string) => TYPES.find(x => x.value === t)?.color ?? '';
const typeLabel = (t: string) => TYPES.find(x => x.value === t)?.label ?? t;

export default function AnnouncementsSection() {
  const [items, setItems] = useState<AdminAnnouncement[]>([]);
  const [title, setTitle] = useState(''); const [content, setContent] = useState(''); const [type, setType] = useState<T>('event');
  const [saving, setSaving] = useState(false); const [flash, setFlash] = useState('');

  const load = () => listAdminAnnouncements().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault(); if (!title.trim()) return;
    setSaving(true);
    try {
      await createAnnouncement({ title: title.trim(), content: content.trim(), type });
      setFlash('Posted — live on site!'); setTitle(''); setContent(''); setTimeout(() => setFlash(''), 4000); load();
    } catch (err: any) { setFlash('Error: ' + err.message); } finally { setSaving(false); }
  }

  async function del(item: AdminAnnouncement) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await deleteAnnouncement(item.id); setItems(p => p.filter(x => x.id !== item.id));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-foreground mb-5">New Announcement</h2>
        <form onSubmit={handlePost} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-all ${type === t.value ? t.color + ' border-current' : 'bg-background border-border text-muted-foreground hover:border-primary/30'}`}>
                <span className="text-lg leading-none">{t.label.split(' ')[0]}</span>
                <span>{t.label.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Headline *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Registration Now Open!"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Details (optional)</label>
            <textarea rows={3} value={content} onChange={e => setContent(e.target.value)} placeholder="Extra context shown inside the banner…"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors" />
          </div>
          {title && (
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm ${typeColor(type)}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
              <span className="font-semibold">{title}</span>
              {content && <span className="opacity-70 truncate hidden sm:block">— {content}</span>}
              <span className="ml-auto text-xs opacity-50">preview</span>
            </div>
          )}
          {flash && <div className={`text-sm px-4 py-2.5 rounded-lg ${flash.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>{flash}</div>}
          <button type="submit" disabled={saving || !title.trim()} className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-sm rounded-xl transition-colors">
            {saving ? 'Posting…' : '📡 Post to Site'}
          </button>
        </form>
      </div>

      {items.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Posted ({items.length})</h3>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3 group hover:border-primary/20 transition-colors">
                <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium border ${typeColor(item.type)}`}>{typeLabel(item.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  {item.content && <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.content}</p>}
                  <p className="text-xs text-muted-foreground/50 mt-1 font-mono">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => del(item)} className="shrink-0 text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xl leading-none">×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

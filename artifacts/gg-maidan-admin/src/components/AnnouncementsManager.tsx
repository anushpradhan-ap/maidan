import { useState, useEffect } from 'react';
import { AdminAnnouncement, listAdminAnnouncements, createAnnouncement, deleteAnnouncement } from '@/lib/api';

const TYPE_COLORS: Record<string, string> = {
  info:    'bg-blue-500/10 text-blue-400 border-blue-500/30',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  event:   'bg-purple-500/10 text-purple-400 border-purple-500/30',
};
const TYPE_ICONS: Record<string, string> = { info: 'ℹ️', warning: '⚠️', success: '✅', event: '📣' };

export default function AnnouncementsManager() {
  const [items, setItems] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'info' as AdminAnnouncement['type'] });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    try { setItems(await listAdminAnnouncements()); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const item = await createAnnouncement(form);
      setItems(prev => [item, ...prev]);
      setSuccess('Announcement posted!');
      setTimeout(() => setSuccess(''), 3000);
      setShowForm(false);
      setForm({ title: '', content: '', type: 'info' });
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(item: AdminAnnouncement) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await deleteAnnouncement(item.id);
      setItems(p => p.filter(x => x.id !== item.id));
      setSuccess('Deleted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) { alert(e.message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          {success && (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
              ✓ {success}
            </span>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">
          {showForm ? '✕ Cancel' : '+ New Announcement'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">New Announcement</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Registration Now Open"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Type *</label>
                <div className="flex gap-2 flex-wrap">
                  {(['info', 'warning', 'success', 'event'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        form.type === t
                          ? TYPE_COLORS[t]
                          : 'bg-background border-border text-muted-foreground hover:border-primary/30'
                      }`}>
                      {TYPE_ICONS[t]} {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Content *</label>
              <textarea required value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={3}
                placeholder="Full announcement message shown on the website…"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold text-sm rounded-lg transition-colors">
              {saving ? 'Posting…' : `${TYPE_ICONS[form.type]} Post Announcement`}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex gap-4">
              <div className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border h-fit mt-0.5 ${TYPE_COLORS[item.type]}`}>
                {TYPE_ICONS[item.type]} {item.type}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                <p className="text-xs text-muted-foreground font-mono mt-2">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => handleDelete(item)}
                className="shrink-0 px-2 py-1 rounded text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors h-fit mt-0.5">
                Delete
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">No announcements yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

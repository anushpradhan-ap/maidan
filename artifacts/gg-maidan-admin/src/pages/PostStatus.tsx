import { useState, useEffect } from 'react';
import { createAnnouncement, deleteAnnouncement, listAdminAnnouncements, clearToken, AdminAnnouncement } from '@/lib/api';

const TYPES = [
  { value: 'event',   label: '📣 Update',  desc: 'General update or news' },
  { value: 'success', label: '✅ Good News', desc: 'Positive announcement' },
  { value: 'warning', label: '⚠️ Alert',    desc: 'Important heads-up' },
  { value: 'info',    label: 'ℹ️ Info',     desc: 'Informational notice' },
] as const;

type T = typeof TYPES[number]['value'];

const STRIP_COLORS: Record<string, string> = {
  event:   'bg-purple-500/10 border-purple-500/30 text-purple-300',
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  info:    'bg-blue-500/10 border-blue-500/30 text-blue-300',
};

export default function PostStatus({ onLogout }: { onLogout: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<T>('event');
  const [posting, setPosting] = useState(false);
  const [flash, setFlash] = useState('');
  const [posts, setPosts] = useState<AdminAnnouncement[]>([]);

  async function load() {
    try { setPosts(await listAdminAnnouncements()); } catch {}
  }

  useEffect(() => { load(); }, []);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setPosting(true);
    try {
      await createAnnouncement({ title: title.trim(), content: content.trim(), type });
      setFlash('Posted! It\'s now live on the site.');
      setTitle(''); setContent('');
      setTimeout(() => setFlash(''), 4000);
      load();
    } catch (err: any) {
      setFlash('Error: ' + err.message);
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(item: AdminAnnouncement) {
    try {
      await deleteAnnouncement(item.id);
      setPosts(p => p.filter(x => x.id !== item.id));
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/60 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-sm">🎮</div>
            <span className="font-bold text-foreground text-sm">GG Maidan</span>
            <span className="text-muted-foreground text-sm">/ Post Status</span>
          </div>
          <button onClick={() => { clearToken(); onLogout(); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 w-full flex-1 space-y-8">

        {/* Compose card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-5">New Status</h2>

          <form onSubmit={handlePost} className="space-y-5">
            {/* Type picker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-medium transition-all ${
                    type === t.value
                      ? STRIP_COLORS[t.value] + ' border-current'
                      : 'bg-background border-border text-muted-foreground hover:border-primary/30'
                  }`}>
                  <span className="text-lg leading-none">{t.label.split(' ')[0]}</span>
                  <span>{t.label.split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
                Headline <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. PUBG Nationals S4 — Registration Now Open!"
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
                Details <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Any extra context shown inside the banner…"
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Preview strip */}
            {title && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm ${STRIP_COLORS[type]}`}>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                </span>
                <span className="font-semibold">{title}</span>
                {content && <span className="opacity-70 truncate hidden sm:block">— {content}</span>}
                <span className="ml-auto text-xs opacity-50">preview</span>
              </div>
            )}

            {flash && (
              <div className={`text-sm px-4 py-2.5 rounded-lg ${flash.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>
                {flash}
              </div>
            )}

            <button type="submit" disabled={posting || !title.trim()}
              className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-sm rounded-xl transition-colors">
              {posting ? 'Posting…' : '📡 Post to Site'}
            </button>
          </form>
        </div>

        {/* Recent posts */}
        {posts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Posts</h3>
            <div className="space-y-2">
              {posts.map(item => (
                <div key={item.id}
                  className="flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3 group hover:border-primary/20 transition-colors">
                  <div className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium border ${STRIP_COLORS[item.type]}`}>
                    {TYPES.find(t => t.value === item.type)?.label ?? item.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    {item.content && <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.content}</p>}
                    <p className="text-xs text-muted-foreground/50 mt-1 font-mono">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDelete(item)}
                    className="shrink-0 text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

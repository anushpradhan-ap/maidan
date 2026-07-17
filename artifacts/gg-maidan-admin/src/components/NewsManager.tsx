import { useState, useEffect } from 'react';
import { AdminNewsPost, listAdminNews, createNewsPost, deleteNewsPost } from '@/lib/api';

export default function NewsManager() {
  const [news, setNews] = useState<AdminNewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    category: 'tournament', author: '', tags: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    try { setNews(await listAdminNews()); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function autoSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createNewsPost({
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      setSuccess('News post created!');
      setTimeout(() => setSuccess(''), 3000);
      setShowForm(false);
      setForm({ title: '', slug: '', excerpt: '', content: '', category: 'tournament', author: '', tags: '' });
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(post: AdminNewsPost) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      await deleteNewsPost(post.id);
      setNews(n => n.filter(x => x.id !== post.id));
      setSuccess('Post deleted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) { alert(e.message); }
  }

  const CATEGORIES = ['tournament', 'gaming', 'recap', 'announcement', 'patch'];
  const CATEGORY_COLORS: Record<string, string> = {
    tournament: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    gaming: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    recap: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    announcement: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    patch: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {success && (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
              ✓ {success}
            </span>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">
          {showForm ? '✕ Cancel' : '+ New Post'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Create News Post</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Title *</label>
                <input required value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: autoSlug(e.target.value) }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Slug *</label>
                <input required value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Author *</label>
                <input required value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Excerpt *</label>
              <input required value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                placeholder="Short description shown in listings…"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Content *</label>
              <textarea required value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={6}
                placeholder="Full article content…"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                placeholder="PUBG, Tournament, Storm Raiders"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold text-sm rounded-lg transition-colors">
              {saving ? 'Publishing…' : 'Publish Post'}
            </button>
          </form>
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Author</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {news.map(post => (
                  <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{post.title}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{post.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${CATEGORY_COLORS[post.category] ?? 'bg-muted text-muted-foreground'}`}>
                        {post.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{post.author}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(post)}
                        className="px-2 py-1 rounded text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {news.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No news posts yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

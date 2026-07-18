import { useState, useEffect } from 'react';
import { AdminNewsPost, listAdminNews, createNewsPost, deleteNewsPost } from '@/lib/api';

const CATEGORIES = ['tournament', 'gaming', 'recap', 'announcement', 'patch'];
const CAT_COLORS: Record<string, string> = {
  tournament: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  gaming:     'bg-blue-500/10 text-blue-400 border-blue-500/30',
  recap:      'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  announcement: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  patch:      'bg-orange-500/10 text-orange-400 border-orange-500/30',
};

function autoSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function NewsSection() {
  const [news, setNews] = useState<AdminNewsPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', category: 'tournament', author: '', tags: '' });
  const [saving, setSaving] = useState(false); const [flash, setFlash] = useState('');

  const load = () => listAdminNews().then(setNews).catch(() => {});
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await createNewsPost({ ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] });
      setFlash('Published!'); setShowForm(false); setForm({ title: '', slug: '', excerpt: '', content: '', category: 'tournament', author: '', tags: '' }); setTimeout(() => setFlash(''), 3000); load();
    } catch (err: any) { setFlash('Error: ' + err.message); } finally { setSaving(false); }
  }

  async function handleDelete(post: AdminNewsPost) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try { await deleteNewsPost(post.id); setNews(n => n.filter(x => x.id !== post.id)); } catch (err: any) { alert(err.message); }
  }

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {flash && <span className={`px-3 py-1.5 rounded-lg text-sm ${flash.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>{flash}</span>}
        <button onClick={() => setShowForm(!showForm)} className="ml-auto px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">{showForm ? '✕ Cancel' : '+ New Post'}</button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Create News Post</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value, slug: autoSlug(e.target.value)}))} className={inp} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Slug *</label>
                <input required value={form.slug} onChange={e => setForm(p => ({...p, slug: e.target.value}))} className={inp + ' font-mono'} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Author *</label>
                <input required value={form.author} onChange={e => setForm(p => ({...p, author: e.target.value}))} className={inp} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className={inp}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>
            </div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Excerpt *</label>
              <input required value={form.excerpt} onChange={e => setForm(p => ({...p, excerpt: e.target.value}))} placeholder="Short description…" className={inp} /></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Content *</label>
              <textarea required rows={6} value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} className={inp + ' resize-y'} /></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} placeholder="PUBG, Tournament" className={inp} /></div>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-sm rounded-lg transition-colors">{saving ? 'Publishing…' : 'Publish'}</button>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Title</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Category</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Author</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Date</th>
            <th className="text-right px-4 py-3 text-muted-foreground font-medium">Action</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {news.map(post => (
              <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3"><p className="font-medium text-foreground">{post.title}</p><p className="text-xs text-muted-foreground font-mono mt-0.5">{post.slug}</p></td>
                <td className="px-4 py-3 hidden sm:table-cell"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${CAT_COLORS[post.category] ?? 'bg-muted text-muted-foreground'}`}>{post.category}</span></td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{post.author}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden md:table-cell">{new Date(post.publishedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(post)} className="px-2 py-1 rounded text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors">Delete</button></td>
              </tr>
            ))}
            {news.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No posts yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

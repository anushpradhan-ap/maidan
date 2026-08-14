import { useState, useEffect } from 'react';
import { AdminNewsPost, listAdminNews, createNewsPost, updateNewsPost, deleteNewsPost } from '@/lib/api';

const CATEGORIES = ['tournament', 'gaming', 'recap', 'announcement', 'patch'];
const CAT_COLORS: Record<string, string> = {
  tournament:   'bg-purple-500/10 text-purple-400 border-purple-500/30',
  gaming:       'bg-blue-500/10 text-blue-400 border-blue-500/30',
  recap:        'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  announcement: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  patch:        'bg-orange-500/10 text-orange-400 border-orange-500/30',
};

const STATUS_COLORS = {
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  draft:     'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

function autoSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const EMPTY_FORM = { title: '', slug: '', excerpt: '', content: '', category: 'gaming', author: '', coverUrl: '', tags: '', status: 'published', isBreaking: false, publishedAt: '' };

export default function NewsSection() {
  const [news, setNews] = useState<AdminNewsPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminNewsPost | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<AdminNewsPost | null>(null);

  const load = () => listAdminNews().then(setNews).catch(() => {});
  useEffect(() => { load(); }, []);

  const ok  = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 3000); };
  const err = (msg: string) => { setFlash('Error: ' + msg); setTimeout(() => setFlash(''), 4000); };

  const inp  = 'w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors';
  const label = 'block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium';

  function openCreate() { setEditing(null); setForm({ ...EMPTY_FORM }); setShowForm(true); }
  function openEdit(p: AdminNewsPost) {
    setEditing(p);
    setForm({
      title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content,
      category: p.category, author: p.author, coverUrl: p.coverUrl ?? '',
      tags: (p.tags ?? []).join(', '), status: p.status,
      isBreaking: p.isBreaking,
      publishedAt: p.publishedAt ? p.publishedAt.slice(0, 10) : '',
    });
    setShowForm(true);
  }
  function cancelForm() { setShowForm(false); setEditing(null); setForm({ ...EMPTY_FORM }); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        isBreaking: Boolean(form.isBreaking),
      };
      if (editing) {
        await updateNewsPost(editing.id, payload);
        ok('Post updated!');
      } else {
        await createNewsPost(payload);
        ok('Post created!');
      }
      cancelForm(); load();
    } catch (e: any) { err(e.message); } finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    try { await deleteNewsPost(deleteConfirm.id); setNews(n => n.filter(x => x.id !== deleteConfirm.id)); ok('Deleted.'); }
    catch (e: any) { err(e.message); }
    setDeleteConfirm(null);
  }

  const filtered = news.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterCat !== 'all' && p.category !== filterCat) return false;
    if (search) { const q = search.toLowerCase(); return p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q); }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[160px] bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none">
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none">
          <option value="all">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {flash && <span className={`px-3 py-1.5 rounded-lg text-sm ${flash.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>{flash}</span>}
        <button onClick={openCreate} className="ml-auto px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">+ New Post</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground">{editing ? 'Edit Post' : 'Create News Post'}</h2>
            <button onClick={cancelForm} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={label}>Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: p.slug || autoSlug(e.target.value) }))} className={inp} /></div>
              <div><label className={label}>Slug *</label>
                <input required value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className={inp + ' font-mono'} /></div>
              <div><label className={label}>Author *</label>
                <input required value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} className={inp} /></div>
              <div><label className={label}>Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inp}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>
              <div><label className={label}>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inp}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select></div>
              <div><label className={label}>Publication Date</label>
                <input type="date" value={form.publishedAt} onChange={e => setForm(p => ({ ...p, publishedAt: e.target.value }))} className={inp} /></div>
              <div className="sm:col-span-2"><label className={label}>Featured Image URL</label>
                <input value={form.coverUrl} onChange={e => setForm(p => ({ ...p, coverUrl: e.target.value }))} placeholder="https://…" className={inp} /></div>
            </div>
            <div><label className={label}>Excerpt *</label>
              <input required value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short summary shown on cards…" className={inp} /></div>
            <div><label className={label}>Full Content *</label>
              <textarea required rows={8} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Full article content (HTML supported)…" className={inp + ' resize-y'} /></div>
            <div><label className={label}>Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="PUBG, Tournament, Nepal" className={inp} /></div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={Boolean(form.isBreaking)} onChange={e => setForm(p => ({ ...p, isBreaking: e.target.checked }))}
                className="w-4 h-4 accent-red-500" />
              <span className="text-sm font-medium text-foreground">🔴 Mark as Breaking News <span className="text-muted-foreground font-normal">(shows homepage banner)</span></span>
            </label>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-sm rounded-lg transition-colors">
                {saving ? 'Saving…' : editing ? 'Update Post' : 'Publish Post'}
              </button>
              <button type="button" onClick={cancelForm} className="px-6 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-semibold text-sm rounded-lg transition-colors border border-border">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Title</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Status</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
              <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(post => (
                <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {post.isBreaking && <span title="Breaking news" className="text-red-400">🔴</span>}
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{post.author}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${CAT_COLORS[post.category] ?? 'bg-muted text-muted-foreground'}`}>{post.category}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[post.status] ?? ''}`}>{post.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden lg:table-cell">{new Date(post.publishedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(post)} className="px-2 py-1 rounded text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors">Edit</button>
                      <button onClick={() => setDeleteConfirm(post)} className="px-2 py-1 rounded text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No posts found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-semibold text-foreground mb-2">Delete Post?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete <span className="text-foreground font-medium">"{deleteConfirm.title}"</span>? This cannot be undone.
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

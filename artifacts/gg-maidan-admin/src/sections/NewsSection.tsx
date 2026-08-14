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

const EMPTY = { title: '', slug: '', excerpt: '', content: '', category: 'gaming', author: '', coverUrl: '', tags: '', status: 'published', isBreaking: false, publishedAt: '' };

function ImagePreview({ url }: { url: string }) {
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOk(false);
    if (!url) return;
    setLoading(true);
    const img = new Image();
    img.onload = () => { setOk(true); setLoading(false); };
    img.onerror = () => { setOk(false); setLoading(false); };
    img.src = url;
  }, [url]);

  if (!url) return (
    <div className="h-36 rounded-lg bg-muted/20 border border-dashed border-white/10 flex items-center justify-center text-muted-foreground text-sm">
      <span>Paste an image URL above to preview</span>
    </div>
  );
  if (loading) return (
    <div className="h-36 rounded-lg bg-muted/20 border border-white/10 flex items-center justify-center animate-pulse">
      <span className="text-muted-foreground text-xs">Loading…</span>
    </div>
  );
  if (!ok) return (
    <div className="h-36 rounded-lg bg-red-500/5 border border-red-500/20 flex items-center justify-center">
      <span className="text-red-400 text-xs">⚠️ Image could not be loaded</span>
    </div>
  );
  return (
    <div className="relative h-36 rounded-lg overflow-hidden border border-white/10 group">
      <img src={url} alt="Cover preview" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-white text-xs underline">Open in new tab</a>
      </div>
    </div>
  );
}

export default function NewsSection() {
  const [news, setNews] = useState<AdminNewsPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminNewsPost | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<AdminNewsPost | null>(null);

  const load = () => listAdminNews().then(setNews).catch(() => {});
  useEffect(() => { load(); }, []);

  const ok  = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 3000); };
  const err = (msg: string) => { setFlash('Error: ' + msg); setTimeout(() => setFlash(''), 4500); };

  const inp = 'w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors';
  const label = 'block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium';

  function openCreate() { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); }
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
    setTimeout(() => document.getElementById('news-form-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }
  function cancelForm() { setShowForm(false); setEditing(null); setForm({ ...EMPTY }); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        isBreaking: Boolean(form.isBreaking),
      };
      if (editing) { await updateNewsPost(editing.id, payload); ok('Post updated!'); }
      else { await createNewsPost(payload); ok('Post published!'); }
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
    <div className="space-y-5">
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
        {flash && (
          <span className={`px-3 py-1.5 rounded-lg text-sm ${flash.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>
            {flash}
          </span>
        )}
        <button onClick={openCreate}
          className="ml-auto px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">
          + New Post
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div id="news-form-top" className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Form header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
            <div>
              <h2 className="font-semibold text-foreground">{editing ? '✏️ Edit Post' : '✨ Create News Post'}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Fill in the details below. The cover image will show on the homepage and article page.</p>
            </div>
            <button onClick={cancelForm} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Cover image — prominent at top */}
            <div className="space-y-2">
              <label className={label}>Cover Image URL</label>
              <input
                value={form.coverUrl}
                onChange={e => setForm(p => ({ ...p, coverUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/…  or any direct image link"
                className={inp}
              />
              <ImagePreview url={form.coverUrl} />
              <p className="text-xs text-muted-foreground">Paste any direct image URL. Use <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Unsplash</a>, <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Imgur</a>, or upload to <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ImgBB</a> for a free image host.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={label}>Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: p.slug || autoSlug(e.target.value) }))} className={inp} /></div>
              <div><label className={label}>Slug *</label>
                <input required value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className={inp + ' font-mono text-xs'} /></div>
              <div><label className={label}>Author *</label>
                <input required value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} placeholder="GG Maidan Team" className={inp} /></div>
              <div><label className={label}>Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inp}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select></div>
              <div><label className={label}>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inp}>
                  <option value="published">Published</option>
                  <option value="draft">Draft (hidden from public)</option>
                </select></div>
              <div><label className={label}>Publication Date</label>
                <input type="date" value={form.publishedAt} onChange={e => setForm(p => ({ ...p, publishedAt: e.target.value }))} className={inp} /></div>
            </div>

            <div><label className={label}>Excerpt * <span className="normal-case font-normal text-muted-foreground">(shown on cards)</span></label>
              <input required value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short summary shown on news cards and the homepage…" className={inp} /></div>

            <div><label className={label}>Full Content *</label>
              <textarea required rows={10} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write the full article here. HTML is supported for headings, bold, links, etc." className={inp + ' resize-y font-mono text-xs leading-relaxed'} /></div>

            <div><label className={label}>Tags <span className="normal-case font-normal text-muted-foreground">(comma separated)</span></label>
              <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="PUBG, Tournament, Nepal" className={inp} /></div>

            <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
              <input type="checkbox" checked={Boolean(form.isBreaking)} onChange={e => setForm(p => ({ ...p, isBreaking: e.target.checked }))}
                className="w-4 h-4 accent-red-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">🔴 Mark as Breaking News</p>
                <p className="text-xs text-muted-foreground">Shows a red banner at the top of the homepage until dismissed.</p>
              </div>
            </label>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-sm rounded-lg transition-colors">
                {saving ? 'Saving…' : editing ? '✓ Update Post' : '✓ Publish Post'}
              </button>
              <button type="button" onClick={cancelForm}
                className="px-6 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-semibold text-sm rounded-lg transition-colors border border-border">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium w-12" />
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Title</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Status</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
              <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(post => (
                <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                  {/* Thumbnail */}
                  <td className="pl-4 py-2.5">
                    {post.coverUrl ? (
                      <img src={post.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted/30 border border-white/5 flex items-center justify-center text-lg">📰</div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground flex items-center gap-1.5">
                      {post.isBreaking && <span title="Breaking" className="text-red-400 text-xs">🔴</span>}
                      <span className="line-clamp-1">{post.title}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{post.author}</p>
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${CAT_COLORS[post.category] ?? 'bg-muted text-muted-foreground'}`}>{post.category}</span>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[post.status] ?? ''}`}>{post.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs hidden lg:table-cell">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(post)}
                        className="px-2.5 py-1 rounded text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => setDeleteConfirm(post)}
                        className="px-2.5 py-1 rounded text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {news.length === 0 ? 'No posts yet. Create your first one!' : 'No posts match the current filter.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {deleteConfirm.coverUrl && (
              <img src={deleteConfirm.coverUrl} alt="" className="w-full h-32 object-cover rounded-xl mb-4 opacity-60" />
            )}
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

import { useState, useEffect } from 'react';
import { AdminSponsor, listAdminSponsors, createSponsor, deleteSponsor } from '@/lib/api';

const TIERS = ['platinum', 'gold', 'silver', 'bronze', 'partner'];
const TIER_COLORS: Record<string, string> = {
  platinum: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  gold:     'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  silver:   'bg-slate-500/10 text-slate-300 border-slate-500/30',
  bronze:   'bg-orange-500/10 text-orange-300 border-orange-500/30',
  partner:  'bg-purple-500/10 text-purple-300 border-purple-500/30',
};

export default function SponsorsSection() {
  const [sponsors, setSponsors] = useState<AdminSponsor[]>([]);
  const [form, setForm] = useState({ name: '', tier: 'gold', logoUrl: '', website: '', description: '' });
  const [saving, setSaving] = useState(false); const [flash, setFlash] = useState('');

  const load = () => listAdminSponsors().then(setSponsors).catch(() => {});
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await createSponsor({ name: form.name, tier: form.tier, logoUrl: form.logoUrl || undefined, website: form.website || undefined, description: form.description || undefined });
      setFlash('Sponsor added!'); setForm({ name: '', tier: 'gold', logoUrl: '', website: '', description: '' }); setTimeout(() => setFlash(''), 3000); load();
    } catch (err: any) { setFlash('Error: ' + err.message); } finally { setSaving(false); }
  }

  async function handleDelete(s: AdminSponsor) {
    if (!confirm(`Remove "${s.name}"?`)) return;
    try { await deleteSponsor(s.id); setSponsors(p => p.filter(x => x.id !== s.id)); } catch (err: any) { alert(err.message); }
  }

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg">
        <h2 className="font-semibold text-foreground mb-4">Add Sponsor</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Razer" className={inp} /></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Tier *</label>
              <select value={form.tier} onChange={e => setForm(p => ({...p, tier: e.target.value}))} className={inp}>
                {TIERS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select></div>
          </div>
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Logo URL</label>
            <input value={form.logoUrl} onChange={e => setForm(p => ({...p, logoUrl: e.target.value}))} placeholder="https://…" className={inp} /></div>
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Website</label>
            <input value={form.website} onChange={e => setForm(p => ({...p, website: e.target.value}))} placeholder="https://razer.com" className={inp} /></div>
          <div><label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className={inp + ' resize-none'} /></div>
          {flash && <div className={`text-sm px-4 py-2.5 rounded-lg ${flash.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>{flash}</div>}
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-sm rounded-xl transition-colors">{saving ? 'Saving…' : 'Add Sponsor'}</button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Sponsors ({sponsors.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sponsors.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-4 group hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                {s.logoUrl ? <img src={s.logoUrl} alt={s.name} className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1" /> : <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">🤝</div>}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{s.name}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${TIER_COLORS[s.tier] ?? ''}`}>{s.tier}</span>
                </div>
                <button onClick={() => handleDelete(s)} className="shrink-0 text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xl leading-none">×</button>
              </div>
              {s.website && <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">{s.website}</a>}
              {s.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
            </div>
          ))}
          {sponsors.length === 0 && <div className="col-span-full py-10 text-center text-muted-foreground">No sponsors yet.</div>}
        </div>
      </div>
    </div>
  );
}

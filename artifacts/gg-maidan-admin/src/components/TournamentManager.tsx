import { useState } from 'react';
import { AdminTournament, patchTournament } from '@/lib/api';

interface Props { tournaments: AdminTournament[]; onRefresh: () => void; }

const STATUS_COLORS = {
  upcoming: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  live:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  completed:'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

export default function TournamentManager({ tournaments, onRefresh }: Props) {
  const [editing, setEditing] = useState<AdminTournament | null>(null);
  const [form, setForm] = useState<Partial<AdminTournament>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  function openEdit(t: AdminTournament) {
    setEditing(t);
    setForm({
      status: t.status,
      title: t.title,
      prizePool: t.prizePool,
      currentRound: t.currentRound ?? undefined,
      totalRounds: t.totalRounds ?? undefined,
      teamsAlive: t.teamsAlive ?? undefined,
      currentZone: t.currentZone ?? undefined,
      streamUrl: t.streamUrl ?? undefined,
    });
  }

  async function quickStatus(t: AdminTournament, status: AdminTournament['status']) {
    try {
      await patchTournament(t.id, { status });
      setSuccess(`${t.title} → ${status.toUpperCase()}`);
      setTimeout(() => setSuccess(''), 3000);
      onRefresh();
    } catch (e: any) { alert(e.message); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await patchTournament(editing.id, form as any);
      setSuccess('Tournament updated!');
      setTimeout(() => setSuccess(''), 3000);
      setEditing(null);
      onRefresh();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  const field = (label: string, key: keyof AdminTournament, type = 'text') => (
    <div key={key}>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <input type={type} value={String(form[key] ?? '')}
        onChange={e => setForm(p => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
    </div>
  );

  return (
    <div className="space-y-4">
      {success && (
        <div className="px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
          ✓ {success}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Tournament</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Game</th>
                <th className="text-center px-4 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-center px-4 py-3 text-muted-foreground font-medium">Teams</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Prize</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tournaments.map(t => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {t.currentRound != null ? `Rd ${t.currentRound}/${t.totalRounds ?? '?'}` : new Date(t.startDate).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.gameName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                    {t.registeredTeams}/{t.maxTeams}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{t.prizePool}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* Quick status buttons */}
                      {t.status !== 'live' && (
                        <button onClick={() => quickStatus(t, 'live')}
                          className="px-2 py-1 rounded text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors">
                          → Live
                        </button>
                      )}
                      {t.status !== 'completed' && (
                        <button onClick={() => quickStatus(t, 'completed')}
                          className="px-2 py-1 rounded text-xs bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/30 transition-colors">
                          Finish
                        </button>
                      )}
                      {t.status !== 'upcoming' && (
                        <button onClick={() => quickStatus(t, 'upcoming')}
                          className="px-2 py-1 rounded text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 transition-colors">
                          Reset
                        </button>
                      )}
                      <button onClick={() => openEdit(t)}
                        className="px-2 py-1 rounded text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Edit: {editing.title}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {field('Title', 'title')}
                {field('Prize Pool', 'prizePool')}
                {field('Current Round', 'currentRound', 'number')}
                {field('Total Rounds', 'totalRounds', 'number')}
                {field('Teams Alive', 'teamsAlive', 'number')}
                {field('Current Zone', 'currentZone')}
              </div>
              {field('Stream URL', 'streamUrl')}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold text-sm rounded-lg transition-colors">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(null)}
                  className="flex-1 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-semibold text-sm rounded-lg transition-colors border border-border">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

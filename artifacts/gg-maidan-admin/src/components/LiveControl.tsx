import { useState, useEffect } from 'react';
import {
  AdminTournament, TeamOption, StandingRow,
  postLiveUpdate, clearLiveUpdates,
  getStandings, upsertStanding,
  listAdminTeams, patchTournament,
} from '@/lib/api';

interface Props { tournaments: AdminTournament[]; onRefresh: () => void; }

const UPDATE_TYPES = [
  { value: 'kill', label: '☠️ Kill', color: 'text-red-400' },
  { value: 'zone', label: '🔵 Zone', color: 'text-blue-400' },
  { value: 'round_start', label: '▶️ Round Start', color: 'text-emerald-400' },
  { value: 'round_end', label: '⏹ Round End', color: 'text-yellow-400' },
  { value: 'event', label: '📣 Event', color: 'text-purple-400' },
] as const;

export default function LiveControl({ tournaments, onRefresh }: Props) {
  const live = tournaments.filter(t => t.status === 'live');
  const [selId, setSelId] = useState<number | null>(live[0]?.id ?? null);
  const tournament = tournaments.find(t => t.id === selId) ?? null;

  const [type, setType] = useState<'kill'|'zone'|'round_start'|'round_end'|'event'>('event');
  const [message, setMessage] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [kills, setKills] = useState('');
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState('');

  // Tournament field edits
  const [round, setRound] = useState('');
  const [teamsAlive, setTeamsAlive] = useState('');
  const [zone, setZone] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Standings
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [standingForm, setStandingForm] = useState({ teamId: '', rank: '', kills: '', points: '', placement: '' });
  const [savingStanding, setSavingStanding] = useState(false);

  useEffect(() => {
    if (!selId) return;
    const t = tournaments.find(x => x.id === selId);
    if (t) {
      setRound(String(t.currentRound ?? ''));
      setTeamsAlive(String(t.teamsAlive ?? ''));
      setZone(t.currentZone ?? '');
      setStreamUrl(t.streamUrl ?? '');
    }
    getStandings(selId).then(setStandings).catch(() => {});
    listAdminTeams().then(setTeams).catch(() => {});
  }, [selId]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!selId || !message.trim()) return;
    setPosting(true);
    try {
      await postLiveUpdate(selId, {
        message,
        type,
        playerName: playerName || null,
        teamName: teamName || null,
        kills: kills ? Number(kills) : null,
      });
      setSuccess('Update posted!');
      setMessage(''); setPlayerName(''); setTeamName(''); setKills('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setPosting(false);
    }
  }

  async function handleSaveTournament(e: React.FormEvent) {
    e.preventDefault();
    if (!selId) return;
    setSaving(true);
    try {
      await patchTournament(selId, {
        currentRound: round ? Number(round) : undefined,
        teamsAlive: teamsAlive ? Number(teamsAlive) : undefined,
        currentZone: zone || undefined,
        streamUrl: streamUrl || undefined,
      } as any);
      setSuccess('Tournament updated!');
      setTimeout(() => setSuccess(''), 3000);
      onRefresh();
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    if (!selId || !confirm('Clear all live updates for this tournament?')) return;
    await clearLiveUpdates(selId);
    setSuccess('Feed cleared!');
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleUpsertStanding(e: React.FormEvent) {
    e.preventDefault();
    if (!selId || !standingForm.teamId) return;
    setSavingStanding(true);
    try {
      const row = await upsertStanding({
        tournamentId: selId,
        teamId: Number(standingForm.teamId),
        rank: Number(standingForm.rank),
        kills: Number(standingForm.kills),
        points: Number(standingForm.points),
        placement: Number(standingForm.placement),
      });
      setStandings(prev => {
        const idx = prev.findIndex(s => s.teamId === row.teamId);
        if (idx >= 0) { const n = [...prev]; n[idx] = row; return n; }
        return [...prev, row].sort((a, b) => a.rank - b.rank);
      });
      setStandingForm({ teamId: '', rank: '', kills: '', points: '', placement: '' });
      setSuccess('Standing updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setSavingStanding(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Tournament selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Select Tournament</label>
          <select
            value={selId ?? ''}
            onChange={e => setSelId(Number(e.target.value))}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">-- choose --</option>
            {tournaments.map(t => (
              <option key={t.id} value={t.id}>
                {t.title} [{t.status.toUpperCase()}]
              </option>
            ))}
          </select>
        </div>
        {success && (
          <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
            ✓ {success}
          </div>
        )}
      </div>

      {!selId ? (
        <div className="text-center py-16 text-muted-foreground">Select a tournament to control.</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left: Match State + Feed */}
          <div className="xl:col-span-2 space-y-6">

            {/* Match state editor */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Match State
              </h3>
              <form onSubmit={handleSaveTournament} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Current Round</label>
                  <input type="number" value={round} onChange={e => setRound(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Teams Alive</label>
                  <input type="number" value={teamsAlive} onChange={e => setTeamsAlive(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Zone Name</label>
                  <input type="text" value={zone} onChange={e => setZone(e.target.value)} placeholder="e.g. Military Base"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Stream URL</label>
                  <input type="text" value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="https://..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div className="col-span-2 sm:col-span-4 flex gap-3 pt-1">
                  <button type="submit" disabled={saving}
                    className="px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">
                    {saving ? 'Saving…' : 'Update Match State'}
                  </button>
                </div>
              </form>
            </div>

            {/* Post Live Update */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="text-red-400">📡</span> Post Live Update
                </h3>
                <button onClick={handleClear} className="text-xs text-muted-foreground hover:text-red-400 transition-colors">
                  Clear Feed
                </button>
              </div>

              <form onSubmit={handlePost} className="space-y-4">
                {/* Type buttons */}
                <div className="flex flex-wrap gap-2">
                  {UPDATE_TYPES.map(ut => (
                    <button key={ut.value} type="button" onClick={() => setType(ut.value as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        type === ut.value
                          ? 'bg-primary/20 border-primary/50 text-primary-foreground'
                          : 'bg-background border-border text-muted-foreground hover:border-primary/30'
                      }`}>
                      {ut.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Message *</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={2}
                    placeholder="e.g. ShadowStrike eliminates Digital Warriors with a headshot!"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>

                {type === 'kill' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Player Name</label>
                      <input value={playerName} onChange={e => setPlayerName(e.target.value)}
                        placeholder="ShadowStrike"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Team Name</label>
                      <input value={teamName} onChange={e => setTeamName(e.target.value)}
                        placeholder="Storm Raiders"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Kills</label>
                      <input type="number" value={kills} onChange={e => setKills(e.target.value)}
                        placeholder="3"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={posting || !message.trim()}
                  className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold text-sm rounded-lg transition-colors">
                  {posting ? 'Posting…' : '📡 Post to Live Feed'}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Standings editor */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4">📊 Update Standings</h3>

              {/* Existing standings quick view */}
              {standings.length > 0 && (
                <div className="mb-4 space-y-1 max-h-48 overflow-y-auto">
                  {standings.map(s => (
                    <div key={s.teamId}
                      onClick={() => setStandingForm({ teamId: String(s.teamId), rank: String(s.rank), kills: String(s.kills), points: String(s.points), placement: String(s.placement) })}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-background hover:bg-accent cursor-pointer transition-colors text-sm">
                      <span className="font-mono text-muted-foreground w-6">#{s.rank}</span>
                      <span className="flex-1 font-medium text-foreground truncate">{s.teamName}</span>
                      <span className="text-primary font-mono">{s.points}pts</span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleUpsertStanding} className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Team</label>
                  <select value={standingForm.teamId} onChange={e => setStandingForm(p => ({...p, teamId: e.target.value}))} required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="">Select team…</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(['rank','kills','points','placement'] as const).map(f => (
                    <div key={f}>
                      <label className="text-xs text-muted-foreground block mb-1 capitalize">{f}</label>
                      <input type="number" value={standingForm[f]} onChange={e => setStandingForm(p => ({...p, [f]: e.target.value}))} required
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={savingStanding}
                  className="w-full py-2 bg-secondary hover:bg-accent text-secondary-foreground text-sm font-semibold rounded-lg transition-colors border border-border">
                  {savingStanding ? 'Saving…' : 'Save Standing'}
                </button>
              </form>
            </div>

            {/* Quick snippets */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm">⚡ Quick Posts</h3>
              <div className="space-y-2">
                {[
                  { msg: `Round ${(tournament?.currentRound ?? 0) + 1} has started!`, type: 'round_start' as const },
                  { msg: `Zone is closing! Teams must reposition.`, type: 'zone' as const },
                  { msg: `Round ${tournament?.currentRound ?? 1} ends. Checking scores…`, type: 'round_end' as const },
                  { msg: `Only ${tournament?.teamsAlive ?? '?'} teams remaining!`, type: 'event' as const },
                ].map((q, i) => (
                  <button key={i} type="button"
                    onClick={() => { setMessage(q.msg); setType(q.type); }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-background hover:bg-accent text-xs text-muted-foreground hover:text-foreground transition-colors border border-border">
                    {q.msg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

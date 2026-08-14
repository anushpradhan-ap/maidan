import { useState } from 'react';
import { useRoute } from "wouter";
import { useGetTournament } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Calendar, Users, Info, CheckCircle2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface RegForm {
  fullName: string;
  email: string;
  phone: string;
  teamName: string;
  message: string;
}

const EMPTY: RegForm = { fullName: '', email: '', phone: '', teamName: '', message: '' };

export default function TournamentDetail() {
  const [, params] = useRoute("/tournaments/:id");
  const id = Number(params?.id);

  const { data: tournament, isLoading } = useGetTournament(id, {
    query: { queryKey: [], enabled: !!id }
  });

  const [regOpen, setRegOpen] = useState(false);
  const [form, setForm] = useState<RegForm>({ ...EMPTY });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const inp = 'w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors';

  function openReg() { setForm({ ...EMPTY }); setSuccess(false); setError(''); setRegOpen(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/tournaments/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Registration failed');
      }
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!tournament) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Tournament not found.</div>;
  }

  const isFull = tournament.registeredTeams >= tournament.maxTeams;
  const canRegister = tournament.status === 'upcoming' && !isFull;

  return (
    <div className="pb-20">
      {/* Banner */}
      <div className="relative h-[40vh] md:h-[50vh] w-full border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        {tournament.bannerUrl ? (
          <img src={tournament.bannerUrl} alt={tournament.title} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        )}
        <div className="absolute bottom-0 left-0 w-full z-20 p-6 md:p-12">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={tournament.status === 'live' ? 'bg-emerald-500 text-white live-glow' : tournament.status === 'completed' ? 'bg-gray-600 text-white' : 'bg-primary text-primary-foreground'}>
                {tournament.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-1.5 inline-block" />}
                {tournament.status.toUpperCase()}
              </Badge>
              {tournament.gameName && (
                <Badge variant="outline" className="backdrop-blur-md bg-black/20 border-white/20 text-white">{tournament.gameName}</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight mb-4 text-white drop-shadow-lg">
              {tournament.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-200">
              <span className="flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> {tournament.prizePool}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> {tournament.registeredTeams} / {tournament.maxTeams} Registered</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-400" /> {new Date(tournament.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {tournament.description && (
              <Card className="glass-card border-white/5">
                <CardContent className="p-6">
                  <h2 className="font-display font-bold text-xl uppercase mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> About</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{tournament.description}</p>
                </CardContent>
              </Card>
            )}

            {(tournament as any).rules && (
              <Card className="glass-card border-white/5">
                <CardContent className="p-6">
                  <h2 className="font-display font-bold text-xl uppercase mb-4">📋 Rules</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{(tournament as any).rules}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Registration CTA */}
            <Card className="glass-card border-white/5">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-display font-bold text-lg uppercase">Registration</h3>

                {/* Slots bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Slots filled</span>
                    <span className="font-mono font-bold">{tournament.registeredTeams} / {tournament.maxTeams}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (tournament.registeredTeams / tournament.maxTeams) * 100)}%` }}
                    />
                  </div>
                  {isFull && <p className="text-xs text-red-400 mt-2 font-medium">All spots are filled.</p>}
                </div>

                {tournament.status === 'completed' ? (
                  <p className="text-muted-foreground text-sm text-center py-2">This tournament has ended.</p>
                ) : tournament.status === 'live' ? (
                  <p className="text-emerald-400 text-sm text-center font-semibold">🔴 Tournament is Live!</p>
                ) : isFull ? (
                  <Button disabled className="w-full opacity-50">Registration Closed</Button>
                ) : (
                  <Button onClick={openReg} className="w-full bg-primary hover:bg-primary/90 font-display uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all">
                    Register Now
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card className="glass-card border-white/5">
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-lg uppercase mb-4">Details</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Start Date</dt><dd className="font-medium">{new Date(tournament.startDate).toLocaleDateString()}</dd></div>
                  {tournament.endDate && <div className="flex justify-between"><dt className="text-muted-foreground">End Date</dt><dd className="font-medium">{new Date(tournament.endDate).toLocaleDateString()}</dd></div>}
                  <div className="flex justify-between"><dt className="text-muted-foreground">Prize Pool</dt><dd className="font-medium text-primary">{tournament.prizePool}</dd></div>
                  {tournament.gameName && <div className="flex justify-between"><dt className="text-muted-foreground">Game</dt><dd className="font-medium">{tournament.gameName}</dd></div>}
                  <div className="flex justify-between"><dt className="text-muted-foreground">Max Slots</dt><dd className="font-mono">{tournament.maxTeams}</dd></div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={regOpen} onOpenChange={setRegOpen}>
        <DialogContent className="max-w-md bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="font-display font-bold uppercase text-lg">
              Register for {tournament.title}
            </DialogTitle>
          </DialogHeader>

          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-400" />
              <h3 className="text-xl font-bold font-display uppercase">You're In!</h3>
              <p className="text-muted-foreground text-sm max-w-xs">Your registration has been submitted. We'll contact you at the provided email with next steps.</p>
              <Button onClick={() => setRegOpen(false)} className="mt-2 w-full">Close</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Full Name *</label>
                <input required value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Your name" className={inp} />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className={inp} />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+977 9800000000" className={inp} />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Team / In-game Name</label>
                <input value={form.teamName} onChange={e => setForm(p => ({ ...p, teamName: e.target.value }))} placeholder="Team Alpha" className={inp} />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">Message (optional)</label>
                <textarea rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Anything you'd like us to know…" className={inp + ' resize-none'} />
              </div>
              {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting} className="flex-1 bg-primary hover:bg-primary/90 font-display uppercase tracking-wider font-bold">
                  {submitting ? 'Submitting…' : 'Submit Registration'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setRegOpen(false)} className="border-white/10">Cancel</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

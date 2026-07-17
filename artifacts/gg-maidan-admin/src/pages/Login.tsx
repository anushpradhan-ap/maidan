import { useState } from 'react';
import { authCheck, setToken } from '@/lib/api';

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      setToken(password);
      const ok = await authCheck();
      if (ok) {
        onLogin();
      } else {
        setError('Incorrect password. Please try again.');
        setToken('');
      }
    } catch {
      setError('Incorrect password. Please try again.');
      setToken('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 8h20M6 16h12M6 24h8" stroke="hsl(263 70% 70%)" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="24" cy="22" r="6" fill="hsl(263 70% 60%)" opacity="0.2" stroke="hsl(263 70% 60%)" strokeWidth="2"/>
              <path d="M21.5 22l2 2 3-3" stroke="hsl(263 70% 70%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">GG Maidan Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">Tournament Control Center</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors font-mono"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Default password: <code className="font-mono bg-muted px-1 py-0.5 rounded">ggmaidan2024</code>
          </p>
        </div>
      </div>
    </div>
  );
}

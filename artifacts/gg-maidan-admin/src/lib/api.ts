// When deployed separately (e.g. Netlify), VITE_API_URL points to the remote API server.
// In dev (Replit), it is unset and calls stay root-relative (/api/...).
const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

function getToken(): string {
  return localStorage.getItem('gg_admin_token') ?? '';
}
export function setToken(token: string) { localStorage.setItem('gg_admin_token', token); }
export function clearToken() { localStorage.removeItem('gg_admin_token'); }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function authCheck(): Promise<boolean> {
  try { await request('/admin/auth', { method: 'POST' }); return true; } catch { return false; }
}

// ── Tournaments ───────────────────────────────────────────────────────────────
export interface AdminTournament {
  id: number; title: string; status: 'upcoming' | 'live' | 'completed';
  gameName: string | null; gameId: number; startDate: string; endDate: string | null;
  prizePool: string; maxTeams: number; registeredTeams: number;
  currentRound: number | null; totalRounds: number | null; teamsAlive: number | null;
  currentZone: string | null; streamUrl: string | null; description: string | null;
  bannerUrl: string | null;
}
export const listAdminTournaments = () => request<AdminTournament[]>('/admin/tournaments');
export const createTournament = (data: object) => request<AdminTournament>('/admin/tournaments', { method: 'POST', body: JSON.stringify(data) });
export const patchTournament = (id: number, data: object) => request<AdminTournament>(`/admin/tournaments/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTournament = (id: number) => request<void>(`/admin/tournaments/${id}`, { method: 'DELETE' });

// ── News ──────────────────────────────────────────────────────────────────────
export interface AdminNewsPost {
  id: number; title: string; slug: string; excerpt: string; content: string;
  category: string; author: string; coverUrl: string | null; publishedAt: string;
  createdAt: string; tags: string[]; status: 'draft' | 'published'; isBreaking: boolean;
}
export const listAdminNews = () => request<AdminNewsPost[]>('/admin/news');
export const createNewsPost = (data: object) => request<AdminNewsPost>('/admin/news', { method: 'POST', body: JSON.stringify(data) });
export const updateNewsPost = (id: number, data: object) => request<AdminNewsPost>(`/admin/news/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteNewsPost = (id: number) => request<void>(`/admin/news/${id}`, { method: 'DELETE' });

// ── Sponsors ─────────────────────────────────────────────────────────────────
export interface AdminSponsor { id: number; name: string; logoUrl: string | null; website: string | null; websiteUrl: string | null; tier: string; description: string | null; }
export const listAdminSponsors = () => request<AdminSponsor[]>('/admin/sponsors');
export const createSponsor = (data: { name: string; tier: string; logoUrl?: string; websiteUrl?: string; description?: string }) =>
  request<AdminSponsor>('/admin/sponsors', { method: 'POST', body: JSON.stringify(data) });
export const deleteSponsor = (id: number) => request<void>(`/admin/sponsors/${id}`, { method: 'DELETE' });

// ── Announcements ─────────────────────────────────────────────────────────────
export interface AdminAnnouncement { id: number; title: string; content: string; type: 'info' | 'warning' | 'success' | 'event'; createdAt: string; }
export const listAdminAnnouncements = () => request<AdminAnnouncement[]>('/admin/announcements');
export const createAnnouncement = (data: Omit<AdminAnnouncement, 'id' | 'createdAt'>) =>
  request<AdminAnnouncement>('/announcements', { method: 'POST', body: JSON.stringify(data) });
export const deleteAnnouncement = (id: number) => request<void>(`/admin/announcements/${id}`, { method: 'DELETE' });

// ── Event Registrations ───────────────────────────────────────────────────────
export interface AdminRegistration {
  id: number; tournamentId: number; tournamentName: string | null;
  fullName: string; email: string; phone: string | null;
  teamName: string | null; message: string | null; createdAt: string;
}
export const listAdminRegistrations = () => request<AdminRegistration[]>('/admin/registrations');
export const listTournamentRegistrations = (tournamentId: number) => request<AdminRegistration[]>(`/admin/registrations/${tournamentId}`);

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
}
export const listAdminTournaments = () => request<AdminTournament[]>('/admin/tournaments');
export const createTournament = (data: object) => request<AdminTournament>('/admin/tournaments', { method: 'POST', body: JSON.stringify(data) });
export const patchTournament = (id: number, data: object) => request<AdminTournament>(`/admin/tournaments/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTournament = (id: number) => request<void>(`/admin/tournaments/${id}`, { method: 'DELETE' });

// ── Standings ─────────────────────────────────────────────────────────────────
export interface StandingRow { id?: number; rank: number; teamId: number; teamName: string | null; kills: number; points: number; placement: number; }
export const getStandings = (tournamentId: number) => request<StandingRow[]>(`/admin/standings/${tournamentId}`);
export const upsertStanding = (data: { tournamentId: number; teamId: number; rank: number; kills: number; points: number; placement: number; }) =>
  request<StandingRow>('/admin/standings', { method: 'POST', body: JSON.stringify(data) });

// ── Games ─────────────────────────────────────────────────────────────────────
export interface AdminGame { id: number; name: string; logoUrl: string | null; description: string | null; }
export const listAdminGames = () => request<AdminGame[]>('/admin/games');
export const createGame = (data: { name: string; logoUrl?: string; description?: string }) =>
  request<AdminGame>('/admin/games', { method: 'POST', body: JSON.stringify(data) });
export const deleteGame = (id: number) => request<void>(`/admin/games/${id}`, { method: 'DELETE' });

// ── Teams ─────────────────────────────────────────────────────────────────────
export interface AdminTeam { id: number; name: string; tag: string; gameId: number; gameName: string | null; logoUrl: string | null; wins: number; losses: number; rank: number | null; }
export const listAdminTeams = () => request<AdminTeam[]>('/admin/teams');
export const createTeam = (data: { name: string; tag: string; gameId: number; logoUrl?: string; description?: string }) =>
  request<AdminTeam>('/admin/teams', { method: 'POST', body: JSON.stringify(data) });
export const deleteTeam = (id: number) => request<void>(`/admin/teams/${id}`, { method: 'DELETE' });

// ── Players ───────────────────────────────────────────────────────────────────
export interface AdminPlayer { id: number; username: string; fullName: string | null; gameId: number; gameName: string | null; teamId: number | null; teamName: string | null; role: string | null; country: string | null; rank: number | null; kills: number; tournamentWins: number; }
export const listAdminPlayers = () => request<AdminPlayer[]>('/admin/players');
export const createPlayer = (data: { username: string; fullName?: string; gameId: number; teamId?: number; role?: string; country?: string; bio?: string; avatarUrl?: string }) =>
  request<AdminPlayer>('/admin/players', { method: 'POST', body: JSON.stringify(data) });
export const deletePlayer = (id: number) => request<void>(`/admin/players/${id}`, { method: 'DELETE' });

// ── Live Updates ─────────────────────────────────────────────────────────────
export interface LiveUpdatePayload { message: string; type: 'kill' | 'zone' | 'round_start' | 'round_end' | 'event'; teamName?: string | null; playerName?: string | null; kills?: number | null; }
export const postLiveUpdate = (tournamentId: number, data: LiveUpdatePayload) =>
  request(`/live/${tournamentId}/update`, { method: 'POST', body: JSON.stringify(data) });
export const clearLiveUpdates = (tournamentId: number) =>
  request(`/admin/live-updates/tournament/${tournamentId}`, { method: 'DELETE' });

// ── News ──────────────────────────────────────────────────────────────────────
export interface AdminNewsPost { id: number; title: string; slug: string; excerpt: string; content: string; category: string; author: string; publishedAt: string; tags: string[]; }
export const listAdminNews = () => request<AdminNewsPost[]>('/admin/news');
export const createNewsPost = (data: Omit<AdminNewsPost, 'id' | 'publishedAt'>) =>
  request<AdminNewsPost>('/news', { method: 'POST', body: JSON.stringify(data) });
export const deleteNewsPost = (id: number) => request<void>(`/admin/news/${id}`, { method: 'DELETE' });

// ── Gallery ───────────────────────────────────────────────────────────────────
export interface AdminGalleryItem { id: number; title: string; type: string; url: string; thumbnailUrl: string | null; tournamentId: number | null; tournamentName: string | null; uploadedAt: string; }
export const listAdminGallery = () => request<AdminGalleryItem[]>('/admin/gallery');
export const createGalleryItem = (data: { title: string; type: string; url: string; thumbnailUrl?: string; tournamentId?: number }) =>
  request<AdminGalleryItem>('/admin/gallery', { method: 'POST', body: JSON.stringify(data) });
export const deleteGalleryItem = (id: number) => request<void>(`/admin/gallery/${id}`, { method: 'DELETE' });

// ── Sponsors ─────────────────────────────────────────────────────────────────
export interface AdminSponsor { id: number; name: string; logoUrl: string | null; website: string | null; tier: string; description: string | null; }
export const listAdminSponsors = () => request<AdminSponsor[]>('/admin/sponsors');
export const createSponsor = (data: { name: string; tier: string; logoUrl?: string; website?: string; description?: string }) =>
  request<AdminSponsor>('/admin/sponsors', { method: 'POST', body: JSON.stringify(data) });
export const deleteSponsor = (id: number) => request<void>(`/admin/sponsors/${id}`, { method: 'DELETE' });

// ── Announcements ─────────────────────────────────────────────────────────────
export interface AdminAnnouncement { id: number; title: string; content: string; type: 'info' | 'warning' | 'success' | 'event'; createdAt: string; }
export const listAdminAnnouncements = () => request<AdminAnnouncement[]>('/admin/announcements');
export const createAnnouncement = (data: Omit<AdminAnnouncement, 'id' | 'createdAt'>) =>
  request<AdminAnnouncement>('/announcements', { method: 'POST', body: JSON.stringify(data) });
export const deleteAnnouncement = (id: number) => request<void>(`/admin/announcements/${id}`, { method: 'DELETE' });

const BASE = '/api';

function getToken(): string {
  return localStorage.getItem('gg_admin_token') ?? '';
}

export function setToken(token: string) {
  localStorage.setItem('gg_admin_token', token);
}

export function clearToken() {
  localStorage.removeItem('gg_admin_token');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export async function authCheck(): Promise<boolean> {
  try {
    await request('/admin/auth', { method: 'POST' });
    return true;
  } catch {
    return false;
  }
}

// ── Tournaments ───────────────────────────────────────────────────────────────
export interface AdminTournament {
  id: number;
  title: string;
  status: 'upcoming' | 'live' | 'completed';
  gameName: string | null;
  gameId: number;
  startDate: string;
  endDate: string | null;
  prizePool: string;
  maxTeams: number;
  registeredTeams: number;
  currentRound: number | null;
  totalRounds: number | null;
  teamsAlive: number | null;
  currentZone: string | null;
  streamUrl: string | null;
}

export const listAdminTournaments = () =>
  request<AdminTournament[]>('/admin/tournaments');

export const patchTournament = (id: number, data: Partial<AdminTournament>) =>
  request<AdminTournament>(`/admin/tournaments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// ── Standings ─────────────────────────────────────────────────────────────────
export interface StandingRow {
  id?: number;
  rank: number;
  teamId: number;
  teamName: string | null;
  kills: number;
  points: number;
  placement: number;
}

export const getStandings = (tournamentId: number) =>
  request<StandingRow[]>(`/admin/standings/${tournamentId}`);

export const upsertStanding = (data: {
  tournamentId: number;
  teamId: number;
  rank: number;
  kills: number;
  points: number;
  placement: number;
}) => request<StandingRow>('/admin/standings', { method: 'POST', body: JSON.stringify(data) });

// ── Teams ─────────────────────────────────────────────────────────────────────
export interface TeamOption { id: number; name: string; gameId: number; }
export const listAdminTeams = () => request<TeamOption[]>('/admin/teams');

// ── Live Updates ─────────────────────────────────────────────────────────────
export interface LiveUpdatePayload {
  message: string;
  type: 'kill' | 'zone' | 'round_start' | 'round_end' | 'event';
  teamName?: string | null;
  playerName?: string | null;
  kills?: number | null;
}

export const postLiveUpdate = (tournamentId: number, data: LiveUpdatePayload) =>
  request(`/live/${tournamentId}/update`, { method: 'POST', body: JSON.stringify(data) });

export const clearLiveUpdates = (tournamentId: number) =>
  request(`/admin/live-updates/tournament/${tournamentId}`, { method: 'DELETE' });

// ── News ─────────────────────────────────────────────────────────────────────
export interface AdminNewsPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  tags: string[];
}

export const listAdminNews = () => request<AdminNewsPost[]>('/admin/news');

export const createNewsPost = (data: Omit<AdminNewsPost, 'id' | 'publishedAt'>) =>
  request<AdminNewsPost>('/news', { method: 'POST', body: JSON.stringify(data) });

export const deleteNewsPost = (id: number) =>
  request(`/admin/news/${id}`, { method: 'DELETE' });

// ── Announcements ─────────────────────────────────────────────────────────────
export interface AdminAnnouncement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'event';
  createdAt: string;
}

export const listAdminAnnouncements = () =>
  request<AdminAnnouncement[]>('/admin/announcements');

export const createAnnouncement = (data: Omit<AdminAnnouncement, 'id' | 'createdAt'>) =>
  request<AdminAnnouncement>('/announcements', { method: 'POST', body: JSON.stringify(data) });

export const deleteAnnouncement = (id: number) =>
  request(`/admin/announcements/${id}`, { method: 'DELETE' });

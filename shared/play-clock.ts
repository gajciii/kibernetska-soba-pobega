import type { SessionView } from './types.js';

export const SESSION_LIMIT_MS = 2 * 60 * 60 * 1000;
export const HEARTBEAT_MS = 10_000;
const LEASE_MS = 16_000;

export interface PlayClock {
  elapsedMs: number;
  measuredAt: number;
  leases: Record<string, number>;
}

export function playDeadline(session: SessionView) {
  return Date.parse(session.startedAt) + SESSION_LIMIT_MS;
}

export function playElapsed(session: SessionView, now: number): number {
  const clock = session.playClock;
  if (!clock) return session.completedAt ? Math.max(0, Date.parse(session.completedAt) - Date.parse(session.startedAt)) : 0;
  if (session.completedAt) return clock.elapsedMs;
  const activeUntil = Math.max(clock.measuredAt, ...Object.values(clock.leases));
  return clock.elapsedMs + Math.max(0, Math.min(now, activeUntil, playDeadline(session)) - clock.measuredAt);
}

export function recordPresence(session: SessionView, now: number, tab?: string, active = false) {
  const elapsedMs = playElapsed(session, now);
  const leases = Object.fromEntries(Object.entries(session.playClock?.leases ?? {}).filter(([, expires]) => expires > now));
  if (tab) {
    if (!active) delete leases[tab];
    else if (tab in leases || Object.keys(leases).length < 16) leases[tab] = now + LEASE_MS;
  }
  session.playClock = { elapsedMs, measuredAt: now, leases };
}

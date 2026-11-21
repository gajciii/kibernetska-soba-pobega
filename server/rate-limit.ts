import type pg from 'pg';

export const NEW_GAME_INTERVAL_MS = 60_000;
const IP_WINDOW_MS = 60_000;
const IP_LIMIT = 60;

export class RateLimitError extends Error {
  constructor(public retryAfterSeconds: number, message = 'Preveč novih sej ali iger. Počakaj in poskusi znova.') { super(message); }
}

export function checkStartCooldown(nextStartAt: Date | null, now: number) {
  if (nextStartAt && nextStartAt.getTime() > now) {
    throw new RateLimitError(Math.max(1, Math.ceil((nextStartAt.getTime() - now) / 1000)), 'Pred novo preiskavo počakaj. Obstoječo preiskavo lahko nadaljuješ.');
  }
}

/** Klic mora biti znotraj transakcije, ki ustvari sejo ali novo igro. */
export async function consumeIpLimit(client: pg.PoolClient, ipHash: string, action: 'anonymous' | 'start', now: number) {
  await client.query('INSERT INTO request_limits(ip_hash,action,accepted_at_ms) VALUES($1,$2,\'{}\') ON CONFLICT DO NOTHING', [ipHash, action]);
  const result = await client.query<{ accepted_at_ms: string[] }>('SELECT accepted_at_ms FROM request_limits WHERE ip_hash=$1 AND action=$2 FOR UPDATE', [ipHash, action]);
  const accepted = result.rows[0].accepted_at_ms.map(Number).filter(time => time > now - IP_WINDOW_MS);
  if (accepted.length >= IP_LIMIT) {
    throw new RateLimitError(Math.max(1, Math.ceil((Math.min(...accepted) + IP_WINDOW_MS - now) / 1000)));
  }
  accepted.push(now);
  await client.query('UPDATE request_limits SET accepted_at_ms=$3 WHERE ip_hash=$1 AND action=$2', [ipHash, action, accepted]);
}

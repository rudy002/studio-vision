import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Limitation de débit partagée entre instances (Upstash Redis).
 *
 * Tant que les variables d'environnement ne sont pas renseignées, la
 * limitation est simplement inactive : le site fonctionne normalement.
 * Variables attendues (fournies par l'intégration Upstash de Vercel) :
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *   ou KV_REST_API_URL / KV_REST_API_TOKEN
 */
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

export const rateLimitConfigured = redis !== null;

const limiters = new Map<string, Ratelimit>();

function limiter(name: string, attempts: number, window: `${number} ${'s' | 'm' | 'h'}`) {
  if (!redis) return null;
  const key = `${name}:${attempts}:${window}`;
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(attempts, window),
        prefix: `studio-vision:${name}`,
        analytics: false,
      }),
    );
  }
  return limiters.get(key)!;
}

/** Adresse de l'appelant, telle que transmise par Vercel. */
export function clientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'inconnu'
  );
}

/**
 * Renvoie true si la requête est autorisée. En l'absence de configuration
 * Upstash, autorise toujours (et ne casse donc rien).
 */
export async function allow(
  name: string,
  identifier: string,
  attempts: number,
  window: `${number} ${'s' | 'm' | 'h'}`,
): Promise<boolean> {
  const rl = limiter(name, attempts, window);
  if (!rl) return true;
  try {
    const { success } = await rl.limit(identifier);
    return success;
  } catch (error) {
    // Redis indisponible : on préfère laisser passer plutôt que bloquer le site.
    console.error('[rate-limit] Upstash injoignable', error);
    return true;
  }
}

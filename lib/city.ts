/**
 * Nom de ville selon la langue du site : hébreu → city (nom hébreu),
 * fr/en → city_en (nom latin). Fallback sur l'autre si absent
 * (ex. ville saisie manuellement dans l'admin sans sélection).
 */
export function cityLabel(
  p: { city?: string | null; city_en?: string | null },
  locale: string,
): string {
  return locale === 'he' ? (p.city || p.city_en || '') : (p.city_en || p.city || '');
}

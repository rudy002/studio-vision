/**
 * Les types de bien sont stockés en français dans la base (saisis depuis
 * l'admin). Cette table les relie aux clés du namespace i18n "propertyTypes".
 */
const TYPE_KEYS: Record<string, string> = {
  villa: 'villa',
  appartement: 'appartement',
  maison: 'maison',
  penthouse: 'penthouse',
  duplex: 'duplex',
};

/** Libellé traduit du type ; retombe sur la valeur brute si le type est inconnu. */
export function translatePropertyType(
  t: (key: string) => string,
  type?: string | null,
): string {
  if (!type) return '';
  const key = TYPE_KEYS[type.trim().toLowerCase()];
  return key ? t(key) : type;
}

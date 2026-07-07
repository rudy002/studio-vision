export const PACKAGES = [
  'Photos',
  'Vidéo basique',
  'Vidéo avancé',
  'Hadmaya',
  'Construction',
  'Visite virtuelle',
] as const;

export type PackageValue = (typeof PACKAGES)[number];

/** Libellé d'affichage hors i18n (admin, interface en français) */
export const packageLabel = (pkg: string) => {
  if (pkg === 'Hadmaya' || pkg === 'Admaya') return 'Home staging virtuel';
  if (pkg === 'Visite virtuelle') return 'Vidéo expert';
  return pkg;
};

/** Maps DB value (stored in French) → i18n key under the "packages" namespace */
export const PACKAGE_KEY: Record<string, string> = {
  'Photos':           'photos',
  'Vidéo basique':    'videoBasic',
  'Vidéo avancé':     'videoAdvanced',
  'Hadmaya':          'admaya',
  'Admaya':           'admaya', // legacy : biens enregistrés avant le renommage
  'Construction':     'construction',
  'Visite virtuelle': 'videoExpert',
};

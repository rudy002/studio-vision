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
export const packageLabel = (pkg: string) =>
  pkg === 'Hadmaya' || pkg === 'Admaya' ? 'Home staging virtuel' : pkg;

/** Maps DB value (stored in French) → i18n key under the "packages" namespace */
export const PACKAGE_KEY: Record<string, string> = {
  'Photos':           'photos',
  'Vidéo basique':    'videoBasic',
  'Vidéo avancé':     'videoAdvanced',
  'Hadmaya':          'admaya',
  'Admaya':           'admaya', // legacy : biens enregistrés avant le renommage
  'Construction':     'construction',
  'Visite virtuelle': 'virtualTour',
};

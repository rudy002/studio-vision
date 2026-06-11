export const PACKAGES = [
  'Photos',
  'Vidéo basique',
  'Vidéo avancé',
  'Admaya',
  'Construction',
  'Visite virtuelle',
] as const;

export type PackageValue = (typeof PACKAGES)[number];

/** Maps DB value (stored in French) → i18n key under the "packages" namespace */
export const PACKAGE_KEY: Record<string, string> = {
  'Photos':           'photos',
  'Vidéo basique':    'videoBasic',
  'Vidéo avancé':     'videoAdvanced',
  'Admaya':           'admaya',
  'Construction':     'construction',
  'Visite virtuelle': 'virtualTour',
};

export const BASE_URL = 'https://www.studiovision.co.il';

export function buildAlternates(path: string) {
  return {
    canonical: `${BASE_URL}/fr${path}`,
    languages: {
      fr: `${BASE_URL}/fr${path}`,
      en: `${BASE_URL}/en${path}`,
      he: `${BASE_URL}/he${path}`,
      'x-default': `${BASE_URL}/en${path}`,
    },
  };
}

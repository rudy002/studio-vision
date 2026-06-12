'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

// Les attributs lang/dir de <html> sont posés par le layout racine (serveur)
// et ne sont pas mis à jour lors d'une navigation client (changement de
// langue via la navbar). Ce composant les resynchronise à chaque locale.
export default function HtmlLangSync() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
  }, [locale]);

  return null;
}

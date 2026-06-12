import { NextRequest, NextResponse } from 'next/server';

type PhotonFeature = {
  properties: { osm_id?: number; name?: string; countrycode?: string };
  geometry: { coordinates: [number, number] };
};

const PHOTON_BASE =
  'https://photon.komoot.io/api/?lat=31.5&lon=35.0&location_bias_scale=0.5&limit=15' +
  '&osm_tag=place:city&osm_tag=place:town&osm_tag=place:village&osm_tag=place:municipality';

async function fetchPhoton(q: string, lang?: string): Promise<PhotonFeature[]> {
  const url = `${PHOTON_BASE}&q=${encodeURIComponent(q)}${lang ? `&lang=${lang}` : ''}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'StudioVision/1.0' } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features ?? []).filter(
    (f: PhotonFeature) => f.properties.name && f.properties.countrycode === 'IL',
  );
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) return NextResponse.json([]);

  // Deux appels : nom par défaut (hébreu en Israël) + nom anglais,
  // fusionnés par identifiant OSM.
  const [defaults, english] = await Promise.all([fetchPhoton(q), fetchPhoton(q, 'en')]);

  const enById = new Map<number, string>();
  for (const f of english) {
    if (f.properties.osm_id) enById.set(f.properties.osm_id, f.properties.name!);
  }

  const seen = new Set<string>();
  const cities = defaults
    .map((f) => ({
      label: f.properties.name!,
      label_en: (f.properties.osm_id && enById.get(f.properties.osm_id)) || f.properties.name!,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }))
    .filter((c) => {
      if (seen.has(c.label)) return false;
      seen.add(c.label);
      return true;
    });

  return NextResponse.json(cities);
}

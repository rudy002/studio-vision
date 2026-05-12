import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) return NextResponse.json([]);

  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}` +
    `&lat=31.5&lon=35.0&location_bias_scale=0.5&limit=15` +
    `&osm_tag=place:city&osm_tag=place:town&osm_tag=place:village&osm_tag=place:municipality`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'StudioVision/1.0' },
  });

  if (!res.ok) return NextResponse.json([]);

  const data = await res.json();

  const seen = new Set<string>();
  const cities = (data.features ?? [])
    .filter(
      (f: { properties: { name?: string; countrycode?: string } }) =>
        f.properties.name && f.properties.countrycode === 'IL',
    )
    .map((f: { geometry: { coordinates: [number, number] }; properties: { name: string } }) => ({
      label: f.properties.name,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }))
    .filter((c: { label: string }) => {
      if (seen.has(c.label)) return false;
      seen.add(c.label);
      return true;
    });

  return NextResponse.json(cities);
}

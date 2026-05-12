'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import { Property } from './PropertyCard';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const goldIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:rgba(139,105,20,0.15);border:1.5px solid rgba(139,105,20,0.6);border-radius:50%;backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(139,105,20,0.3);"><div style="width:10px;height:10px;background:#8b6914;border-radius:50%;"></div></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const darkIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:rgba(26,20,16,0.1);border:1.5px solid rgba(26,20,16,0.4);border-radius:50%;backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;background:#1a1410;border-radius:50%;"></div></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const WORLD_RING: [number, number][] = [
  [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90],
];

const israelBounds = [[29.4, 33.8], [33.4, 35.9]] as L.LatLngBoundsExpression;

interface MapViewProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}

export default function MapView({ properties, onPropertyClick }: MapViewProps) {
  const [maskFeature, setMaskFeature] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/israel.geojson').then((r) => r.json()),
      fetch('/west-bank.geojson').then((r) => r.json()).catch(() => null),
    ]).then(([israelData, westBankData]) => {
      const holeRings: number[][][] = [];

      const addRings = (geom: any) => {
        if (!geom) return;
        if (geom.type === 'Polygon') {
          holeRings.push(geom.coordinates[0]);
        } else if (geom.type === 'MultiPolygon') {
          geom.coordinates.forEach((poly: number[][][]) => holeRings.push(poly[0]));
        }
      };

      addRings(israelData?.geometry);
      addRings(westBankData?.geometry);

      setMaskFeature({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [WORLD_RING, ...holeRings],
        },
      });
    });
  }, []);

  const mapped = properties.filter((p) => p.lat != null && p.lng != null);

  return (
    <MapContainer
      center={[31.4, 34.9]}
      zoom={7.8}
      minZoom={7}
      maxZoom={16}
      maxBounds={israelBounds}
      maxBoundsViscosity={1.0}
      style={{ height: '520px', width: '100%', borderRadius: '20px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CartoDB'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {maskFeature && (
        <GeoJSON
          key="mask"
          data={maskFeature}
          style={{ fillColor: '#1a1410', fillOpacity: 0.35, stroke: false, weight: 0 }}
        />
      )}

      {mapped.map((property) => (
        <Marker
          key={property.id}
          position={[property.lat!, property.lng!]}
          icon={property.status === 'available' ? goldIcon : darkIcon}
        >
          <Popup>
            <div style={{ fontFamily: 'Georgia, serif', minWidth: '160px', padding: '4px 2px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8a8078', margin: '0 0 6px' }}>
                {property.city}
              </p>
              <p style={{ fontSize: '15px', fontWeight: 300, color: '#1c1917', margin: '0 0 4px', lineHeight: 1.3 }}>
                {property.title_fr}
              </p>
              <p style={{ fontSize: '14px', color: '#8b6914', margin: '0 0 12px', fontWeight: 400 }}>
                {property.price.toLocaleString()} ₪
              </p>
              <button
                onClick={() => onPropertyClick(property)}
                style={{
                  width: '100%',
                  padding: '8px 0',
                  background: '#8b6914',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                }}
              >
                Voir le bien
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

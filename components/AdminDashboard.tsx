'use client';

import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type CityOption = {
  label: string;
  lat: number;
  lng: number;
};



type Property = {
  id: string;
  title_fr: string;
  title_en: string;
  title_he: string;
  type: string;
  price: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  address: string;
  lat: number;
  lng: number;
  description_fr: string;
  description_en: string;
  description_he: string;
  status: string;
  photos: string[];
  video_url: string;
};

const emptyForm = {
  title_fr: '',
  title_en: '',
  title_he: '',
  type: 'Villa',
  price: 0,
  surface: 0,
  rooms: 0,
  bedrooms: 0,
  bathrooms: 0,
  city: '',
  address: '',
  lat: 31.7683,
  lng: 35.2137,
  description_fr: '',
  description_en: '',
  description_he: '',
  status: 'available',
  video_url: '',
};

export default function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [citySuggestions, setCitySuggestions] = useState<CityOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    setProperties(data || []);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setForm({ ...form, city: query });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
        const cities: CityOption[] = await res.json();
        setCitySuggestions(cities);
        setShowSuggestions(cities.length > 0);
      } catch {
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  const handleCitySuggestionClick = (city: CityOption) => {
    setForm({ ...form, city: city.label, lat: city.lat, lng: city.lng });
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const uploadFile = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const url = await uploadFile(photo, 'photos');
        photoUrls.push(url);
      }

      // Upload vidéo
      let videoUrl = '';
      if (video) {
        videoUrl = await uploadFile(video, 'videos');
      }

      // Sauvegarder dans Supabase
      await supabase.from('properties').insert({
        ...form,
        price: Number(form.price),
        surface: Number(form.surface),
        rooms: Number(form.rooms),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        lat: Number(form.lat),
        lng: Number(form.lng),
        photos: photoUrls,
        video_url: videoUrl,
      });

      setForm(emptyForm);
      setPhotos([]);
      setVideo(null);
      setActiveTab('list');
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    await supabase
      .from('properties')
      .update({ status: newStatus })
      .eq('id', id);
    fetchProperties();
  };

  const deleteProperty = async (id: string) => {
    if (!confirm('Supprimer ce bien ?')) return;

    // Récupère les médias du bien
    const property = properties.find((p) => p.id === id);

    // Supprime les fichiers dans R2
    if (property?.photos) {
      for (const photo of property.photos) {
        await fetch('/api/delete-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: photo }),
        });
      }
    }
    if (property?.video_url) {
      await fetch('/api/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: property.video_url }),
      });
    }

    // Supprime de Supabase
    await supabase.from('properties').delete().eq('id', id);
    fetchProperties();
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-[9px] tracking-[3px] text-[#8b6914] uppercase mb-1">
            Administration
          </p>
          <h1 className="font-serif text-3xl font-light text-[#1a1410]">
            Studio Vision
          </h1>
        </div>
        <button
          onClick={() => signOut()}
          className="text-[10px] tracking-[2px] text-[#6b5d4a] uppercase border-b border-[#6b5d4a]/30 pb-1 hover:text-[#8b6914] transition-colors cursor-pointer bg-transparent"
        >
          Déconnexion
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('list')}
          className={`text-[10px] tracking-[2px] uppercase px-6 py-3 rounded-full transition-colors cursor-pointer ${
            activeTab === 'list'
              ? 'bg-[#1a1410] text-white'
              : 'bg-white/30 text-[#1a1410] hover:bg-white/50'
          }`}
        >
          Mes biens ({properties.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`text-[10px] tracking-[2px] uppercase px-6 py-3 rounded-full transition-colors cursor-pointer ${
            activeTab === 'add'
              ? 'bg-[#1a1410] text-white'
              : 'bg-white/30 text-[#1a1410] hover:bg-white/50'
          }`}
        >
          + Ajouter un bien
        </button>
      </div>

      {/* Liste des biens */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.length === 0 && (
            <p className="col-span-1 md:col-span-3 text-center font-serif text-xl text-[#6b5d4a] py-16">
              Aucun bien publié
            </p>
          )}
          {properties.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(16px)',
                border: '0.5px solid rgba(255,255,255,0.5)',
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[9px] tracking-[2px] text-[#8b6914] uppercase mb-1">
                    {p.type} · {p.city}
                  </p>
                  <h3 className="font-serif text-lg font-light text-[#1a1410]">
                    {p.title_fr}
                  </h3>
                </div>
                <span
                  className={`text-[8px] tracking-[2px] uppercase px-3 py-1 rounded-full ${
                    p.status === 'available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {p.status === 'available' ? 'Disponible' : 'Vendu'}
                </span>
              </div>

              <p className="font-serif text-xl text-[#1a1410] mb-4">
                ₪ {p.price?.toLocaleString()}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(p.id, p.status)}
                  className="flex-1 text-[9px] tracking-[1px] uppercase py-2 rounded-full bg-white/50 text-[#1a1410] hover:bg-[#8b6914] hover:text-white transition-colors cursor-pointer"
                >
                  {p.status === 'available'
                    ? 'Marquer vendu'
                    : 'Marquer disponible'}
                </button>
                <button
                  onClick={() => deleteProperty(p.id)}
                  className="text-[9px] tracking-[1px] uppercase px-4 py-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire ajout */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmit} className="flex justify-center">
          <div
            className="rounded-3xl p-10 max-w-4xl w-full"
            style={{
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(16px)',
              border: '0.5px solid rgba(255,255,255,0.5)',
            }}
          >
            <h2 className="font-serif text-2xl font-light text-[#1a1410] mb-8">
              Nouveau bien
            </h2>

            {/* Titres */}
            <div className="mb-6">
              <p className="text-[9px] tracking-[3px] text-[#8b6914] uppercase mb-4">
                Titres
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['fr', 'en', 'he'].map((lang) => (
                  <div key={lang} className="flex flex-col gap-2">
                    <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                      Titre ({lang.toUpperCase()})
                    </label>
                    <input
                      name={`title_${lang}`}
                      value={
                        form[`title_${lang}` as keyof typeof form] as string
                      }
                      onChange={handleChange}
                      required
                      className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Infos */}
            <div className="mb-6">
              <p className="text-[9px] tracking-[3px] text-[#8b6914] uppercase mb-4">
                Informations
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                    Type
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                  >
                    {[
                      'Villa',
                      'Appartement',
                      'Maison',
                      'Penthouse',
                      'Duplex',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                    Prix (₪)
                  </label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                    Surface (m²)
                  </label>
                  <input
                    name="surface"
                    type="number"
                    value={form.surface}
                    onChange={handleChange}
                    className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                    Pièces
                  </label>
                  <input
                    name="rooms"
                    type="number"
                    value={form.rooms}
                    onChange={handleChange}
                    className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                    Chambres
                  </label>
                  <input
                    name="bedrooms"
                    type="number"
                    value={form.bedrooms}
                    onChange={handleChange}
                    className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                    Salles de bain
                  </label>
                  <input
                    name="bathrooms"
                    type="number"
                    value={form.bathrooms}
                    onChange={handleChange}
                    className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                  />
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="mb-6">
              <p className="text-[9px] tracking-[3px] text-[#8b6914] uppercase mb-4">
                Localisation
              </p>
              <div className="relative flex flex-col gap-2">
                <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                  Ville
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleCityInput}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
                  required
                  placeholder="Rechercher une ville en Israël..."
                  className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                />
                {showSuggestions && citySuggestions.length > 0 && (
                  <ul
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: '12px',
                      border: '0.5px solid rgba(255,255,255,0.7)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    }}
                    className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden"
                  >
                    {citySuggestions.map((city) => (
                      <li
                        key={city.label}
                        onMouseDown={() => handleCitySuggestionClick(city)}
                        style={{ padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s' }}
                        className="text-sm text-[#1a1410] hover:bg-[#8b6914]/10 hover:text-[#8b6914]"
                      >
                        {city.label}
                      </li>
                    ))}
                  </ul>
                )}
                {form.lat !== emptyForm.lat && form.lng !== emptyForm.lng && (
                  <p className="text-[10px] text-[#8b6914]">
                    {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            {/* Descriptions */}
            <div className="mb-6">
              <p className="text-[9px] tracking-[3px] text-[#8b6914] uppercase mb-4">
                Descriptions
              </p>
              <div className="flex flex-col gap-4">
                {['fr', 'en', 'he'].map((lang) => (
                  <div key={lang} className="flex flex-col gap-2">
                    <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                      Description ({lang.toUpperCase()})
                    </label>
                    <textarea
                      name={`description_${lang}`}
                      value={
                        form[
                          `description_${lang}` as keyof typeof form
                        ] as string
                      }
                      onChange={handleChange}
                      rows={3}
                      className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914] resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Médias */}
            <div className="mb-8">
              <p className="text-[9px] tracking-[3px] text-[#8b6914] uppercase mb-4">
                Médias
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                    Photos
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setPhotos(Array.from(e.target.files || []))
                    }
                    className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none cursor-pointer"
                  />
                  {photos.length > 0 && (
                    <p className="text-[10px] text-[#8b6914]">
                      {photos.length} photo(s) sélectionnée(s)
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                    Vidéo
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideo(e.target.files?.[0] || null)}
                    className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none cursor-pointer"
                  />
                  {video && (
                    <p className="text-[10px] text-[#8b6914]">{video.name}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1410] text-white text-[11px] tracking-[3px] uppercase py-4 rounded-full hover:bg-[#8b6914] transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Publication en cours...' : 'Publier le bien'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

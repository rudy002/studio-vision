'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { SpinRing, SpinIris } from './loaders';
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
  packages: string[];
};

const PACKAGES = [
  'Photos',
  'Vidéo basique',
  'Vidéo avancé',
  'Admaya',
  'Construction',
  'Visite virtuelle',
] as const;

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
  packages: [] as string[],
};

const FORM_SECTIONS = ['Informations', 'Localisation', 'Descriptions', 'Médias'];

export default function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState<File[]>([]);
  const photoPreviews = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos]);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<CityOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [folderWarn, setFolderWarn] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => photoPreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [photoPreviews]);

  const fetchProperties = async () => {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    setProperties(data || []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProperties();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePackageToggle = (pkg: string) => {
    setForm((prev) => ({
      ...prev,
      packages: prev.packages.includes(pkg)
        ? prev.packages.filter((p) => p !== pkg)
        : [...prev.packages, pkg],
    }));
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
    const presignRes = await fetch('/api/upload/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type, folder }),
    });

    if (!presignRes.ok) {
      const err = await presignRes.text();
      throw new Error(`Erreur presign: ${err}`);
    }

    const { presignedUrl, publicUrl } = await presignRes.json();

    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error(`Erreur upload R2: ${uploadRes.status}`);
    }

    return publicUrl;
  };

  const startEdit = (p: Property) => {
    setEditingId(p.id);
    setForm({
      title_fr: p.title_fr,
      title_en: p.title_en,
      title_he: p.title_he,
      type: p.type,
      price: p.price,
      surface: p.surface,
      rooms: p.rooms,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      city: p.city,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      description_fr: p.description_fr,
      description_en: p.description_en,
      description_he: p.description_he,
      status: p.status,
      video_url: p.video_url || '',
      packages: p.packages || [],
    });
    setExistingPhotos(p.photos || []);
    setPhotos([]);
    setVideo(null);
    setOpenSection(0);
    setActiveTab('add');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExistingPhotos([]);
    setPhotos([]);
    setVideo(null);
    setFolderWarn(null);
    setMediaError(false);
  };

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    const videoFiles = files.filter((f) => f.type.startsWith('video/'));

    if (imageFiles.length > 0) {
      setPhotos((prev) => [...prev, ...imageFiles]);
      setMediaError(false);
    }
    if (videoFiles.length > 1) {
      setFolderWarn(
        `${videoFiles.length} vidéos trouvées dans le dossier. Seule la première a été ajoutée (${videoFiles[0].name}). Un bien ne peut contenir qu'une seule vidéo.`
      );
    } else {
      setFolderWarn(null);
    }
    if (videoFiles.length > 0) {
      setVideo(videoFiles[0]);
      setMediaError(false);
    }
  };

  const handlePublish = () => {
    const hasMedia =
      existingPhotos.length > 0 ||
      photos.length > 0 ||
      !!video ||
      !!form.video_url;
    if (!hasMedia) {
      setMediaError(true);
      setOpenSection(FORM_SECTIONS.length - 1);
      return;
    }
    setMediaError(false);
    setShowConfirmModal(true);
  };

  const removeExistingPhoto = (url: string) => {
    setExistingPhotos((prev) => prev.filter((u) => u !== url));
  };

  const removeNewPhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  const performSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const photoUrls: string[] = [...existingPhotos];
      for (const photo of photos) {
        const url = await uploadFile(photo, 'photos');
        photoUrls.push(url);
      }

      let videoUrl = form.video_url;
      if (video) {
        videoUrl = await uploadFile(video, 'videos');
      }

      const payload = {
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
      };

      if (editingId) {
        await supabase.from('properties').update(payload).eq('id', editingId);
      } else {
        await supabase.from('properties').insert(payload);
      }

      setForm(emptyForm);
      setPhotos([]);
      setVideo(null);
      setEditingId(null);
      setExistingPhotos([]);
      setFolderWarn(null);
      setMediaError(false);
      setLoading(false);
      setSubmitDone(true);
      fetchProperties();
      setTimeout(() => {
        setSubmitDone(false);
        setActiveTab('list');
      }, 1200);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    await supabase.from('properties').update({ status: newStatus }).eq('id', id);
    fetchProperties();
  };

  const deleteProperty = async (id: string) => {
    if (!confirm('Supprimer ce bien ?')) return;
    const property = properties.find((p) => p.id === id);
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
    await supabase.from('properties').delete().eq('id', id);
    fetchProperties();
  };

  const available = properties.filter((p) => p.status === 'available').length;
  const sold = properties.filter((p) => p.status === 'sold').length;
  const avgPrice =
    properties.length > 0
      ? Math.round(properties.reduce((acc, p) => acc + (p.price || 0), 0) / properties.length)
      : 0;

  const toggleSection = (i: number) => setOpenSection(openSection === i ? null : i);

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-[9px] tracking-[3px] text-[#8b6914] uppercase mb-1">Administration</p>
          <h1 className="font-serif text-3xl font-light text-[#1a1410]">Studio Vision</h1>
        </div>
        <button
          onClick={() => signOut()}
          className="text-[10px] tracking-[2px] text-[#6b5d4a] uppercase border-b border-[#6b5d4a]/30 pb-1 hover:text-[#8b6914] transition-colors cursor-pointer bg-transparent"
        >
          Déconnexion
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: properties.length, unit: 'biens' },
          { label: 'Disponibles', value: available, unit: 'biens' },
          { label: 'Vendus', value: sold, unit: 'biens' },
          { label: 'Prix moyen', value: `₪ ${avgPrice.toLocaleString()}`, unit: '' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(16px)',
              border: '0.5px solid rgba(255,255,255,0.5)',
            }}
          >
            <p className="text-[9px] tracking-[2px] text-[#8b6914] uppercase mb-2">{stat.label}</p>
            <p className="font-serif text-2xl font-light text-[#1a1410]">{stat.value}</p>
            {stat.unit && (
              <p className="text-[9px] tracking-[1px] text-[#6b5d4a] uppercase mt-1">{stat.unit}</p>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => { setActiveTab('list'); cancelEdit(); }}
          className={`text-[10px] tracking-[2px] uppercase px-6 py-3 rounded-full transition-colors cursor-pointer ${
            activeTab === 'list'
              ? 'bg-[#1a1410] text-white'
              : 'bg-white/30 text-[#1a1410] hover:bg-white/50'
          }`}
        >
          Mes biens ({properties.length})
        </button>
        <button
          onClick={() => { cancelEdit(); setOpenSection(0); setActiveTab('add'); }}
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
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(16px)',
                border: '0.5px solid rgba(255,255,255,0.5)',
              }}
            >
              {/* Media preview */}
              {p.photos?.[0] ? (
                <div className="relative w-full h-44">
                  <Image
                    src={p.photos[0]}
                    alt={`${p.type} ${p.city}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {p.photos.length > 1 && (
                    <span
                      className="absolute bottom-2 right-2 text-[9px] tracking-[1px] uppercase text-white px-2 py-1 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                    >
                      +{p.photos.length - 1} photos
                    </span>
                  )}
                </div>
              ) : p.video_url ? (
                <div className="relative w-full h-44 bg-black">
                  <video
                    src={p.video_url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                  />
                  <span
                    className="absolute bottom-2 right-2 text-[9px] tracking-[1px] uppercase text-white px-2 py-1 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                  >
                    vidéo
                  </span>
                </div>
              ) : null}

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[9px] tracking-[2px] text-[#8b6914] uppercase mb-1">
                      {p.type} · {p.city}
                    </p>
                    <h3 className="font-serif text-lg font-light text-[#1a1410]">
                      {[p.rooms > 0 && `${p.rooms} pièces`, p.surface > 0 && `${p.surface} m²`].filter(Boolean).join(' · ') || '—'}
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
                    onClick={() => startEdit(p)}
                    className="flex-1 text-[9px] tracking-[1px] uppercase py-2 rounded-full bg-[#8b6914]/10 text-[#8b6914] hover:bg-[#8b6914] hover:text-white transition-colors cursor-pointer"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => toggleStatus(p.id, p.status)}
                    className="flex-1 text-[9px] tracking-[1px] uppercase py-2 rounded-full bg-white/50 text-[#1a1410] hover:bg-[#8b6914] hover:text-white transition-colors cursor-pointer"
                  >
                    {p.status === 'available' ? 'Marquer vendu' : 'Marquer disponible'}
                  </button>
                  <button
                    onClick={() => deleteProperty(p.id)}
                    className="text-[9px] tracking-[1px] uppercase px-4 py-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmation publication */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,20,16,0.55)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="rounded-3xl p-10 max-w-sm w-full text-center"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              border: '0.5px solid rgba(255,255,255,0.7)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            }}
          >
            <p className="text-[9px] tracking-[3px] text-[#8b6914] uppercase mb-3">Confirmation</p>
            <h3 className="font-serif text-xl font-light text-[#1a1410] mb-3">
              {editingId ? 'Enregistrer les modifications ?' : 'Publier ce bien ?'}
            </h3>
            <p className="text-sm text-[#6b5d4a] font-light mb-8">
              {editingId
                ? 'Les modifications seront visibles immédiatement sur le site.'
                : 'Ce bien sera visible immédiatement sur le site.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-[10px] tracking-[2px] uppercase px-6 py-3 rounded-full bg-white border border-[#1a1410]/20 text-[#6b5d4a] hover:bg-[#f5f0ea] transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={performSubmit}
                className="text-[10px] tracking-[2px] uppercase px-8 py-3 rounded-full bg-[#1a1410] text-white hover:bg-[#8b6914] transition-colors cursor-pointer"
              >
                {editingId ? 'Enregistrer' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire ajout / édition */}
      {activeTab === 'add' && (
        <form onSubmit={(e) => e.preventDefault()} onKeyDown={handleFormKeyDown} className="flex justify-center">
          <div
            className="rounded-3xl p-10 max-w-4xl w-full"
            style={{
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(16px)',
              border: '0.5px solid rgba(255,255,255,0.5)',
            }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-2xl font-light text-[#1a1410]">
                {editingId ? 'Modifier le bien' : 'Nouveau bien'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { cancelEdit(); setActiveTab('list'); }}
                  className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase border-b border-[#6b5d4a]/30 pb-1 hover:text-[#8b6914] transition-colors cursor-pointer bg-transparent"
                >
                  Annuler
                </button>
              )}
            </div>

            {/* Step indicator */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
              {FORM_SECTIONS.map((section, i) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => toggleSection(i)}
                  className={`shrink-0 text-[9px] tracking-[2px] uppercase px-4 py-2 rounded-full transition-colors cursor-pointer ${
                    openSection === i
                      ? 'bg-[#1a1410] text-white'
                      : 'bg-white/40 text-[#6b5d4a] hover:bg-white/60'
                  }`}
                >
                  {i + 1}. {section}
                </button>
              ))}
            </div>

            {/* Section 0: Informations */}
            {openSection === 0 && (
              <div className="mb-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">Type</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                    >
                      {['Villa', 'Appartement', 'Maison', 'Penthouse', 'Duplex'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">Prix (₪)</label>
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">Surface (m²)</label>
                    <input
                      name="surface"
                      type="number"
                      value={form.surface}
                      onChange={handleChange}
                      className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">Pièces</label>
                    <input
                      name="rooms"
                      type="number"
                      value={form.rooms}
                      onChange={handleChange}
                      className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">Statut</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914]"
                    >
                      <option value="available">Disponible</option>
                      <option value="sold">Vendu</option>
                    </select>
                  </div>
                </div>

                {/* Packages */}
                <div className="mt-6 flex flex-col gap-3">
                  <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">Packages</label>
                  <div className="flex flex-wrap gap-2">
                    {PACKAGES.map((pkg) => {
                      const active = form.packages.includes(pkg);
                      return (
                        <button
                          key={pkg}
                          type="button"
                          onClick={() => handlePackageToggle(pkg)}
                          className={`text-[10px] tracking-[1.5px] uppercase px-4 py-2 rounded-full border transition-all duration-150 cursor-pointer ${
                            active
                              ? 'bg-[#1a1410] text-white border-[#1a1410]'
                              : 'bg-white/40 text-[#6b5d4a] border-white/60 hover:bg-white/60'
                          }`}
                        >
                          {pkg}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Section 1: Localisation */}
            {openSection === 1 && (
              <div className="mb-2">
                <div className="relative flex flex-col gap-2">
                  <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">Ville</label>
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
            )}

            {/* Section 2: Descriptions */}
            {openSection === 2 && (
              <div className="mb-2">
                <div className="flex flex-col gap-4">
                  {['fr', 'en', 'he'].map((lang) => (
                    <div key={lang} className="flex flex-col gap-2">
                      <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                        Description ({lang.toUpperCase()})
                      </label>
                      <textarea
                        name={`description_${lang}`}
                        value={form[`description_${lang}` as keyof typeof form] as string}
                        onChange={handleChange}
                        rows={4}
                        className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914] resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Médias */}
            {openSection === 3 && (
              <div className="mb-2">
                <div className="flex flex-col gap-6">
                  {/* Photos existantes en mode édition */}
                  {editingId && existingPhotos.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                        Photos actuelles ({existingPhotos.length})
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {existingPhotos.map((url, i) => (
                          <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                            <Image
                              src={url}
                              alt={`Photo du bien ${i + 1}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingPhoto(url)}
                              className="absolute inset-0 bg-red-500/70 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Erreur média manquant */}
                  {mediaError && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                      <p className="text-[11px] text-red-600 font-medium">
                        Au moins une photo ou une vidéo est obligatoire pour publier un bien.
                      </p>
                    </div>
                  )}

                  {/* Avertissement multi-vidéos */}
                  {folderWarn && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-[11px] text-amber-700">⚠ {folderWarn}</p>
                    </div>
                  )}

                  {/* Upload de dossier */}
                  <div className="flex flex-col gap-2 mb-4">
                    <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                      Importer un dossier (photos + vidéo)
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFolderUpload}
                      {...({ webkitdirectory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
                      className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none cursor-pointer"
                    />
                    <p className="text-[9px] text-[#9b8c7b]">
                      Sélectionnez un dossier — les images et la première vidéo seront importées automatiquement.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                        {editingId ? 'Ajouter des photos' : 'Photos'}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          setPhotos((prev) => [...prev, ...Array.from(e.target.files || [])]);
                          setMediaError(false);
                        }}
                        className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none cursor-pointer"
                      />
                      {photos.length > 0 && !loading && (
                        <p className="text-[10px] text-[#8b6914]">{photos.length} photo(s) sélectionnée(s)</p>
                      )}
                      {loading && photos.length > 0 && (
                        <span className="flex items-center gap-2">
                          <SpinIris size="sm" />
                          <span className="text-[10px] text-[#8b6914]">Upload en cours…</span>
                        </span>
                      )}
                      {photoPreviews.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-2">
                          {photoPreviews.map((src, i) => (
                            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                              <Image
                                src={src}
                                alt={`Aperçu photo ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                                unoptimized
                              />
                              <button
                                type="button"
                                onClick={() => removeNewPhoto(i)}
                                className="absolute inset-0 bg-red-500/70 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
                        {editingId ? 'Remplacer la vidéo' : 'Vidéo'}
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          setVideo(e.target.files?.[0] || null);
                          setMediaError(false);
                        }}
                        className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none cursor-pointer"
                      />
                      {video && <p className="text-[10px] text-[#8b6914]">{video.name}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nav entre sections + submit */}
            <div className="flex justify-between items-center mt-10">
              <button
                type="button"
                onClick={() => setOpenSection((s) => Math.max(0, (s ?? 0) - 1))}
                disabled={openSection === 0}
                className="text-[10px] tracking-[2px] uppercase px-6 py-3 rounded-full bg-white/40 text-[#6b5d4a] hover:bg-white/60 transition-colors cursor-pointer disabled:opacity-30"
              >
                ← Précédent
              </button>

              {openSection === FORM_SECTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading || submitDone}
                  className={[
                    'text-[11px] tracking-[3px] uppercase px-10 py-4 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-2',
                    loading || submitDone
                      ? 'bg-transparent border border-[rgba(176,141,87,0.55)] text-[#b08d57]'
                      : 'bg-[#1a1410] text-white hover:bg-[#8b6914] disabled:opacity-50',
                  ].join(' ')}
                >
                  {loading ? (
                    <>
                      <SpinRing size="sm" light />
                      Publication en cours…
                    </>
                  ) : submitDone ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12l5 5L20 7" stroke="#b08d57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Confirmé
                    </>
                  ) : editingId ? (
                    'Enregistrer les modifications'
                  ) : (
                    'Publier le bien'
                  )}
                </button>
              ) : (
                <div className="flex gap-3">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={loading || submitDone}
                      className={[
                        'text-[11px] tracking-[3px] uppercase px-8 py-4 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-2',
                        loading || submitDone
                          ? 'border border-[rgba(176,141,87,0.55)] text-[#b08d57]'
                          : 'border border-[#1a1410] text-[#1a1410] hover:bg-[#1a1410] hover:text-white disabled:opacity-50',
                      ].join(' ')}
                    >
                      {loading ? <SpinRing size="sm" light /> : submitDone ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 12l5 5L20 7" stroke="#b08d57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                      {loading ? 'En cours…' : submitDone ? 'Confirmé' : 'Terminer'}
                    </button>
                  )}
                <button
                  type="button"
                  onClick={() => setOpenSection((s) => Math.min(FORM_SECTIONS.length - 1, (s ?? 0) + 1))}
                  className="bg-[#1a1410] text-white text-[11px] tracking-[3px] uppercase px-10 py-4 rounded-full hover:bg-[#8b6914] transition-colors cursor-pointer"
                >
                  Suivant →
                </button>
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

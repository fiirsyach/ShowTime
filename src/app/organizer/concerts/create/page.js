// src/app/organizer/concerts/create/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaCheckCircle,
  FaBuilding,
  FaMusic,
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaUsers,
  FaStar,
  FaBolt,
  FaYoutube,
  FaInfoCircle,
  FaTrash,
  FaPlus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Venue Types Configuration
const VENUE_TYPES = {
  stadium: {
    id: 'stadium',
    name: 'Stadium',
    icon: '🏟️',
    description: 'Melingkar/oval seperti stadion, tribun mengelilingi area panggung/lapangan',
    features: ['Tribun melingkar', 'Stage di salah satu sisi', 'Kapasitas besar', 'Akustik outdoor'],
    layout: 'stadium',
    colors: 'from-green-500/20 to-green-600/20 border-green-500/30'
  },
  hall: {
    id: 'hall',
    name: 'Concert Hall',
    icon: '🏛️',
    description: 'Persegi/persegi panjang seperti gedung konser indoor, kursi tersusun dalam barisan rapi menghadap panggung',
    features: ['Layout teratur', 'Stage di depan', 'Akustik terbaik', 'Kapasitas sedang-besar'],
    layout: 'hall',
    colors: 'from-blue-500/20 to-blue-600/20 border-blue-500/30'
  },
  outdoor: {
    id: 'outdoor',
    name: 'Outdoor Festival',
    icon: '🌳',
    description: 'Area terbuka fleksibel dengan kombinasi standing dan seating area, cocok untuk festival',
    features: ['Area terbuka', 'Standing & Seating', 'Fleksibel', 'Kapasitas besar'],
    layout: 'outdoor',
    colors: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30'
  },
  arena: {
    id: 'arena',
    name: 'Arena',
    icon: '🎪',
    description: 'Oval/bulat seperti arena indoor, seating area mengelilingi central stage atau stage di salah satu sisi',
    features: ['Seating mengelilingi', 'Stage tengah/samping', 'Intim', 'Kapasitas sedang'],
    layout: 'arena',
    colors: 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
  }
};

export default function CreateConcertPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Venue Type
    venueType: '',
    
    // Step 2: Venue Details
    venueName: '',
    city: '',
    address: '',
    capacity: '',
    
    // Step 3: Concert Details
    name: '',
    description: '',
    date: '',
    time: '',
    startSale: '',
    endSale: '',
    genre: '',
    minPrice: '',
    maxPrice: '',
    totalTickets: '',
    rules: '',
    youtubeTrailer: '',
    isFeatured: false,
    isFlashSale: false,
    flashSalePrice: '',
    flashSaleEnd: '',
    
    // Section Configuration
    sections: []
  });
  
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedVenueType, setSelectedVenueType] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return;
    }
  }, [user, loading, router]);

  // Handle venue type selection
  const handleVenueTypeSelect = (typeId) => {
    const venueType = VENUE_TYPES[typeId];
    setSelectedVenueType(venueType);
    setFormData((previous) => ({ ...previous, venueType: typeId, sections: [] }));
    setCurrentStep(2);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle section changes
  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setFormData({ ...formData, sections: updatedSections });
  };

  // Add new section
  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      name: `Section ${String.fromCharCode(65 + formData.sections.length)}`,
      category: 'regular',
      type: 'seated',
      rows: '',
      seatsPerRow: '',
      capacity: '',
      price: ''
    };
    setFormData({
      ...formData,
      sections: [...formData.sections, newSection]
    });
  };

  // Remove section
  const removeSection = (index) => {
    const updatedSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: updatedSections });
  };

  // ==================== SUBMIT CONCERT ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      // Validasi dasar
      if (!formData.name || formData.name.trim() === '') {
        toast.error('Nama konser wajib diisi');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.date) {
        toast.error('Tanggal konser wajib diisi');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.time) {
        toast.error('Waktu konser wajib diisi');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.venueType) {
        toast.error('Venue type wajib dipilih');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.venueName || formData.venueName.trim() === '') {
        toast.error('Nama venue wajib diisi');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.city || formData.city.trim() === '') {
        toast.error('Kota venue wajib diisi');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.address || formData.address.trim() === '') {
        toast.error('Alamat venue wajib diisi');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.sections.length) {
        toast.error('Tambahkan minimal satu section tiket');
        setLoadingSubmit(false);
        return;
      }

      // Calculate total tickets from sections
      let totalTickets = 0;
      formData.sections.forEach(section => {
        if (!section.name.trim() || !Number.isFinite(Number(section.price)) || Number(section.price) < 0) {
          throw new Error('Nama, kategori, dan harga section harus valid');
        }
        if (section.type === 'standing') {
          const capacity = Number(section.capacity);
          if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Kapasitas standing harus lebih dari 0');
          totalTickets += capacity;
        } else {
          const rows = Number(section.rows);
          const seatsPerRow = Number(section.seatsPerRow);
          if (!Number.isInteger(rows) || rows < 1 || !Number.isInteger(seatsPerRow) || seatsPerRow < 1) {
            throw new Error('Rows dan seats per row harus lebih dari 0');
          }
          totalTickets += rows * seatsPerRow;
        }
      });
      if (!totalTickets) throw new Error('Kapasitas tiket harus lebih dari 0');

      // Prepare payload
      const payload = {
        name: formData.name.trim(),
        description: formData.description || '',
        date: formData.date,
        time: formData.time,
        startSale: formData.startSale || null,
        endSale: formData.endSale || null,
        venueType: formData.venueType,
        venueName: formData.venueName.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        capacity: totalTickets,
        totalTickets,
        minPrice: Math.min(...formData.sections.map((section) => Number(section.price))),
        maxPrice: Math.max(...formData.sections.map((section) => Number(section.price))),
        genre: formData.genre || '',
        rules: formData.rules || '',
        youtubeTrailer: formData.youtubeTrailer || '',
        isFeatured: formData.isFeatured || false,
        isFlashSale: formData.isFlashSale || false,
        flashSalePrice: formData.flashSalePrice ? parseFloat(formData.flashSalePrice) : null,
        flashSaleEnd: formData.flashSaleEnd || null,
        sections: formData.sections,
        status: 'published'
      };

      console.log('📤 Creating concert with payload:', JSON.stringify(payload, null, 2));

      const response = await api.post('/organizer/concerts', payload);
      
      if (response.data.success) {
        toast.success('🎉 Konser berhasil dibuat!');
        
        // ==================== REDIRECT KE MANAGE CONCERTS ====================
        router.push('/organizer/dashboard');
      }
    } catch (error) {
      console.error('❌ Error creating concert:', error);
      
      if (error.response) {
        console.error('📝 Response data:', error.response.data);
        console.error('📝 Status code:', error.response.status);
        toast.error(error.response.data?.message || 'Gagal membuat konser');
      } else if (error.request) {
        toast.error('Tidak ada response dari server');
      } else {
        toast.error(error.message || 'Gagal membuat konser');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <FaSpinner className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Step indicator
  const steps = [
    { number: 1, label: 'Venue Type' },
    { number: 2, label: 'Venue Details' },
    { number: 3, label: 'Concert Info' }
  ];

  return (
    <div className="min-h-screen bg-dark py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-white/60 hover:text-white transition-colors"
            >
              <FaArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Create New Concert</h1>
              <p className="text-white/60">Set up your concert with venue type selection</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between mb-8 relative">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step.number 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                    : 'bg-white/10 text-white/40'
                }`}>
                  {currentStep > step.number ? <FaCheckCircle className="w-5 h-5" /> : step.number}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  currentStep >= step.number ? 'text-white' : 'text-white/40'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content - Sama seperti sebelumnya */}
        {/* ... (kode step content tetap sama) ... */}
        
        {/* Step 1: Select Venue Type */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Select Venue Type</h2>
            <p className="text-white/60 mb-6">
              Pilih tipe venue untuk menentukan layout seat map konser Anda
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(VENUE_TYPES).map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleVenueTypeSelect(type.id)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.venueType === type.id
                      ? `border-primary bg-primary/10 ${type.colors}`
                      : 'border-white/10 hover:border-white/30 bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{type.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{type.name}</h3>
                      <p className="text-sm text-white/60 mt-1">{type.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {type.features.map((feature, i) => (
                          <span key={i} className="px-2 py-1 glass rounded-full text-xs text-white/60">
                            {feature}
                          </span>
                        ))}
                      </div>
                      {formData.venueType === type.id && (
                        <div className="mt-3 text-primary text-sm flex items-center gap-2">
                          <FaCheckCircle className="w-4 h-4" />
                          Selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  if (!formData.venueType) {
                    toast.error('Pilih tipe venue terlebih dahulu');
                    return;
                  }
                  setCurrentStep(2);
                }}
                className="btn-primary"
              >
                Next: Venue Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Venue Details */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{selectedVenueType?.icon}</span>
              <h2 className="text-2xl font-bold">Venue Details</h2>
            </div>
            <p className="text-white/60 mb-6">
              Masukkan detail venue untuk konser Anda - {selectedVenueType?.name}
            </p>

            <div className="space-y-4">
              {/* Venue Name */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Venue Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="venueName"
                  value={formData.venueName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g. Jakarta International Stadium"
                  required
                />
              </div>

              {/* City & Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g. Jakarta"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Total capacity"
                    min="0"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="2"
                  placeholder="Full address"
                  required
                />
              </div>

              {/* Venue Type Preview */}
              <div className={`p-4 rounded-xl border ${selectedVenueType?.colors} bg-gradient-to-br ${selectedVenueType?.colors}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedVenueType?.icon}</span>
                  <div>
                    <p className="font-semibold">{selectedVenueType?.name}</p>
                    <p className="text-sm text-white/60">{selectedVenueType?.description}</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-dark/50 rounded-lg">
                  <p className="text-sm text-primary">
                    ✅ Seat layout akan otomatis mengikuti tipe venue: 
                    <span className="font-medium text-white">
                      {selectedVenueType?.name}
                    </span>
                  </p>
                </div>
              </div>

              {/* Section Configuration */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Ticket Sections</h3>
                  <button
                    type="button"
                    onClick={addSection}
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    <FaPlus className="w-3 h-3" /> Add Section
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {formData.sections.map((section, index) => (
                    <div key={index} className="glass p-4 rounded-xl">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Section Name</label>
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                            className="input-field py-1 text-sm"
                            placeholder="Section A"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Category</label>
                          <select
                            value={section.category}
                            onChange={(e) => handleSectionChange(index, 'category', e.target.value)}
                            className="input-field py-1 text-sm"
                          >
                            <option value="vvip">VVIP</option>
                            <option value="vip">VIP</option>
                            <option value="regular">Regular</option>
                            <option value="platinum">Platinum</option>
                            <option value="diamond">Diamond</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Layout</label>
                          <select value={section.type} onChange={(e) => handleSectionChange(index, 'type', e.target.value)} className="input-field py-1 text-sm">
                            <option value="seated">Seated</option>
                            <option value="standing">Standing</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Price</label>
                          <input
                            type="number"
                            value={section.price}
                            onChange={(e) => handleSectionChange(index, 'price', e.target.value)}
                            className="input-field py-1 text-sm"
                            placeholder="150000"
                            min="0"
                          />
                        </div>
                        <div className="flex items-end justify-end gap-2">
                          {section.type === 'standing' ? (
                            <div className="flex-1">
                              <label className="block text-xs text-white/60 mb-1">Capacity</label>
                              <input
                                type="number"
                                value={section.capacity}
                                onChange={(e) => handleSectionChange(index, 'capacity', e.target.value)}
                                className="input-field py-1 text-sm"
                                placeholder="200"
                                min="0"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <label className="block text-xs text-white/60 mb-1">Rows</label>
                                <input
                                  type="number"
                                  value={section.rows}
                                  onChange={(e) => handleSectionChange(index, 'rows', e.target.value)}
                                  className="input-field py-1 text-sm"
                                  placeholder="5"
                                  min="1"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs text-white/60 mb-1">Seats/Row</label>
                                <input
                                  type="number"
                                  value={section.seatsPerRow}
                                  onChange={(e) => handleSectionChange(index, 'seatsPerRow', e.target.value)}
                                  className="input-field py-1 text-sm"
                                  placeholder="10"
                                  min="1"
                                />
                              </div>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => removeSection(index)}
                            className="text-red-400 hover:text-red-300 transition-colors p-2"
                            title="Remove section"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={goBack} className="glass px-6 py-2 rounded-lg hover:bg-white/10 transition-colors">
                ← Back
              </button>
              <button
                onClick={() => {
                  if (!formData.venueName || formData.venueName.trim() === '') {
                    toast.error('Nama venue wajib diisi');
                    return;
                  }
                  if (!formData.city || formData.city.trim() === '') {
                    toast.error('Kota venue wajib diisi');
                    return;
                  }
                  if (!formData.address || formData.address.trim() === '') {
                    toast.error('Alamat venue wajib diisi');
                    return;
                  }
                  setCurrentStep(3);
                }}
                className="btn-primary"
              >
                Next: Concert Info →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Concert Info */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Concert Information</h2>
            <p className="text-white/60 mb-6">
              Masukkan detail konser Anda
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Concert Name */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Concert Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g. Summer Music Festival 2025"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Describe your concert"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 p-4">
                <h3 className="mb-1 font-semibold">Ticket sales period</h3>
                <p className="mb-4 text-xs text-white/50">Kosongkan tanggal untuk membuka penjualan tanpa batas waktu. Customer hanya dapat membuat pesanan selama periode ini.</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="text-sm text-white/70">
                    Mulai penjualan
                    <input
                      type="datetime-local"
                      name="startSale"
                      value={formData.startSale}
                      onChange={handleInputChange}
                      className="input-field mt-2"
                    />
                  </label>
                  <label className="text-sm text-white/70">
                    Akhir penjualan
                    <input
                      type="datetime-local"
                      name="endSale"
                      value={formData.endSale}
                      onChange={handleInputChange}
                      className="input-field mt-2"
                      min={formData.startSale || undefined}
                    />
                  </label>
                </div>
              </div>

              {/* Genre & Total Tickets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g. Pop, Rock, Jazz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Total Tickets</label>
                  <input
                    type="number"
                    name="totalTickets"
                    value={formData.totalTickets}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Total tickets"
                    min="0"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Min Price</label>
                  <input
                    type="number"
                    name="minPrice"
                    value={formData.minPrice}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="150000"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Max Price</label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={formData.maxPrice}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="750000"
                    min="0"
                  />
                </div>
              </div>

              {/* Rules */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Rules</label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="2"
                  placeholder="Concert rules and regulations"
                />
              </div>

              {/* YouTube Trailer */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">YouTube Trailer</label>
                <input
                  type="url"
                  name="youtubeTrailer"
                  value={formData.youtubeTrailer}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {/* Featured & Flash Sale */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="rounded border-white/20 bg-dark/50"
                  />
                  <FaStar className="text-yellow-400" />
                  Featured Concert
                </label>
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    name="isFlashSale"
                    checked={formData.isFlashSale}
                    onChange={handleInputChange}
                    className="rounded border-white/20 bg-dark/50"
                  />
                  <FaBolt className="text-secondary" />
                  Flash Sale
                </label>
              </div>

              {/* Flash Sale Details */}
              {formData.isFlashSale && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-secondary/20 rounded-xl p-4 bg-secondary/5">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Flash Sale Price</label>
                    <input
                      type="number"
                      name="flashSalePrice"
                      value={formData.flashSalePrice}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Discounted price"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Flash Sale End</label>
                    <input
                      type="datetime-local"
                      name="flashSaleEnd"
                      value={formData.flashSaleEnd}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="glass p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="font-semibold mb-2">📋 Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-white/60">Venue Type:</span>
                    <span className="ml-2 font-medium">{selectedVenueType?.name}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Venue:</span>
                    <span className="ml-2 font-medium">{formData.venueName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Sections:</span>
                    <span className="ml-2 font-medium">{formData.sections.length}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Total Tickets:</span>
                    <span className="ml-2 font-medium">
                      {formData.sections.reduce((total, s) => {
                        if (s.type === 'standing') return total + (parseInt(s.capacity) || 0);
                        return total + (parseInt(s.rows) || 0) * (parseInt(s.seatsPerRow) || 0);
                      }, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button type="button" onClick={goBack} className="glass px-6 py-2 rounded-lg hover:bg-white/10 transition-colors">
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loadingSubmit}
                  className="btn-primary"
                >
                  {loadingSubmit ? (
                    <span className="flex items-center gap-2">
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Concert'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
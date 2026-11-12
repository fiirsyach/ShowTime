'use client';

import { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaBuilding, 
  FaMapPin, 
  FaGlobe, 
  FaInstagram, 
  FaYoutube,
  FaEye,
  FaEyeSlash,
  FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function RegisterOrganizerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    description: '',
    website: '',
    instagram: '',
    youtube: '',
    city: '',
    address: '',
    bankName: '',
    bankAccount: '',
    bankHolder: '',
    role: 'organizer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error untuk field ini
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Nama lengkap wajib diisi';
    if (!formData.email) newErrors.email = 'Email wajib diisi';
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (!formData.companyName) newErrors.companyName = 'Nama perusahaan wajib diisi';
    if (!formData.city) newErrors.city = 'Kota wajib diisi';
    if (!formData.address) newErrors.address = 'Alamat wajib diisi';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Form data sebelum submit:', formData);
    
    if (!validateForm()) {
      toast.error('Mohon isi semua field yang wajib (*)');
      return;
    }
    
    setLoading(true);
    
    try {
      // Kirim data ke AuthContext
      const result = await register(formData);
      console.log('📝 Hasil register:', result);
      
      if (!result.success) {
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error submit:', error);
      toast.error('Terjadi kesalahan saat registrasi');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-dark p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass p-8 rounded-2xl w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">ShowTime</h1>
          <p className="text-white/60 mt-2">Daftar sebagai Organizer</p>
          <p className="text-sm text-yellow-400 mt-2">⚠️ Semua field dengan tanda * wajib diisi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Info */}
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold mb-4 text-primary">Informasi Pribadi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field pl-12 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Nama lengkap"
                    required
                  />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field pl-12 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  No. Telepon <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="08123456789"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold mb-4 text-secondary">Informasi Perusahaan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nama Perusahaan <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`input-field pl-12 ${errors.companyName ? 'border-red-500' : ''}`}
                    placeholder="Nama perusahaan"
                    required
                  />
                </div>
                {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">Deskripsi Perusahaan</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder="Ceritakan tentang perusahaan Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Kota <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`input-field pl-12 ${errors.city ? 'border-red-500' : ''}`}
                    placeholder="Kota"
                    required
                  />
                </div>
                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Alamat <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                  placeholder="Alamat lengkap"
                  required
                />
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold mb-4 text-purple-400">Media Sosial</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Website</label>
                <div className="relative">
                  <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Instagram</label>
                <div className="relative">
                  <FaInstagram className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="@username"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">YouTube</label>
                <div className="relative">
                  <FaYoutube className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="Channel URL"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Info */}
          <div className="pb-4">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Informasi Bank</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Nama Bank</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g. BCA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Nomor Rekening</label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  name="bankHolder"
                  value={formData.bankHolder}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="PT ShowTime"
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <p className="text-yellow-400 text-sm flex items-center gap-2">
              <FaCheckCircle className="w-4 h-4" />
              Setelah mendaftar, akun Anda akan menunggu verifikasi dari admin.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center text-lg mt-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mendaftar...
              </span>
            ) : (
              'Daftar sebagai Organizer'
            )}
          </motion.button>
        </form>

        <p className="text-center text-white/60 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
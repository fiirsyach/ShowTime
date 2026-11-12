'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const defaults = { language: 'id', currency: 'IDR', usdExchangeRate: 16000 };
const translations = {
  id: {
    'Search concerts and venues...': 'Cari konser dan venue...',
    Search: 'Cari',
    Dashboard: 'Dasbor',
    'My Tickets': 'Tiket Saya',
    Wishlist: 'Favorit',
    'Order History': 'Riwayat Pesanan',
    Profile: 'Profil',
    Logout: 'Keluar',
    Login: 'Masuk',
    Register: 'Daftar',
    Concert: 'Konser',
    Festival: 'Festival',
    Promo: 'Promo',
    'Starting from': 'Mulai dari',
    sold: 'terjual',
    'left': 'tersisa',
    'Sold Out': 'Habis',
    'Trending Concerts': 'Konser Populer',
    'Most popular concerts right now': 'Konser paling populer saat ini',
    'Upcoming Concerts': 'Konser Mendatang',
    "Don't miss these amazing events": 'Jangan lewatkan acara menarik ini',
    'Music Festival': 'Festival Musik',
    'Experience the best festivals': 'Nikmati festival terbaik',
    'Flash Sale': 'Promo Kilat',
    'Limited time offers': 'Penawaran terbatas',
    'Checkout': 'Pembayaran',
    'Ticket Payment': 'Pembayaran Tiket',
    'Order Summary': 'Ringkasan Pesanan',
    'My Profile': 'Profil Saya',
    'Manage your account information': 'Kelola informasi akun Anda',
    'Forgot password?': 'Lupa password?',
    Settings: 'Pengaturan',
    'Settings are managed by the site administrator.': 'Pengaturan website dikelola oleh administrator.',
    'Total Spent': 'Total Pengeluaran',
    Upcoming: 'Mendatang',
    'Featured Concerts': 'Konser Unggulan',
    'Your Tickets': 'Tiket Anda',
    'Recent Orders': 'Pesanan Terbaru',
    'View All': 'Lihat Semua',
    'No upcoming tickets': 'Belum ada tiket mendatang',
    'No orders yet': 'Belum ada pesanan',
    Discover: 'Jelajahi',
    'View All Events': 'Lihat Semua Acara',
    'Limited Time': 'Waktu Terbatas',
    'Live Events': 'Acara Musik',
    'Limited time offer - up to 50% off selected events': 'Penawaran terbatas - diskon hingga 50% untuk acara pilihan',
    'Ends in': 'Berakhir dalam',
    'Belum ada event yang tersedia untuk kategori ini.': 'No events available for this category.',
    Nama: 'Name',
    'Nomor telepon': 'Phone number',
    'Tiket yang dipilih': 'Selected tickets',
    Ringkasan: 'Summary',
    'Pembayaran diproses dalam IDR.': 'Payment is processed in IDR.',
    'Penjualan tiket dibuka': 'Ticket sales open',
    'Periode penjualan tiket konser ini sudah berakhir.': 'Ticket sales for this concert have ended.',
    'Kode promo': 'Promo code',
    'Masukkan kode promo': 'Enter promo code',
    Ganti: 'Change',
    Pakai: 'Apply',
    Subtotal: 'Subtotal',
    'Biaya layanan': 'Service fee',
    'Diskon promo': 'Promo discount',
    Total: 'Total',
    'Buat Pesanan': 'Place Order',
    'Detail pesanan': 'Order details',
    Berhasil: 'Successful',
    Tiket: 'Tickets',
    'Ringkasan pembayaran': 'Payment summary',
    Metode: 'Method',
    Pembayaran: 'Payment',
    'Belum ada tiket pada pesanan ini.': 'There are no tickets in this order.',
    'Tanggal belum tersedia': 'Date unavailable',
    'konser tersimpan': 'saved concerts',
    'Konser yang kamu simpan, siap ditemukan kembali kapan saja.': 'Your saved concerts, ready to discover again anytime.',
    'Koleksi favorit': 'Favorites',
    'Temukan konser': 'Explore concerts',
    'Belum ada konser yang dipublikasi.': 'No published concerts yet.',
    'Ubah Password': 'Change Password',
    'Password saat ini': 'Current password',
    'Password baru (min. 8 karakter)': 'New password (min. 8 characters)',
    'Konfirmasi password baru': 'Confirm new password',
    'Simpan Password': 'Save Password',
    'Profil berhasil diperbarui!': 'Profile updated successfully!',
    'Simpan perubahan': 'Save changes',
    'Jangan lewatkan': "Don't miss",
    'Amankan tiketmu sekarang.': 'Get your tickets now.',
    'Jadwal konser': 'Concert schedule',
    'Konser terdekat': 'Nearest concert',
    'Mencari konser terdekat': 'Finding the nearest concert',
    'Mencari konser...': 'Finding concerts...',
    'Temukan konser favoritmu': 'Find your favorite concert',
    'Jelajahi berbagai konser dan temukan acara berikutnya.': 'Explore concerts and find your next event.',
    'Hitung mundur ke konser': 'Countdown to the concert',
    'Lihat tiket': 'View tickets',
    'Jelajahi konser': 'Explore concerts',
  },
  en: {
    'Cari konser dan venue...': 'Search concerts and venues...',
    Cari: 'Search',
    Dasbor: 'Dashboard',
    'Tiket Saya': 'My Tickets',
    Favorit: 'Wishlist',
    'Riwayat Pesanan': 'Order History',
    Profil: 'Profile',
    Keluar: 'Logout',
    Konser: 'Concert',
    'Konser Populer': 'Trending Concerts',
    'Konser Mendatang': 'Upcoming Concerts',
    'Festival Musik': 'Music Festival',
    'Promo Kilat': 'Flash Sale',
    'Mulai dari': 'Starting from',
    terjual: 'sold',
    tersisa: 'left',
    Habis: 'Sold Out',
    'Pembayaran Tiket': 'Ticket Payment',
    'Ringkasan Pesanan': 'Order Summary',
    'Penjualan belum dimulai': 'Sales have not started yet',
    'Penjualan berakhir': 'Sales have ended',
    'Profil Saya': 'My Profile',
    'Kelola informasi akun Anda': 'Manage your account information',
    'Lupa password?': 'Forgot password?',
    Pengaturan: 'Settings',
    'Pengaturan website dikelola oleh administrator.': 'Settings are managed by the site administrator.',
    'Total Pengeluaran': 'Total Spent',
    Mendatang: 'Upcoming',
    'Konser Unggulan': 'Featured Concerts',
    'Tiket Anda': 'Your Tickets',
    'Pesanan Terbaru': 'Recent Orders',
    'Lihat Semua': 'View All',
    'Belum ada tiket mendatang': 'No upcoming tickets',
    'Belum ada pesanan': 'No orders yet',
    Jelajahi: 'Discover',
    'Lihat Semua Acara': 'View All Events',
    'Waktu Terbatas': 'Limited Time',
    'Acara Musik': 'Live Events',
    'Penawaran terbatas - diskon hingga 50% untuk acara pilihan': 'Limited time offer - up to 50% off selected events',
    'Berakhir dalam': 'Ends in',
    'No events available for this category.': 'Belum ada event yang tersedia untuk kategori ini.',
    Name: 'Nama',
    'Phone number': 'Nomor telepon',
    'Selected tickets': 'Tiket yang dipilih',
    Summary: 'Ringkasan',
    'Payment is processed in IDR.': 'Pembayaran diproses dalam IDR.',
    'Ticket sales open': 'Penjualan tiket dibuka',
    'Ticket sales for this concert have ended.': 'Periode penjualan tiket konser ini sudah berakhir.',
    'Promo code': 'Kode promo',
    'Enter promo code': 'Masukkan kode promo',
    Change: 'Ganti',
    Apply: 'Pakai',
    'Service fee': 'Biaya layanan',
    'Promo discount': 'Diskon promo',
    'Place Order': 'Buat Pesanan',
    'Order details': 'Detail pesanan',
    Successful: 'Berhasil',
    Tickets: 'Tiket',
    'Payment summary': 'Ringkasan pembayaran',
    Method: 'Metode',
    Payment: 'Pembayaran',
    'There are no tickets in this order.': 'Belum ada tiket pada pesanan ini.',
    'Date unavailable': 'Tanggal belum tersedia',
    'saved concerts': 'konser tersimpan',
    'Your saved concerts, ready to discover again anytime.': 'Konser yang kamu simpan, siap ditemukan kembali kapan saja.',
    Favorites: 'Koleksi favorit',
    'No published concerts yet.': 'Belum ada konser yang dipublikasi.',
    'Change Password': 'Ubah Password',
    'Current password': 'Password saat ini',
    'New password (min. 8 characters)': 'Password baru (min. 8 karakter)',
    'Confirm new password': 'Konfirmasi password baru',
    'Save Password': 'Simpan Password',
    'Profile updated successfully!': 'Profil berhasil diperbarui!',
    'Save changes': 'Simpan perubahan',
    "Don't miss": 'Jangan lewatkan',
    'Get your tickets now.': 'Amankan tiketmu sekarang.',
    'Concert schedule': 'Jadwal konser',
    'Nearest concert': 'Konser terdekat',
    'Finding the nearest concert': 'Mencari konser terdekat',
    'Finding concerts...': 'Mencari konser...',
    'Find your favorite concert': 'Temukan konser favoritmu',
    'Explore concerts and find your next event.': 'Jelajahi berbagai konser dan temukan acara berikutnya.',
    'Countdown to the concert': 'Hitung mundur ke konser',
    'View tickets': 'Lihat tiket',
    'Explore concerts': 'Jelajahi konser',
  },
};

const languageMap = {
  'Search concerts and venues...': 'Cari konser dan venue...',
  Search: 'Cari',
  Dashboard: 'Dasbor',
  'My Tickets': 'Tiket Saya',
  Wishlist: 'Favorit',
  'Order History': 'Riwayat Pesanan',
  Profile: 'Profil',
  Logout: 'Keluar',
  Concert: 'Konser',
  Festival: 'Festival',
  Promo: 'Promo',
  'Starting from': 'Mulai dari',
  sold: 'terjual',
  left: 'tersisa',
  'Sold Out': 'Habis',
  'Trending Concerts': 'Konser Populer',
  'Most popular concerts right now': 'Konser paling populer saat ini',
  'Upcoming Concerts': 'Konser Mendatang',
  "Don't miss these amazing events": 'Jangan lewatkan acara menarik ini',
  'Music Festival': 'Festival Musik',
  'Experience the best festivals': 'Nikmati festival terbaik',
  'Flash Sale': 'Promo Kilat',
  'Limited time offers': 'Penawaran terbatas',
  Checkout: 'Pembayaran',
  'Ticket Payment': 'Pembayaran Tiket',
  'Order Summary': 'Ringkasan Pesanan',
  'My Profile': 'Profil Saya',
  'Manage your account information': 'Kelola informasi akun Anda',
  'Forgot password?': 'Lupa password?',
  'Total Spent': 'Total Pengeluaran',
  Upcoming: 'Mendatang',
  'Featured Concerts': 'Konser Unggulan',
  'Your Tickets': 'Tiket Anda',
  'Recent Orders': 'Pesanan Terbaru',
  'View All': 'Lihat Semua',
  'No upcoming tickets': 'Belum ada tiket mendatang',
  'No orders yet': 'Belum ada pesanan',
  Discover: 'Jelajahi',
  'View All Events': 'Lihat Semua Acara',
  'Limited Time': 'Waktu Terbatas',
  'Live Events': 'Acara Musik',
  'Limited time offer - up to 50% off selected events': 'Penawaran terbatas - diskon hingga 50% untuk acara pilihan',
  'Ends in': 'Berakhir dalam',
  'No events available for this category.': 'Belum ada event yang tersedia untuk kategori ini.',
  'Full Name': 'Nama Lengkap',
  Email: 'Email',
  Phone: 'Nomor Telepon',
  City: 'Kota',
  Address: 'Alamat',
  'Your address': 'Alamat Anda',
  Bio: 'Biodata',
  'Tell us about yourself...': 'Ceritakan tentang diri Anda...',
  'Edit Profile': 'Edit Profil',
  Cancel: 'Batal',
  'Save Changes': 'Simpan Perubahan',
  'Saving...': 'Menyimpan...',
  'Loading profile...': 'Memuat profil...',
  'Loading wishlist...': 'Memuat favorit...',
  'Change Password': 'Ubah Password',
  'Current password': 'Password saat ini',
  'New password (min. 8 characters)': 'Password baru (min. 8 karakter)',
  'Confirm new password': 'Konfirmasi password baru',
  'Save Password': 'Simpan Password',
  Tickets: 'Tiket',
  'Phone number': 'Nomor telepon',
  'Selected tickets': 'Tiket yang dipilih',
  Summary: 'Ringkasan',
  'Payment is processed in IDR.': 'Pembayaran diproses dalam IDR.',
  'Ticket sales open': 'Penjualan tiket dibuka',
  'Ticket sales for this concert have ended.': 'Periode penjualan tiket konser ini sudah berakhir.',
  'Promo code': 'Kode promo',
  'Enter promo code': 'Masukkan kode promo',
  Change: 'Ganti',
  Apply: 'Pakai',
  Subtotal: 'Subtotal',
  'Service fee': 'Biaya layanan',
  'Promo discount': 'Diskon promo',
  Total: 'Total',
  'Place Order': 'Buat Pesanan',
  'Order details': 'Detail pesanan',
  Successful: 'Berhasil',
  'Payment summary': 'Ringkasan pembayaran',
  Method: 'Metode',
  Payment: 'Pembayaran',
  'There are no tickets in this order.': 'Belum ada tiket pada pesanan ini.',
  'Date unavailable': 'Tanggal belum tersedia',
  'saved concerts': 'konser tersimpan',
  'Your saved concerts, ready to discover again anytime.': 'Konser yang kamu simpan, siap ditemukan kembali kapan saja.',
  Favorites: 'Koleksi favorit',
  'Explore concerts': 'Jelajahi konser',
  'No published concerts yet.': 'Belum ada konser yang dipublikasi.',
  'Profile updated successfully!': 'Profil berhasil diperbarui!',
  'Save changes': 'Simpan perubahan',
  "Don't miss": 'Jangan lewatkan',
  'Get your tickets now.': 'Amankan tiketmu sekarang.',
  'Concert schedule': 'Jadwal konser',
  'Nearest concert': 'Konser terdekat',
  'Finding the nearest concert': 'Mencari konser terdekat',
  'Finding concerts...': 'Mencari konser...',
  'Find your favorite concert': 'Temukan konser favoritmu',
  'Explore concerts and find your next event.': 'Jelajahi berbagai konser dan temukan acara berikutnya.',
  'Countdown to the concert': 'Hitung mundur ke konser',
  'View tickets': 'Lihat tiket',
  'Sales have not started yet': 'Penjualan belum dimulai',
  'Sales have ended': 'Penjualan berakhir',
  'Settings are managed by the site administrator.': 'Pengaturan website dikelola oleh administrator.',
};
const reverseLanguageMap = Object.fromEntries(
  Object.entries(languageMap).map(([englishText, indonesianText]) => [indonesianText, englishText])
);

const SiteSettingsContext = createContext({
  ...defaults,
  formatMoney: (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0),
  t: (value) => value,
  refreshSiteSettings: async () => {},
});

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaults);

  const refreshSiteSettings = useCallback(async () => {
    const response = await axios.get(`${API_URL}/site-settings/public`, {
      headers: API_URL.includes('ngrok') ? { 'ngrok-skip-browser-warning': 'true' } : {},
    });
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.message || 'Unable to load website settings');
    }
    setSettings((current) => ({ ...current, ...response.data.data }));
  }, []);

  useEffect(() => {
    let active = true;
    axios.get(`${API_URL}/site-settings/public`, {
      headers: API_URL.includes('ngrok') ? { 'ngrok-skip-browser-warning': 'true' } : {},
    }).then((response) => {
      if (active && response.data?.success && response.data?.data) {
        setSettings((current) => ({ ...current, ...response.data.data }));
      }
    }).catch((error) => {
      console.error('Failed to load website settings:', error);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    document.documentElement.lang = settings.language || 'id';
  }, [settings.language]);

  const value = useMemo(() => ({
    ...settings,
    t: (text) => {
      if (settings.language === 'id') {
        return languageMap[text] || (Object.hasOwn(reverseLanguageMap, text) ? text : translations.id[text] || text);
      }
      return reverseLanguageMap[text] || (Object.hasOwn(languageMap, text) ? text : translations.en[text] || text);
    },
    formatMoney: (value) => {
      const amount = Number(value) || 0;
      const displayAmount = settings.currency === 'USD'
        ? amount / (Number(settings.usdExchangeRate) || defaults.usdExchangeRate)
        : amount;
      return new Intl.NumberFormat(settings.language === 'en' ? 'en-US' : 'id-ID', {
        style: 'currency',
        currency: settings.currency || 'IDR',
        maximumFractionDigits: settings.currency === 'USD' ? 2 : 0,
      }).format(displayAmount);
    },
    refreshSiteSettings,
  }), [settings, refreshSiteSettings]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

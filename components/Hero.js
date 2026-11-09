'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt } from 'react-icons/fa';
import axios from 'axios';
import Countdown from './Countdown';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getConcertDate(concert) {
  const date = new Date(concert.date);
  if (Number.isNaN(date.getTime())) return null;

  if (concert.time) {
    const [hours, minutes] = String(concert.time).split(':').map(Number);
    if (Number.isInteger(hours) && Number.isInteger(minutes)) {
      date.setHours(hours, minutes, 0, 0);
    }
  }

  return date;
}

function formatEventDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

const Hero = () => {
  const [concert, setConcert] = useState(null);
  const [concertDate, setConcertDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    axios.get(`${API_URL}/concerts/upcoming`)
      .then((response) => {
        const concerts = Array.isArray(response.data?.data) ? response.data.data : [];
        const nearest = concerts
          .map((item) => ({ item, date: getConcertDate(item) }))
          .filter(({ date }) => date && date.getTime() > Date.now())
          .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

        if (active && nearest) {
          setConcert(nearest.item);
          setConcertDate(nearest.date);
        }
      })
      .catch((loadError) => {
        console.error('Failed to load nearest concert:', loadError);
        if (active) setError('Konser terdekat belum dapat dimuat.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const concertHref = concert ? `/concerts/${concert.slug || concert.id}` : '/concerts';
  const venue = concert?.venue?.name || concert?.venueName || concert?.location;
  const city = concert?.venue?.city || concert?.city;
  const location = [venue, city].filter(Boolean).join(', ');
  const artist = concert?.artist?.name || concert?.artistName || concert?.genre;

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center bg-dark pt-24">
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark/80 to-primary/30" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['♪', '♫', '♬', '🎵', '🎶'].map((note, i) => (
          <motion.div
            key={note}
            className="absolute text-4xl text-white/10"
            initial={{ y: (i + 1) * 100, x: (i + 1) * 150, rotate: 0, opacity: 0.3 }}
            animate={{ y: [null, -200], x: [null, (i + 1) * 50], rotate: [0, 360], opacity: [0.3, 0] }}
            transition={{ duration: 15 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 2 }}
            style={{ left: `${10 + i * 20}%`, top: `${80 - i * 15}%` }}
          >
            {note}
          </motion.div>
        ))}
      </div>

      <div className="relative w-full">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>{loading ? 'Mencari konser terdekat' : concert ? 'Konser terdekat' : 'Jadwal konser'}</span>
              {artist && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">{artist}</span>
                </>
              )}
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1]">
              {loading ? (
                <span className="text-gradient">Mencari konser...</span>
              ) : concert ? (
                <span className="text-white drop-shadow-2xl">{concert.name}</span>
              ) : (
                <span className="text-gradient">Temukan konser favoritmu</span>
              )}
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed">
              {concert?.description || (concert
                ? `Jangan lewatkan ${concert.name}${artist ? ` bersama ${artist}` : ''}. Amankan tiketmu sekarang.`
                : error || 'Jelajahi berbagai konser dan temukan acara berikutnya.')}
            </p>

            {concert && concertDate && (
              <>
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
                    <FaCalendarAlt className="text-primary text-lg" />
                    <span className="text-white/90">{formatEventDate(concertDate)}</span>
                  </div>
                  {location && (
                    <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
                      <FaMapMarkerAlt className="text-secondary text-lg" />
                      <span className="text-white/90">{location}</span>
                    </div>
                  )}
                </div>

                <div className="mb-10">
                  <p className="text-white/60 text-sm uppercase tracking-wider mb-3">Hitung mundur ke konser</p>
                  <Countdown targetDate={concertDate} />
                </div>
              </>
            )}

            {!loading && (
              <div className="flex flex-wrap gap-4">
                <Link href={concertHref} className="btn-primary text-lg">
                  <FaTicketAlt className="text-xl" />
                  <span>{concert ? 'Lihat tiket' : 'Jelajahi konser'}</span>
                  {concert && Number(concert.minPrice ?? concert.price) > 0 && (
                    <span className="text-sm opacity-80">mulai {formatPrice(concert.minPrice ?? concert.price)}</span>
                  )}
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-7 h-12 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-gradient-to-t from-primary to-secondary rounded-full animate-pulse" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;

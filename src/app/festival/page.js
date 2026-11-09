'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ConcertCard from '../../../components/ConcertCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function FestivalPage() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFestivalConcerts = async () => {
      try {
        const response = await axios.get(`${API_URL}/concerts`);
        const rows = response?.data?.data || [];
        const filtered = (Array.isArray(rows) ? rows : []).filter((item) => {
          const genre = (item.genre || item.category || '').toLowerCase();
          return genre.includes('festival') || genre.includes('edm') || genre.includes('music');
        }).slice(0, 8);

        setConcerts(filtered);
      } catch (error) {
        console.error('Failed to load festival concerts:', error);
        setConcerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFestivalConcerts();
  }, []);

  return (
    <main className="min-h-screen bg-dark">
      <Navbar />

      <section className="pt-36 pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-10">
            <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold">Festival</p>
            <h1 className="text-4xl md:text-5xl font-bold mt-2">Big Weekend Energy</h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="card animate-pulse h-[420px]">
                  <div className="h-72 bg-white/10" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                    <div className="h-4 w-1/2 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : concerts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {concerts.map((concert, index) => (
                <ConcertCard key={concert.id || `${concert.name}-${index}`} concert={concert} index={index} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center text-white/60">
              Belum ada festival yang dipublikasi.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

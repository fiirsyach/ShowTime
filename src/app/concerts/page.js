'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ConcertCard from '../../../components/ConcertCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ConcertsPage() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const response = await axios.get(`${API_URL}/concerts`);
        const rows = response?.data?.data || [];
        setConcerts(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error('Failed to load concerts list:', error);
        setConcerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  return (
    <main className="min-h-screen bg-dark">
      <Navbar />

      <section className="pt-36 pb-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold">Discover</p>
              <h1 className="text-4xl md:text-5xl font-bold mt-2">Concerts</h1>
            </div>
            <p className="text-white/60 max-w-xl">
              Explore upcoming live performances and limited festival runs across the city.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="card animate-pulse h-[420px]">
                  <div className="h-72 bg-white/10" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                    <div className="h-4 w-1/2 bg-white/10 rounded" />
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
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
              Belum ada konser yang dipublikasi.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

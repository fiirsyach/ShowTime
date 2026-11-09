'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ConcertCard from '../../../components/ConcertCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PromoPage() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromoConcerts = async () => {
      try {
        const response = await axios.get(`${API_URL}/concerts/flash-sale`);
        const rows = response?.data?.data || [];
        setConcerts(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error('Failed to load promo concerts:', error);
        setConcerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoConcerts();
  }, []);

  return (
    <main className="min-h-screen bg-dark">
      <Navbar />

      <section className="pt-36 pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-10">
            <p className="text-secondary uppercase tracking-[0.2em] text-xs font-semibold">Special Offer</p>
            <h1 className="text-4xl md:text-5xl font-bold mt-2">Promo & Flash Sale</h1>
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
              Belum ada promo yang tersedia saat ini.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

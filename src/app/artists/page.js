'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ArtistsPage() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axios.get(`${API_URL}/artists`);
        const rows = response?.data?.data || [];
        setArtists(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error('Failed to load artists list:', error);
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  return (
    <main className="min-h-screen bg-dark">
      <Navbar />

      <section className="pt-36 pb-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold">Featured</p>
              <h1 className="text-4xl md:text-5xl font-bold mt-2">Artists</h1>
            </div>
            <p className="text-white/60 max-w-xl">
              Discover the performers, bands, and creators driving the next wave of live music experiences.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="card animate-pulse h-[320px]">
                  <div className="aspect-square bg-white/10" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                    <div className="h-4 w-1/2 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : artists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {artists.map((artist) => (
                <Link key={artist.id} href={`/artists/${artist.id}`} className="card overflow-hidden group">
                  <div className="relative aspect-square bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <span className="text-6xl opacity-30">🎤</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{artist.name}</h3>
                    <p className="text-white/60 mt-1">{artist.genre || 'Music'}</p>
                    <p className="text-xs text-white/40 mt-3">{artist.followers || '0'} followers</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center text-white/60">
              Belum ada artist yang tersedia.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

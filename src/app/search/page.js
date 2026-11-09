'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ConcertCard from '../../../components/ConcertCard';
import { FaSearch, FaSpinner } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const city = searchParams.get('city') || '';
  const date = searchParams.get('date') || '';
  const genre = searchParams.get('genre') || '';
  const hasSearch = Boolean(query.trim() || city.trim() || date || genre.trim());
  const searchKey = new URLSearchParams({ q: query, city, date, genre }).toString();
  const [searchResult, setSearchResult] = useState({ key: '', concerts: [], error: '' });
  const loading = hasSearch && searchResult.key !== searchKey;

  useEffect(() => {
    if (!hasSearch) return;

    let active = true;
    axios.get(`${API_URL}/concerts/search`, { params: { q: query, city, date, genre } })
      .then((response) => {
        if (active) {
          setSearchResult({
            key: searchKey,
            concerts: response.data.success ? response.data.data || [] : [],
            error: response.data.success ? '' : 'Gagal mencari konser'
          });
        }
      })
      .catch((requestError) => {
        if (active) {
          setSearchResult({
            key: searchKey,
            concerts: [],
            error: requestError.response?.data?.message || 'Gagal mencari konser'
          });
        }
      });
    return () => { active = false; };
  }, [query, city, date, genre, hasSearch, searchKey]);

  const concerts = searchResult.key === searchKey ? searchResult.concerts : [];
  const error = searchResult.key === searchKey ? searchResult.error : '';

  const submitSearch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const searchTerm = String(formData.get('q') || '').trim();
    const cityFilter = String(formData.get('city') || '').trim();
    const dateFilter = String(formData.get('date') || '');
    const genreFilter = String(formData.get('genre') || '').trim();
    if (searchTerm) params.set('q', searchTerm);
    if (cityFilter) params.set('city', cityFilter);
    if (dateFilter) params.set('date', dateFilter);
    if (genreFilter) params.set('genre', genreFilter);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-dark text-white">
      <Navbar />
      <section className="container mx-auto px-4 pb-16 pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Discover events</p>
          <h1 className="mt-2 text-4xl font-bold">Cari konser</h1>
          <form onSubmit={submitSearch} className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="relative sm:col-span-2 lg:col-span-2">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input key={`q-${query}`} name="q" defaultValue={query} className="input-field pl-11" placeholder="Nama konser atau artis" />
            </label>
            <input key={`city-${city}`} name="city" defaultValue={city} className="input-field" placeholder="Kota / lokasi" aria-label="Filter kota atau lokasi" />
            <input key={`date-${date}`} name="date" defaultValue={date} className="input-field" type="date" aria-label="Filter tanggal konser" />
            <div className="flex gap-3">
              <input key={`genre-${genre}`} name="genre" defaultValue={genre} className="input-field min-w-0" placeholder="Genre" aria-label="Filter genre" />
              <button className="btn-primary shrink-0" type="submit">Cari</button>
            </div>
          </form>

          <div className="mt-10">
            {!hasSearch ? (
              <div className="py-16 text-center text-white/50">Masukkan kata kunci atau pilih filter untuk mencari konser.</div>
            ) : loading ? <div className="flex justify-center py-20"><FaSpinner className="h-9 w-9 animate-spin text-primary" /></div> : error ? (
              <div className="py-16 text-center text-red-300">{error}</div>
            ) : concerts.length ? (
              <>
                <p className="mb-5 text-sm text-white/50">{concerts.length} konser cocok dengan pencarian dan filter Anda.</p>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {concerts.map((concert, index) => <ConcertCard key={concert.id} concert={concert} index={index} />)}
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-white/50">Tidak ada konser publik yang cocok dengan pencarian dan filter Anda.</div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div className="min-h-screen bg-dark" />}><SearchResults /></Suspense>;
}
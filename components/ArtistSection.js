'use client';

import { motion } from 'framer-motion';
import { FaInstagram, FaSpotify, FaYoutube } from 'react-icons/fa';

const ArtistSection = ({ id }) => {
  const artists = [
    { 
      id: 1, 
      name: 'John Doe', 
      genre: 'Jazz', 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
      followers: '2.5M',
      verified: true
    },
    { 
      id: 2, 
      name: 'Rock Band', 
      genre: 'Rock', 
      image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80',
      followers: '3.8M',
      verified: true
    },
    { 
      id: 3, 
      name: 'DJ Master', 
      genre: 'Electronic', 
      image: 'https://images.unsplash.com/photo-1571266028243-e4733b3f0b16?w=300&q=80',
      followers: '4.2M',
      verified: false
    },
    { 
      id: 4, 
      name: 'Soul Singer', 
      genre: 'Soul', 
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80',
      followers: '1.9M',
      verified: true
    },
  ];

  return (
    <section id={id} className="py-20 bg-gradient-to-b from-dark to-dark/50 scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary font-semibold mb-2 block">
              Featured Artists
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Popular <span className="text-gradient">Artists</span>
            </h2>
            <p className="text-white/60 mt-2">Discover your favorite artists and their upcoming shows</p>
          </div>
          <a href="/artists" className="group inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
            View All
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {artists.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="card p-0 overflow-hidden group cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                  <span className="text-6xl opacity-30">🎤</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-60" />
                
                {/* Social Icons */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-8 h-8 rounded-full bg-dark/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-colors">
                    <FaInstagram className="w-3 h-3" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-dark/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-colors">
                    <FaSpotify className="w-3 h-3" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-dark/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-colors">
                    <FaYoutube className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <h4 className="font-bold">{artist.name}</h4>
                  {artist.verified && (
                    <span className="text-primary text-xs">✓</span>
                  )}
                </div>
                <p className="text-sm text-white/60">{artist.genre}</p>
                <p className="text-xs text-white/40 mt-1">{artist.followers} followers</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtistSection;
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import ConcertSection from '../../components/ConcertSection';
import Footer from '../../components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-dark">
      <Navbar />
      <div id="top" className="scroll-mt-24">
        <Hero />
      </div>
      <ConcertSection 
        id="concerts"
        title="Trending Concerts" 
        subtitle="Most popular concerts right now"
        viewAll="/concerts"
        filter="trending"
      />
      <ConcertSection 
        id="upcoming"
        title="Upcoming Concerts" 
        subtitle="Don't miss these amazing events"
        viewAll="/concerts"
        filter="upcoming"
      />
      <ConcertSection 
        id="festival"
        title="Music Festival" 
        subtitle="Experience the best festivals"
        viewAll="/festival"
        filter="festival"
      />
      <ConcertSection 
        id="promo"
        title="Flash Sale" 
        subtitle="Limited time offers"
        viewAll="/promo"
        filter="flash-sale"
        flashSale
      />
      <Footer />
    </main>
  );
}
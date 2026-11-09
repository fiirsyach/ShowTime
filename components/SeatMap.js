// components/SeatMap.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaTicketAlt, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

const SeatMap = ({ 
  concert, 
  venue, 
  seats = [], 
  onSeatSelect, 
  selectedSeats = [],
  maxSelectable = 10,
  readOnly = false,
  categoryView = false
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const mapConfig = venue?.seatConfig || concert?.seatMapConfig || {};

  // Debug log
  console.log('🔍 SeatMap received:', {
    concert: concert?.name,
    venueType: concert?.venueType || venue?.type || 'unknown',
    seatsCount: seats?.length || 0,
    selectedSeatsCount: selectedSeats?.length || 0,
    hasSeats: Array.isArray(seats) && seats.length > 0
  });

  // Category colors
  const categoryColors = {
    vvip: { bg: '#FCD34D', text: '#78350F', border: '#F59E0B' },
    vip: { bg: '#A78BFA', text: '#2E1065', border: '#8B5CF6' },
    regular: { bg: '#60A5FA', text: '#1E3A5F', border: '#3B82F6' },
    platinum: { bg: '#34D399', text: '#064E3B', border: '#10B981' },
    diamond: { bg: '#F472B6', text: '#831843', border: '#EC4899' },
    festival: { bg: '#F472B6', text: '#831843', border: '#EC4899' }
  };

  const categoryLabels = {
    vvip: 'VVIP',
    vip: 'VIP',
    regular: 'Regular',
    platinum: 'Platinum',
    diamond: 'Diamond',
    festival: 'Festival'
  };

  const statusColors = {
    available: 'bg-green-500 hover:bg-green-400',
    selected: 'bg-primary hover:bg-primary/80',
    booked: 'bg-red-500 cursor-not-allowed opacity-60',
    reserved: 'bg-yellow-500 cursor-not-allowed opacity-60',
    disabled: 'bg-gray-600 cursor-not-allowed opacity-40'
  };

  // Get venue shape from concert or venue
  const getVenueShape = () => {
    // Prioritaskan venueType dari concert
    const venueType = concert?.venueType || venue?.type || 'hall';
    
    switch (venueType) {
      case 'stadium':
        return 'stadium';
      case 'hall':
        return 'rectangular';
      case 'outdoor':
        return 'outdoor';
      case 'arena':
        return 'arena';
      case 'theater':
        return 'fan';
      default:
        return 'rectangular';
    }
  };

  // Generate seat positions based on venue type
  const generateSeatPositions = () => {
    // Validasi: pastikan seats adalah array
    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return [];
    }

    const shape = getVenueShape();
    const positions = [];
    const config = venue?.seatConfig || concert?.seatMapConfig || { sections: [] };

    // Group seats by section
    const seatsBySection = {};
    seats.forEach(seat => {
      const sectionId = seat.sectionId || seat.section || 'default';
      if (!seatsBySection[sectionId]) {
        seatsBySection[sectionId] = [];
      }
      seatsBySection[sectionId].push(seat);
    });

    // Calculate positions for each section
    Object.keys(seatsBySection).forEach(sectionId => {
      const sectionSeats = seatsBySection[sectionId];
      const section = config.sections?.find(s => s.id === sectionId) || {
        id: sectionId,
        name: sectionId.toUpperCase(),
        rows: 5,
        seatsPerRow: 10
      };

      const isStadium = shape === 'stadium' || shape === 'arena';
      const isOutdoor = shape === 'outdoor';

      let xOffset = 0.1;
      let yOffset = 0.15;
      let seatSpacing = 0.03;
      let rowSpacing = 0.045;

      // Sort seats by row and number
      const sortedSeats = [...sectionSeats].sort((a, b) => {
        const rowCompare = (a.row || 'A').localeCompare(b.row || 'A');
        if (rowCompare !== 0) return rowCompare;
        return (a.number || 0) - (b.number || 0);
      });

      if (isStadium) {
        const configuredSections = config.sections || [];
        const configuredSectionIndex = configuredSections.findIndex((item) => item.id === sectionId);
        const sectionIndex = configuredSectionIndex >= 0 ? configuredSectionIndex : 0;
        const sectionCount = Math.max(configuredSections.length, 1);
        const fanStart = shape === 'arena' ? -Math.PI / 2 : Math.PI * 0.2;
        const sectionSpan = (shape === 'arena' ? Math.PI * 2 : Math.PI * 0.6) / sectionCount;
        const sectionStart = fanStart + sectionIndex * sectionSpan;
        const stage = config.stage || { x: 0.5, y: 0.1, height: 0.08 };
        const centerX = Number(stage.x ?? 0.5);
        const seatArcOriginY = Number(stage.y ?? 0.1) + Number(stage.height ?? 0.08) + 0.1;
        const rowLabels = [...new Set(sortedSeats.map((seat) => String(seat.row || 'A')))]
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        const seatsByRow = new Map(rowLabels.map((row) => [
          row,
          sortedSeats.filter((seat) => String(seat.row || 'A') === row)
        ]));

        sortedSeats.forEach((seat, index) => {
          const row = String(seat.row || 'A');
          const rowIndex = rowLabels.indexOf(row);
          const rowSeats = seatsByRow.get(row) || [];
          const seatIndex = rowSeats.findIndex((rowSeat) => rowSeat.id === seat.id);
          const rowProgress = rowLabels.length > 1 ? rowIndex / (rowLabels.length - 1) : 0;
          const seatProgress = rowSeats.length > 1 ? seatIndex / (rowSeats.length - 1) : 0.5;
          const radius = (shape === 'arena' ? 0.18 : 0.2) + rowProgress * 0.24;
          const angle = sectionStart + seatProgress * sectionSpan;
          const x = centerX + radius * Math.cos(angle);
          const y = seatArcOriginY + radius * Math.sin(angle);
          
          positions.push({
            ...seat,
            x,
            y,
            rotation: 0,
            isStadium: true
          });
        });
      } else if (isOutdoor) {
        // Outdoor - grid layout
        const totalSeats = sortedSeats.length;
        const rows = Math.ceil(Math.sqrt(totalSeats));
        const cols = Math.ceil(totalSeats / rows);
        
        sortedSeats.forEach((seat, index) => {
          const rowIndex = Math.floor(index / cols);
          const seatIndex = index % cols;
          
          const x = xOffset + (seatIndex / cols) * 0.8;
          const y = yOffset + (rowIndex / rows) * 0.75;
          
          positions.push({
            ...seat,
            x,
            y,
            rotation: 0
          });
        });
      } else {
        // Concert Hall - grid with slight fan
        const totalSeats = sortedSeats.length;
        const rows = 20;
        const cols = Math.ceil(totalSeats / rows);
        
        sortedSeats.forEach((seat, index) => {
          const rowIndex = Math.floor(index / cols);
          const seatIndex = index % cols;
          
          // Fan shape: wider at back
          const rowOffset = rowIndex / rows * 0.02;
          const x = xOffset + (seatIndex / Math.max(cols, 1)) * 0.8 + rowOffset * (seatIndex / Math.max(cols, 1) - 0.5);
          const y = yOffset + (rowIndex / Math.max(rows, 1)) * 0.75;
          
          positions.push({
            ...seat,
            x,
            y,
            rotation: 0
          });
        });
      }
    });

    return positions;
  };

  const seatPositions = generateSeatPositions();

  // Handle seat click
  const handleSeatClick = (seat) => {
    if (readOnly) return;
    if (seat.status === 'booked' || seat.status === 'reserved' || seat.status === 'disabled') {
      return;
    }

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      onSeatSelect(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= maxSelectable) {
        alert(`You can only select up to ${maxSelectable} seats`);
        return;
      }
      onSeatSelect([...selectedSeats, seat]);
    }
  };

  // Get seat style based on category
  const getSeatStyle = (seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    const isBooked = seat.status === 'booked' || seat.status === 'reserved';
    const isDisabled = seat.status === 'disabled';

    let bgColor = 'bg-dark/50';
    let borderColor = 'border-white/20';
    let textColor = 'text-white/60';

    if (isSelected) {
      bgColor = 'bg-primary';
      borderColor = 'border-primary';
      textColor = 'text-white';
    } else if (isBooked) {
      bgColor = 'bg-red-500/50';
      borderColor = 'border-red-500';
      textColor = 'text-white/30';
    } else if (isDisabled) {
      bgColor = 'bg-gray-600/50';
      borderColor = 'border-gray-600';
      textColor = 'text-white/20';
    } else {
      const colors = categoryColors[seat.category] || categoryColors.regular;
      bgColor = `${colors.bg}20`;
      borderColor = `border-${colors.border}`;
      textColor = 'text-white/80';
    }

    return { bgColor, borderColor, textColor };
  };

  // Render stage
  const renderStage = () => {
    const config = venue?.seatConfig || concert?.seatMapConfig || {};
    const stage = config.stage || { x: 0.5, y: 0.1, width: 0.4, height: 0.08 };

    return (
      <div 
        className="absolute rounded-lg bg-gradient-to-br from-primary/40 to-secondary/40 border-2 border-white/20 flex items-center justify-center"
        style={{
          left: `${(stage.x - stage.width / 2) * 100}%`,
          top: `${stage.y * 100}%`,
          width: `${stage.width * 100}%`,
          height: `${stage.height * 100}%`,
          transform: 'translateX(0)'
        }}
      >
        <div className="text-center">
          <span className="text-3xl">🎵</span>
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">Stage</p>
        </div>
      </div>
    );
  };

  // Render entrance
  const renderEntrance = () => {
    const config = venue?.seatConfig || concert?.seatMapConfig || {};
    const entrance = config.entrance || { x: 0.5, y: 0.92 };

    return (
      <div 
        className="absolute flex items-center justify-center"
        style={{
          left: `${entrance.x * 100}%`,
          top: `${entrance.y * 100}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="glass px-4 py-1.5 rounded-full text-xs text-white/60">
          🚪 Entrance
        </div>
      </div>
    );
  };

  // Render aisles
  const renderAisles = () => {
    const config = venue?.seatConfig || concert?.seatMapConfig || {};
    const aisles = config.aisles || [];

    return aisles.map((aisle, index) => (
      <div
        key={index}
        className="absolute bg-white/5"
        style={{
          left: `${aisle.x * 100}%`,
          top: `${aisle.y * 100}%`,
          width: `${aisle.width * 100}%`,
          height: `${aisle.height * 100}%`,
          transform: 'translateX(-50%)'
        }}
      />
    ));
  };

  // ==================== RENDER ====================
  
  // Jika tidak ada seats, tampilkan pesan
  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    return (
      <div className="relative w-full h-full min-h-[500px] bg-dark rounded-2xl border border-white/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💺</div>
          <p className="text-white/60">Belum ada kursi yang tersedia</p>
          <p className="text-sm text-white/40 mt-2">Silahkan cek kembali nanti</p>
        </div>
      </div>
    );
  }

  // Jika seatPositions kosong, tampilkan pesan
  if (seatPositions.length === 0) {
    return (
      <div className="relative w-full h-full min-h-[500px] bg-dark rounded-2xl border border-white/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-white/60">Tidak dapat menampilkan layout kursi</p>
          <p className="text-sm text-white/40 mt-2">Silahkan coba lagi nanti</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] bg-dark rounded-2xl overflow-hidden border border-white/10">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
          className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/60"
        >
          +
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
          className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/60"
        >
          -
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 text-xs"
        >
          ⟲
        </button>
      </div>

      {/* Seat Map Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={(e) => {
          setIsDragging(true);
          setDragStart({ x: e.clientX, y: e.clientY });
        }}
        onMouseMove={(e) => {
          if (isDragging) {
            setPan({
              x: pan.x + (e.clientX - dragStart.x) / zoom,
              y: pan.y + (e.clientY - dragStart.y) / zoom
            });
            setDragStart({ x: e.clientX, y: e.clientY });
          }
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div 
          className="relative w-full h-full transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          {/* Venue Background */}
          <div className="absolute inset-0 bg-dark/50 rounded-2xl">
            {/* Venue Shape */}
            <div className="absolute inset-4 border-2 border-white/5 rounded-2xl" />
          </div>

          {/* Stage */}
          {renderStage()}

          {/* Aisles */}
          {renderAisles()}

          {/* Entrance */}
          {renderEntrance()}

          {/* Section Labels */}
          {mapConfig.sections?.map((section, index) => {
            const sectionSeats = seatPositions.filter(s => s.sectionId === section.id);
            if (sectionSeats.length === 0) return null;
            
            const avgX = sectionSeats.reduce((sum, s) => sum + s.x, 0) / sectionSeats.length;
            const avgY = sectionSeats.reduce((sum, s) => sum + s.y, 0) / sectionSeats.length;
            
            return (
              <div
                key={index}
                className="absolute text-center pointer-events-none"
                style={{
                  left: `${avgX * 100}%`,
                  top: `${avgY * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="glass-dark px-3 py-1 rounded-full text-xs font-medium text-white/60 border border-white/10">
                  {section.name}
                </div>
              </div>
            );
          })}

          {/* Seats */}
          {seatPositions.map((seat, index) => {
            const isSelected = selectedSeats.some(s => s.id === seat.id);
            const isBooked = seat.status === 'booked' || seat.status === 'reserved';
            const isDisabled = seat.status === 'disabled';
            const isHovered = hoveredSeat?.id === seat.id;
            const style = getSeatStyle(seat);
            const colors = categoryColors[seat.category] || categoryColors.regular;

            return (
              <motion.div
                key={seat.id || index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index * 0.003, 0.5) }}
                className={`absolute transition-all duration-200 ${
                  readOnly ? 'cursor-default' : isBooked || isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                } ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-dark' : ''}`}
                style={{
                  left: `${(seat.x || 0) * 100}%`,
                  top: `${(seat.y || 0) * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${seat.rotation || 0}rad)`,
                  width: '22px',
                  height: '22px',
                  zIndex: isHovered || isSelected ? 10 : 1
                }}
                onMouseEnter={() => setHoveredSeat(seat)}
                onMouseLeave={() => setHoveredSeat(null)}
                onClick={() => handleSeatClick(seat)}
              >
                <div 
                  className={`w-full h-full rounded-sm border transition-all duration-200 flex items-center justify-center text-[8px] font-bold ${
                    isSelected 
                      ? 'bg-primary border-primary text-white' 
                      : isBooked 
                        ? 'bg-red-500/50 border-red-500 text-white/20' 
                        : isDisabled
                          ? 'bg-gray-600/50 border-gray-600 text-white/10'
                          : `${colors.bg}30 border-${colors.border} text-white/60 hover:scale-110`
                  }`}
                >
                  {categoryView ? '' : isBooked ? '✕' : isSelected ? '✓' : (seat.number || '')}
                </div>

                {/* Tooltip on hover */}
                {!categoryView && isHovered && !isBooked && !isDisabled && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass-dark px-3 py-2 rounded-lg text-xs whitespace-nowrap z-20 min-w-[120px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Seat</span>
                        <span className="font-bold text-white">{seat.row || ''}{seat.number || ''}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Category</span>
                        <span className={`font-medium text-${colors.border}`}>
                          {categoryLabels[seat.category] || seat.category || 'Regular'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Price</span>
                        <span className="font-bold text-gradient">Rp {seat.price?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Status</span>
                        <span className={isSelected ? 'text-primary' : 'text-green-400'}>
                          {isSelected ? 'Selected' : 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-dark px-4 py-2 rounded-full flex items-center gap-4 text-xs z-10">
            {categoryView ? [...new Set(seatPositions.map((seat) => seat.category))].map((category) => (
              <div key={category} className="flex items-center gap-1.5 whitespace-nowrap">
                <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: categoryColors[category]?.bg || categoryColors.regular.bg }} />
                <span className="text-white/70">{categoryLabels[category] || category}</span>
              </div>
            )) : <>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <span className="text-white/60">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-white/60">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span className="text-white/60">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-yellow-500" />
              <span className="text-white/60">Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gray-600" />
              <span className="text-white/60">Disabled</span>
            </div>
            </>}
          </div>
        </div>
      </div>

      {/* Stats */}
      {categoryView ? (
        <div className="absolute bottom-20 left-4 right-4 text-center text-xs text-white/45 pointer-events-none">
          Peta area kategori, bukan pemilihan kursi bernomor
        </div>
      ) : <div className="absolute bottom-20 left-4 right-4 flex justify-between text-xs text-white/40 pointer-events-none">
        <div>
          <span>Total: {seatPositions.length}</span>
          <span className="ml-3 text-green-400">Available: {seatPositions.filter(s => s.status === 'available' && !selectedSeats.some(ss => ss.id === s.id)).length}</span>
          <span className="ml-3 text-red-400">Booked: {seatPositions.filter(s => s.status === 'booked').length}</span>
        </div>
        <div>
          <span>Selected: {selectedSeats.length}</span>
          <span className="ml-3 text-primary">Max: {maxSelectable}</span>
        </div>
      </div>}
    </div>
  );
};

export default SeatMap;
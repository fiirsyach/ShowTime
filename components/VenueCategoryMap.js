'use client';

const categoryColors = ['#38bdf8', '#a78bfa', '#f472b6', '#fb923c', '#4ade80', '#f87171'];

const getVenueLayout = (venue, concert) => {
  const type = String(concert?.venueType || venue?.type || 'hall').toLowerCase();
  if (type === 'arena') return 'arena';
  if (type === 'stadium') return 'stadium';
  if (type === 'outdoor') return 'outdoor';
  return 'hall';
};

function ZoneLabel({ x, y, fontSize = 14, children }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#111827" fontSize={fontSize} fontWeight="700">
      {children}
    </text>
  );
}

function Stage({ x = 260, y = 28, width = 120 }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height="38" rx="5" fill="#f8fafc" />
      <text x={x + width / 2} y={y + 24} textAnchor="middle" fill="#111827" fontSize="15" fontWeight="700">STAGE</text>
    </g>
  );
}

export default function VenueCategoryMap({ venue, concert, ticketCategories = [] }) {
  const layout = getVenueLayout(venue, concert);
  const venueName = venue?.name || concert?.venueName || 'Denah venue';
  const categoryIndexAtDepth = (depthIndex, depthCount) => {
    if (!ticketCategories.length || depthCount <= 1) return depthIndex;
    return Math.round((depthIndex / (depthCount - 1)) * (ticketCategories.length - 1));
  };
  const getCategoryName = (index) => ticketCategories.length
    ? ticketCategories[index % ticketCategories.length]?.category || ''
    : '';
  const getCategoryColor = (index) => categoryColors[index % categoryColors.length];
  const renderCategoryLabel = (index, x, y, fontSize = 12) => {
    const name = getCategoryName(index);
    if (!name) return null;
    return <ZoneLabel x={x} y={y} fontSize={name.length > 10 ? Math.min(fontSize, 9) : fontSize}>{name}</ZoneLabel>;
  };
  const venueLabels = {
    arena: 'Arena melingkar',
    stadium: 'Stadium',
    outdoor: 'Festival outdoor',
    hall: 'Concert hall',
  };
  const arenaBands = ticketCategories.length ? ticketCategories.map((_, index) => index) : [0, 1, 2, 3];
  const outdoorBands = ticketCategories.length ? ticketCategories.map((_, index) => index) : [0, 1, 2, 3];
  const stadiumBands = ticketCategories.length ? ticketCategories.map((_, index) => index) : [0, 1, 2, 3];
  const stadiumStepX = 155 / stadiumBands.length;
  const stadiumStepY = 95 / stadiumBands.length;
  const hallDepths = {
    bottomSide: categoryIndexAtDepth(0, 6),
    bottomCenter: categoryIndexAtDepth(1, 6),
    middleSide: categoryIndexAtDepth(2, 6),
    middleCenter: categoryIndexAtDepth(3, 6),
    topSide: categoryIndexAtDepth(4, 6),
    topCenter: categoryIndexAtDepth(5, 6),
  };

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#101827]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{venueName}</p>
          <p className="text-xs text-white/45">{venueLabels[layout]}</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">Denah kategori</span>
      </div>

      <div className="min-h-0 flex-1 p-3 sm:p-5">
        <svg
          viewBox="0 0 640 390"
          role="img"
          aria-label={`Denah kategori ${venueLabels[layout]} di ${venueName}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect x="0" y="0" width="640" height="390" rx="16" fill="#0b1220" />
          {layout === 'arena' && (
            <g>
              {arenaBands.map((categoryIndex, bandIndex) => {
                const progress = arenaBands.length > 1 ? bandIndex / (arenaBands.length - 1) : 0;
                const radiusY = 145 - progress * 90;
                const bandHeight = arenaBands.length > 1 ? 90 / (arenaBands.length - 1) : 0;
                return (
                  <g key={categoryIndex}>
                    <ellipse
                      cx="320"
                      cy="220"
                      rx={245 - progress * 155}
                      ry={radiusY}
                      fill={getCategoryColor(categoryIndex)}
                    />
                    {renderCategoryLabel(
                      categoryIndex,
                      320,
                      220 - radiusY + (arenaBands.length > 1 ? bandHeight / 2 : 25),
                      10
                    )}
                  </g>
                );
              })}
              <ellipse cx="320" cy="220" rx="75" ry="38" fill="#111827" />
              <Stage x={260} y={201} width={120} />
            </g>
          )}
          {layout === 'hall' && (
            <g>
              <Stage x={230} y={24} width={180} />
              <path d="M95 103 L215 103 L203 163 L80 163 Z" fill={getCategoryColor(hallDepths.topSide)} />
              <path d="M425 103 L545 103 L560 163 L437 163 Z" fill={getCategoryColor(hallDepths.topSide)} />
              <rect x="230" y="103" width="180" height="60" rx="5" fill={getCategoryColor(hallDepths.topCenter)} />
              <path d="M75 181 L211 181 L201 235 L68 235 Z" fill={getCategoryColor(hallDepths.middleSide)} />
              <path d="M429 181 L565 181 L572 235 L439 235 Z" fill={getCategoryColor(hallDepths.middleSide)} />
              <rect x="222" y="178" width="196" height="60" rx="5" fill={getCategoryColor(hallDepths.middleCenter)} />
              <path d="M116 256 L220 256 L213 310 L106 310 Z" fill={getCategoryColor(hallDepths.bottomSide)} />
              <path d="M420 256 L524 256 L534 310 L427 310 Z" fill={getCategoryColor(hallDepths.bottomSide)} />
              <rect x="232" y="253" width="176" height="58" rx="5" fill={getCategoryColor(hallDepths.bottomCenter)} />
              {renderCategoryLabel(hallDepths.topCenter, 320, 133)}
              {renderCategoryLabel(hallDepths.middleCenter, 320, 208)}
              {renderCategoryLabel(hallDepths.bottomCenter, 320, 282)}
              {renderCategoryLabel(hallDepths.topSide, 145, 139, 10)}
              {renderCategoryLabel(hallDepths.topSide, 495, 139, 10)}
              {renderCategoryLabel(hallDepths.middleSide, 140, 208, 10)}
              {renderCategoryLabel(hallDepths.middleSide, 500, 208, 10)}
              {renderCategoryLabel(hallDepths.bottomSide, 160, 283, 10)}
              {renderCategoryLabel(hallDepths.bottomSide, 480, 283, 10)}
            </g>
          )}
          {layout === 'outdoor' && (
            <g>
              <Stage x={250} y={22} width={140} />
              {outdoorBands.map((categoryIndex, bandIndex) => {
                const bandHeight = 250 / outdoorBands.length;
                const y = 86 + (outdoorBands.length - bandIndex - 1) * bandHeight;
                const inset = (outdoorBands.length - bandIndex - 1) * (120 / outdoorBands.length);
                return (
                  <g key={categoryIndex}>
                    <path
                      d={`M${126 + inset} ${y} L${514 - inset} ${y} L${514 - inset - 12} ${y + bandHeight} L${126 + inset + 12} ${y + bandHeight} Z`}
                      fill={getCategoryColor(categoryIndex)}
                    />
                    {renderCategoryLabel(categoryIndex, 320, y + bandHeight / 2, 10)}
                  </g>
                );
              })}
            </g>
          )}
          {layout === 'stadium' && (
            <g>
              {stadiumBands.map((categoryIndex, bandIndex) => {
                const rx = 275 - bandIndex * stadiumStepX;
                const ry = 165 - bandIndex * stadiumStepY;
                const innerRy = bandIndex === stadiumBands.length - 1
                  ? 40
                  : 165 - (bandIndex + 1) * stadiumStepY;
                return (
                  <g key={categoryIndex}>
                    <ellipse cx="320" cy="195" rx={rx} ry={ry} fill={getCategoryColor(categoryIndex)} />
                    {renderCategoryLabel(categoryIndex, 320, 195 - (ry + innerRy) / 2, 10)}
                  </g>
                );
              })}
              <ellipse cx="320" cy="195" rx="82" ry="40" fill="#0b1220" />
              <rect x="260" y="178" width="120" height="34" rx="5" fill="#f8fafc" />
              <text x="320" y="200" textAnchor="middle" fill="#111827" fontSize="15" fontWeight="700">STAGE</text>
            </g>
          )}
        </svg>
      </div>

      {ticketCategories.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 px-4 py-3">
          {ticketCategories.map((category, index) => (
            <div key={category.id || category.category} className="flex items-center gap-2 text-xs text-white/70">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: getCategoryColor(index) }} />
              {category.category}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

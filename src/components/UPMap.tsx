import { cn } from "@/lib/utils";

interface UPMapProps {
  selectedDistrict?: string;
  selectedLocationName?: string;
  radius?: number;
  className?: string;
}

// Simplified but recognizable UP outline — fully controlled coordinates
const UP_OUTLINE = `
M 180 30
L 210 25 L 240 28 L 270 22 L 300 25 L 330 20 L 360 25
L 380 35 L 400 50 L 410 70 L 420 90 L 425 110
L 430 130 L 435 155 L 440 180 L 442 200
L 445 225 L 448 250 L 450 275 L 448 300
L 445 320 L 438 340 L 428 355 L 415 368
L 398 378 L 378 385 L 355 390 L 330 392
L 305 393 L 280 392 L 255 388 L 230 382
L 210 375 L 195 365 L 182 350 L 172 335
L 165 315 L 158 295 L 152 275 L 148 255
L 145 235 L 143 215 L 142 195 L 145 175
L 150 155 L 158 138 L 168 122 L 178 108
L 190 95 L 198 78 L 200 60 L 185 45
Z
`;

// District positions within the simplified outline (viewBox 130 10 340 400)
const DISTRICTS: Record<string, { x: number; y: number }> = {
  // Northern UP
  "Saharanpur": { x: 310, y: 55 },
  "Shamli": { x: 295, y: 62 },
  "Muzaffarnagar": { x: 305, y: 72 },
  "Bijnor": { x: 320, y: 78 },
  "Amroha": { x: 335, y: 80 },
  "Moradabad": { x: 348, y: 88 },
  "Rampur": { x: 355, y: 95 },
  "Sambhal": { x: 345, y: 95 },
  "Budaun": { x: 355, y: 115 },
  "Bareilly": { x: 350, y: 125 },
  "Pilibhit": { x: 342, y: 118 },
  "Shahjahanpur": { x: 335, y: 135 },
  "Lakhimpur Kheri": { x: 305, y: 105 },
  "Sitapur": { x: 290, y: 125 },
  // Western UP
  "Baghpat": { x: 318, y: 72 },
  "Meerut": { x: 325, y: 75 },
  "Ghaziabad": { x: 340, y: 72 },
  "Hapur": { x: 338, y: 78 },
  "Gautam Buddh Nagar": { x: 350, y: 78 },
  "Bulandshahr": { x: 348, y: 90 },
  "Aligarh": { x: 360, y: 110 },
  "Hathras": { x: 368, y: 125 },
  "Agra": { x: 365, y: 145 },
  "Firozabad": { x: 358, y: 150 },
  "Etah": { x: 352, y: 118 },
  "Mainpuri": { x: 350, y: 130 },
  "Kasganj": { x: 362, y: 122 },
  // Central UP
  "Hardoi": { x: 278, y: 135 },
  "Unnao": { x: 268, y: 150 },
  "Lucknow": { x: 262, y: 155 },
  "Barabanki": { x: 255, y: 158 },
  "Rae Bareli": { x: 258, y: 168 },
  "Amethi": { x: 252, y: 172 },
  "Faizabad": { x: 248, y: 165 },
  "Sultanpur": { x: 245, y: 175 },
  "Pratapgarh": { x: 250, y: 180 },
  "Prayagraj": { x: 260, y: 190 },
  "Fatehpur": { x: 265, y: 185 },
  "Kannauj": { x: 295, y: 165 },
  "Farrukhabad": { x: 300, y: 160 },
  "Etawah": { x: 292, y: 180 },
  "Auraiya": { x: 288, y: 188 },
  "Kanpur Nagar": { x: 278, y: 185 },
  "Kanpur Dehat": { x: 275, y: 192 },
  "Hamirpur": { x: 278, y: 205 },
  "Mahoba": { x: 272, y: 215 },
  "Banda": { x: 268, y: 228 },
  "Chitrakoot": { x: 262, y: 235 },
  "Jhansi": { x: 255, y: 232 },
  "Jalaun": { x: 268, y: 215 },
  "Lalitpur": { x: 248, y: 245 },
  // Eastern UP
  "Azamgarh": { x: 265, y: 148 },
  "Mau": { x: 270, y: 142 },
  "Ghazipur": { x: 278, y: 138 },
  "Varanasi": { x: 282, y: 148 },
  "Chandauli": { x: 288, y: 155 },
  "Mirzapur": { x: 278, y: 168 },
  "Sonbhadra": { x: 282, y: 192 },
  "Bhadohi": { x: 272, y: 158 },
  "Jaunpur": { x: 262, y: 158 },
  "Ambedkar Nagar": { x: 255, y: 162 },
  // Gorakhpur division
  "Gorakhpur": { x: 258, y: 120 },
  "Mahrajganj": { x: 248, y: 112 },
  "Kushinagar": { x: 252, y: 108 },
  "Deoria": { x: 258, y: 115 },
  "Ballia": { x: 272, y: 128 },
  "Basti": { x: 250, y: 128 },
  "Sant Kabir Nagar": { x: 252, y: 135 },
  "Siddharthnagar": { x: 242, y: 128 },
  // Devipatan
  "Gonda": { x: 235, y: 138 },
  "Balrampur": { x: 228, y: 145 },
  "Bahraich": { x: 222, y: 155 },
  "Shravasti": { x: 220, y: 162 },
};

export function UPMap({ selectedDistrict, selectedLocationName, radius, className }: UPMapProps) {
  const selectedDot = selectedDistrict ? DISTRICTS[selectedDistrict] : null;

  return (
    <div className={cn("relative rounded-xl border border-border bg-[#F4F8EF] overflow-hidden", className)}>
      <svg
        viewBox="130 10 340 400"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-label={`Map of Uttar Pradesh${selectedDistrict ? ` showing ${selectedDistrict} district` : ""}`}
      >
        {/* UP outline */}
        <path
          d={UP_OUTLINE}
          fill="#E8F5E9"
          stroke="#2E7D32"
          strokeWidth="1.5"
          opacity="0.85"
          strokeLinejoin="round"
        />

        {/* All district dots */}
        {Object.entries(DISTRICTS).map(([district, pos]) => {
          const isSelected = district === selectedDistrict;
          const dist = selectedDot
            ? Math.hypot(pos.x - selectedDot.x, pos.y - selectedDot.y)
            : 999;
          const isNearby = radius ? dist < radius * 4 : false;

          return (
            <g key={district}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 5 : isNearby ? 3 : 1.8}
                fill={isSelected ? "#15803D" : isNearby ? "#4ade80" : "#86efac"}
                stroke={isSelected ? "#052e16" : "none"}
                strokeWidth={isSelected ? 1.2 : 0}
                opacity={isSelected ? 1 : isNearby ? 0.85 : 0.5}
              />
              {isSelected && (
                <>
                  <circle cx={pos.x} cy={pos.y} r="12" fill="none" stroke="#15803D" strokeWidth="1.5" opacity="0.3">
                    <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  {radius && (
                    <circle cx={pos.x} cy={pos.y} r={radius * 4} fill="none" stroke="#15803D" strokeWidth="1" strokeDasharray="4 3" opacity="0.3" />
                  )}
                  <rect x={pos.x - 32} y={pos.y - 24} width="64" height="16" rx="4" fill="white" fillOpacity="0.9" stroke="#15803D" strokeWidth="0.5" />
                  <text x={pos.x} y={pos.y - 13} textAnchor="middle" fontSize="8" fontWeight="700" fill="#052e16" style={{ fontFamily: "Inter, sans-serif" }}>
                    {selectedLocationName || district}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2.5 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-border/50">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-emerald-700" />
          <span className="text-[9px] font-medium text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-emerald-300" />
          <span className="text-[9px] font-medium text-muted-foreground">Nearby</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
          <span className="text-[9px] font-medium text-muted-foreground">Other</span>
        </div>
      </div>

      {/* State label */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-border/50">
        <span className="text-[10px] font-bold text-emerald-800 tracking-wider uppercase">Uttar Pradesh</span>
      </div>
    </div>
  );
}

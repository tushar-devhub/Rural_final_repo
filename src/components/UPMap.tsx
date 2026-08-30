import { cn } from "@/lib/utils";

interface UPMapProps {
  selectedDistrict?: string;
  selectedLocationName?: string;
  radius?: number;
  className?: string;
}

// Simplified Uttar Pradesh outline path
const UP_OUTLINE = `M 280 30 L 310 25 L 340 30 L 370 25 L 400 30 L 430 35 L 460 40 L 480 55 
L 500 70 L 510 90 L 520 110 L 515 130 L 510 150 L 505 170 L 500 190 
L 495 210 L 500 230 L 505 260 L 510 290 L 505 320 L 500 350 L 490 380 
L 480 400 L 465 420 L 445 435 L 425 445 L 400 450 L 380 455 L 360 460 
L 340 458 L 320 455 L 300 450 L 280 445 L 260 440 L 240 435 L 220 430 
L 200 420 L 185 405 L 175 385 L 165 365 L 155 345 L 145 325 L 135 305 
L 130 285 L 125 265 L 120 245 L 125 225 L 130 205 L 140 185 L 150 170 
L 165 155 L 180 140 L 200 125 L 220 110 L 240 95 L 255 75 L 265 55 
L 275 40 Z`;

// Simplified district boundary hints (dots for major districts)
const DISTRICT_DOTS: Record<string, { x: number; y: number; name: string }> = {
  "Agra": { x: 480, y: 380, name: "Agra" },
  "Aligarh": { x: 420, y: 340, name: "Aligarh" },
  "Ambedkar Nagar": { x: 290, y: 320, name: "Ambedkar Nagar" },
  "Amethi": { x: 260, y: 330, name: "Amethi" },
  "Amroha": { x: 370, y: 200, name: "Amroha" },
  "Auraiya": { x: 370, y: 360, name: "Auraiya" },
  "Azamgarh": { x: 270, y: 270, name: "Azamgarh" },
  "Badaun": { x: 400, y: 260, name: "Budaun" },
  "Baghpat": { x: 340, y: 160, name: "Baghpat" },
  "Bahraich": { x: 170, y: 270, name: "Bahraich" },
  "Ballia": { x: 270, y: 220, name: "Ballia" },
  "Balrampur": { x: 170, y: 310, name: "Balrampur" },
  "Banda": { x: 330, y: 420, name: "Banda" },
  "Barabanki": { x: 220, y: 310, name: "Barabanki" },
  "Bareilly": { x: 380, y: 240, name: "Bareilly" },
  "Basti": { x: 230, y: 280, name: "Basti" },
  "Bhadohi": { x: 270, y: 310, name: "Bhadohi" },
  "Bijnor": { x: 350, y: 190, name: "Bijnor" },
  "Budaun": { x: 400, y: 270, name: "Budaun" },
  "Bulandshahr": { x: 380, y: 200, name: "Bulandshahr" },
  "Chandauli": { x: 300, y: 270, name: "Chandauli" },
  "Chitrakoot": { x: 320, y: 430, name: "Chitrakoot" },
  "Deoria": { x: 260, y: 250, name: "Deoria" },
  "Etah": { x: 430, y: 290, name: "Etah" },
  "Etawah": { x: 370, y: 370, name: "Etawah" },
  "Faizabad": { x: 250, y: 300, name: "Faizabad" },
  "Farrukhabad": { x: 390, y: 310, name: "Farrukhabad" },
  "Fatehpur": { x: 310, y: 370, name: "Fatehpur" },
  "Firozabad": { x: 430, y: 350, name: "Firozabad" },
  "Gautam Buddh Nagar": { x: 410, y: 190, name: "G.B. Nagar" },
  "Ghaziabad": { x: 380, y: 170, name: "Ghaziabad" },
  "Ghazipur": { x: 290, y: 250, name: "Ghazipur" },
  "Gonda": { x: 190, y: 290, name: "Gonda" },
  "Gorakhpur": { x: 240, y: 260, name: "Gorakhpur" },
  "Hamirpur": { x: 340, y: 400, name: "Hamirpur" },
  "Hapur": { x: 380, y: 180, name: "Hapur" },
  "Hardoi": { x: 290, y: 310, name: "Hardoi" },
  "Hathras": { x: 440, y: 350, name: "Hathras" },
  "Jalaun": { x: 350, y: 380, name: "Jalaun" },
  "Jaunpur": { x: 290, y: 300, name: "Jaunpur" },
  "Jhansi": { x: 340, y: 420, name: "Jhansi" },
  "Kannauj": { x: 380, y: 320, name: "Kannauj" },
  "Kanpur Dehat": { x: 340, y: 360, name: "Kanpur Dehat" },
  "Kanpur Nagar": { x: 350, y: 350, name: "Kanpur" },
  "Kasganj": { x: 420, y: 290, name: "Kasganj" },
  "Kaushambi": { x: 300, y: 370, name: "Kaushambi" },
  "Kushinagar": { x: 250, y: 240, name: "Kushinagar" },
  "Lakhimpur Kheri": { x: 270, y: 250, name: "Lakhimpur" },
  "Lucknow": { x: 250, y: 320, name: "Lucknow" },
  "Mahoba": { x: 330, y: 430, name: "Mahoba" },
  "Mahrajganj": { x: 220, y: 250, name: "Mahrajganj" },
  "Mainpuri": { x: 410, y: 310, name: "Mainpuri" },
  "Mathura": { x: 460, y: 360, name: "Mathura" },
  "Mau": { x: 270, y: 260, name: "Mau" },
  "Meerut": { x: 360, y: 170, name: "Meerut" },
  "Mirzapur": { x: 300, y: 320, name: "Mirzapur" },
  "Moradabad": { x: 370, y: 210, name: "Moradabad" },
  "Muzaffarnagar": { x: 340, y: 170, name: "Muzaffarnagar" },
  "Pilibhit": { x: 380, y: 230, name: "Pilibhit" },
  "Pratapgarh": { x: 260, y: 330, name: "Pratapgarh" },
  "Prayagraj": { x: 300, y: 350, name: "Prayagraj" },
  "Raebareli": { x: 240, y: 330, name: "Raebareli" },
  "Rampur": { x: 370, y: 220, name: "Rampur" },
  "Saharanpur": { x: 330, y: 140, name: "Saharanpur" },
  "Sambhal": { x: 380, y: 220, name: "Sambhal" },
  "Sant Kabir Nagar": { x: 230, y: 270, name: "S.K. Nagar" },
  "Shahjahanpur": { x: 370, y: 250, name: "Shahjahanpur" },
  "Shamli": { x: 340, y: 160, name: "Shamli" },
  "Shravasti": { x: 170, y: 290, name: "Shravasti" },
  "Siddharthnagar": { x: 210, y: 270, name: "Siddharthnagar" },
  "Sitapur": { x: 300, y: 280, name: "Sitapur" },
  "Sonbhadra": { x: 300, y: 350, name: "Sonbhadra" },
  "Sultanpur": { x: 250, y: 320, name: "Sultanpur" },
  "Unnao": { x: 280, y: 330, name: "Unnao" },
  "Varanasi": { x: 290, y: 290, name: "Varanasi" },
};

export function UPMap({ selectedDistrict, selectedLocationName, radius, className }: UPMapProps) {
  const selectedDot = selectedDistrict ? DISTRICT_DOTS[selectedDistrict] : null;

  return (
    <div className={cn("relative rounded-xl border border-border bg-[#F4F8EF] overflow-hidden", className)}>
      <svg
        viewBox="80 10 460 470"
        className="w-full h-full"
        aria-label={`Map of Uttar Pradesh${selectedDistrict ? ` showing ${selectedDistrict} district` : ""}`}
      >
        {/* Background */}
        <rect x="80" y="10" width="460" height="470" fill="transparent" />

        {/* UP outline */}
        <path
          d={UP_OUTLINE}
          fill="#E8F5E9"
          stroke="#2E7D32"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* District dots — show all */}
        {Object.entries(DISTRICT_DOTS).map(([district, dot]) => {
          const isSelected = district === selectedDistrict;
          const isNearby = selectedDot && radius
            ? Math.hypot(dot.x - selectedDot.x, dot.y - selectedDot.y) < radius * 8
            : false;

          return (
            <g key={district}>
              <circle
                cx={dot.x}
                cy={dot.y}
                r={isSelected ? 6 : isNearby ? 4 : 2.5}
                fill={isSelected ? "#15803D" : isNearby ? "#4ade80" : "#86efac"}
                stroke={isSelected ? "#052e16" : "transparent"}
                strokeWidth={isSelected ? 1.5 : 0}
                opacity={isSelected ? 1 : isNearby ? 0.9 : 0.5}
              />
              {isSelected && (
                <>
                  {/* Pulsing ring for selected district */}
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r="14"
                    fill="none"
                    stroke="#15803D"
                    strokeWidth="1.5"
                    opacity="0.4"
                  >
                    <animate
                      attributeName="r"
                      values="10;18;10"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.4;0.1;0.4"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  {/* Radius circle */}
                  {radius && (
                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r={radius * 8}
                      fill="none"
                      stroke="#15803D"
                      strokeWidth="1"
                      strokeDasharray="4 3"
                      opacity="0.3"
                    />
                  )}
                  {/* Label */}
                  <text
                    x={dot.x}
                    y={dot.y - 12}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-emerald-900"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {selectedLocationName || dot.name}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Map legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-border/50">
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

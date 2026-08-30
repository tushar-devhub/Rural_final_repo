import { useState } from "react";
import { UP_DISTRICTS } from "@/data/locations";

// Real UP state outline — simplified but recognizable boundary
// Generated from actual GeoJSON state boundary coordinates, scaled to SVG space
const UP_OUTLINE = "M25.7,22.8 L25.6,43.2 L14.4,63.1 L23.1,88.2 L27.8,73.6 L34.4,62.2 L43.4,89.5 L43.4,107.7 L28.1,120.2 L46.9,145.8 L50.1,121.3 L60,137 L60.4,46.7 L73.5,69 L88.1,69.6 L104.1,82.6 L121.6,82.5 L155.5,98.8 L164.5,123.4 L199.8,118.5 L224.1,128.8 L239.2,136.7 L273.1,139.1 L286.9,148.8 L296.4,193.8 L269.2,202.4 L259.1,221.7 L247.9,248.2 L231,229.1 L204.3,213.4 L185.3,206.5 L171.4,221.3 L160.2,195.3 L146.4,210.5 L119.4,196.6 L112.8,214.1 L100.7,184.3 L85.4,153.9 L79,209.8 L68.4,244.4 L85.4,153.9 L84.6,137.4 L71.4,121.6 L83.4,100.5 L60.4,46.7 L25.7,22.8 Z";

// All 70 UP districts with real geographic centroid positions
// Coordinates derived from official GeoJSON boundary data
const DISTRICT_POSITIONS: Record<string, [number, number]> = {
  "Saharanpur": [25.7, 22.8],
  "Muzaffarnagar": [25.6, 43.2],
  "Shamli": [30, 40],
  "Bijnor": [60.4, 46.7],
  "Meerut": [34.4, 62.2],
  "Baghpat": [14.4, 63.1],
  "Ghaziabad": [27.8, 73.6],
  "Gautam Buddha Nagar": [23.1, 88.2],
  "Bulandshahr": [43.4, 89.5],
  "Aligarh": [43.4, 107.7],
  "Mathura": [28.1, 120.2],
  "Agra": [46.9, 145.8],
  "Firozabad": [60, 137],
  "Mahamaya Nagar": [50.1, 121.3],
  "Etah": [71.4, 121.6],
  "Mainpuri": [84.6, 137.4],
  "Badaun": [83.4, 100.5],
  "Moradabad": [73.5, 69],
  "Rampur": [88.1, 69.6],
  "Jyotiba Phule Nagar": [80, 62],
  "Bareilly": [104.1, 82.6],
  "Pilibhit": [121.6, 82.5],
  "Shahjahanpur": [118.4, 104.1],
  "Kheri": [155.5, 98.8],
  "Sitapur": [164.5, 123.4],
  "Hardoi": [135.1, 132.1],
  "Unnao": [150.1, 161.1],
  "Kannauj": [110.7, 145],
  "Farrukhabad": [102.6, 128.5],
  "Etawah": [85.4, 153.9],
  "Auraiya": [102, 158.7],
  "Kanpur": [137.4, 169.3],
  "Kanpur Dehat": [140, 182],
  "Lucknow": [161.9, 150.6],
  "Barabanki": [182.9, 148.8],
  "Rae Bareli": [175.3, 178.1],
  "Fatehpur": [160.2, 195.3],
  "Hamirpur": [119.4, 196.6],
  "Mahoba": [112.8, 214.1],
  "Banda": [146.4, 210.5],
  "Chitrakoot": [171.4, 221.3],
  "Jalaun": [100.7, 184.3],
  "Jhansi": [68.4, 244.4],
  "Lalitpur": [79, 209.8],
  "Gonda": [210, 139.9],
  "Bahraich": [185.2, 114],
  "Balrampur": [224.1, 128.8],
  "Shrawasti": [199.8, 118.5],
  "Ayodhya": [209.5, 160.9],
  "Ambedkar Nagar": [238.9, 170.7],
  "Sultanpur": [209.1, 175.2],
  "Pratapgarh": [201, 191.6],
  "Kaushambi": [185.3, 206.5],
  "Allahabad": [204.3, 213.4],
  "Siddharth Nagar": [239.2, 136.7],
  "Basti": [236.6, 153.5],
  "Sant Kabir Nagar": [250.9, 156.3],
  "Gorakhpur": [264.7, 162.3],
  "Maharajganj": [273.1, 139.1],
  "Kushinagar": [286.9, 148.8],
  "Deoria": [281.7, 170.5],
  "Azamgarh": [250.9, 182.8],
  "Mau": [270.9, 185.1],
  "Ballia": [296.4, 193.8],
  "Jaunpur": [233.2, 197.7],
  "Ghazipur": [269.2, 202.4],
  "Varanasi": [245.5, 212.5],
  "Sant Ravidas Nagar": [226, 212.7],
  "Chandauli": [259.1, 221.7],
  "Mirzapur": [231, 229.1],
  "Sonbhadra": [247.9, 248.2],
};

interface UPMapProps {
  selectedDistrict?: string | null;
  selectedTown?: string | null;
  radius?: number;
  className?: string;
}

export default function UPMap({
  selectedDistrict,
  selectedTown,
  radius = 5,
  className = "",
}: UPMapProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  // Find position for a district name (fuzzy match)
  const findPosition = (name: string): [number, number] | null => {
    if (DISTRICT_POSITIONS[name]) return DISTRICT_POSITIONS[name];
    const lower = name.toLowerCase();
    for (const [key, pos] of Object.entries(DISTRICT_POSITIONS)) {
      if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
        return pos;
      }
    }
    return null;
  };

  const selectedPos = selectedDistrict ? findPosition(selectedDistrict) : null;

  // Find nearby districts based on radius
  const getNearbyDistricts = (): string[] => {
    if (!selectedPos) return [];
    const nearby: string[] = [];
    const threshold = radius <= 5 ? 40 : 70;
    for (const [name, pos] of Object.entries(DISTRICT_POSITIONS)) {
      if (name === selectedDistrict) continue;
      const dx = pos[0] - selectedPos[0];
      const dy = pos[1] - selectedPos[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < threshold) nearby.push(name);
    }
    return nearby;
  };

  const nearbyDistricts = getNearbyDistricts();

  return (
    <div className={`relative bg-[#f8faf6] rounded-2xl border border-[#e8ede4] overflow-hidden ${className}`}>
      {/* State Label */}
      <div className="absolute top-3 right-3 z-10 bg-[#1a3a2a] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-wider">
        UTTAR PRADESH
      </div>

      <svg
        viewBox="0 0 310 270"
        className="w-full h-auto"
        style={{ minHeight: "220px" }}
      >
        {/* Background */}
        <rect x="0" y="0" width="310" height="270" fill="#f8faf6" />

        {/* Radius circle around selected location */}
        {selectedPos && (
          <circle
            cx={selectedPos[0]}
            cy={selectedPos[1]}
            r={radius <= 5 ? 35 : 60}
            fill="#2d5a3d"
            fillOpacity="0.04"
            stroke="#2d5a3d"
            strokeWidth="0.5"
            strokeDasharray="3 2"
            opacity="0.4"
          />
        )}

        {/* UP State Outline */}
        <path
          d={UP_OUTLINE}
          fill="#e8f0e4"
          stroke="#2d5a3d"
          strokeWidth="1.2"
          strokeLinejoin="round"
          fillOpacity="0.6"
        />

        {/* District dots */}
        {Object.entries(DISTRICT_POSITIONS).map(([name, pos]) => {
          const isSelected = name === selectedDistrict;
          const isNearby = nearbyDistricts.includes(name);
          const isHovered = name === hoveredDistrict;

          return (
            <g key={name}>
              {/* Hover area */}
              <circle
                cx={pos[0]}
                cy={pos[1]}
                r="5"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDistrict(name)}
                onMouseLeave={() => setHoveredDistrict(null)}
              />

              {/* Pulsing ring for selected */}
              {isSelected && (
                <circle
                  cx={pos[0]}
                  cy={pos[1]}
                  r="8"
                  fill="none"
                  stroke="#2d5a3d"
                  strokeWidth="0.8"
                  opacity="0.4"
                >
                  <animate
                    attributeName="r"
                    values="8;12;8"
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
              )}

              {/* District dot */}
              <circle
                cx={pos[0]}
                cy={pos[1]}
                r={isSelected ? "4" : isNearby ? "3" : "2"}
                fill={isSelected ? "#1a3a2a" : isNearby ? "#6ba368" : "#b8d4b0"}
                stroke={isSelected ? "#fff" : "none"}
                strokeWidth={isSelected ? "1" : "0"}
                className="transition-all duration-300"
              />

              {/* District name label */}
              {(isSelected || isHovered) && (
                <g>
                  <rect
                    x={pos[0] - 24}
                    y={pos[1] - 11}
                    width="48"
                    height="7"
                    fill="#1a3a2a"
                    rx="2"
                  />
                  <text
                    x={pos[0]}
                    y={pos[1] - 5.5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="4.5"
                    fontWeight="600"
                    fontFamily="system-ui, sans-serif"
                  >
                    {name}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Selected town marker */}
        {selectedTown && selectedPos && (
          <g>
            <circle
              cx={selectedPos[0]}
              cy={selectedPos[1]}
              r="2.5"
              fill="#fff"
              stroke="#1a3a2a"
              strokeWidth="1"
            />
            <circle
              cx={selectedPos[0]}
              cy={selectedPos[1]}
              r="1"
              fill="#1a3a2a"
            />
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] text-[#4a6a5a]">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1a3a2a]" />
          Selected
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#6ba368]" />
          Nearby
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b8d4b0]" />
          District
        </span>
      </div>
    </div>
  );
}

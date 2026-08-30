export interface Location {
  id: string;
  name: string;
  district: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  type: "village" | "town" | "block";
  population: number;
  households: number;
}

export const locations: Location[] = [
  { id: "loc-1", name: "Rampur", district: "Budaun", state: "Uttar Pradesh", pincode: "243601", lat: 27.87, lng: 79.02, type: "town", population: 28500, households: 4200 },
  { id: "loc-2", name: "Kasganj", district: "Kasganj", state: "Uttar Pradesh", pincode: "207123", lat: 27.81, lng: 78.64, type: "block", population: 35200, households: 5100 },
  { id: "loc-3", name: "Bisalpur", district: "Pilibhit", state: "Uttar Pradesh", pincode: "262121", lat: 28.21, lng: 79.80, type: "town", population: 22100, households: 3300 },
  { id: "loc-4", name: "Shahjahanpur", district: "Shahjahanpur", state: "Uttar Pradesh", pincode: "242001", lat: 27.88, lng: 79.91, type: "town", population: 42000, households: 6200 },
  { id: "loc-5", name: "Hardoi", district: "Hardoi", state: "Uttar Pradesh", pincode: "241001", lat: 27.42, lng: 80.13, type: "block", population: 31000, households: 4500 },
  { id: "loc-6", name: "Etawah", district: "Etawah", state: "Uttar Pradesh", pincode: "206001", lat: 26.78, lng: 79.02, type: "town", population: 38500, households: 5600 },
  { id: "loc-7", name: "Kannauj", district: "Kannauj", state: "Uttar Pradesh", pincode: "209727", lat: 27.05, lng: 79.92, type: "block", population: 25800, households: 3800 },
  { id: "loc-8", name: "Farrukhabad", district: "Farrukhabad", state: "Uttar Pradesh", pincode: "209625", lat: 27.39, lng: 79.58, type: "town", population: 29400, households: 4300 },
  { id: "loc-9", name: "Mainpuri", district: "Mainpuri", state: "Uttar Pradesh", pincode: "205001", lat: 27.23, lng: 79.02, type: "block", population: 27600, households: 4000 },
  { id: "loc-10", name: "Budaun", district: "Budaun", state: "Uttar Pradesh", pincode: "243001", lat: 28.03, lng: 79.12, type: "town", population: 45000, households: 6600 },
];

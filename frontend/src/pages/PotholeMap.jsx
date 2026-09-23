import React, { useState, useEffect } from 'react';
import { getComplaints } from '../api/complaints';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Search, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Helper to get custom colored marker icons
const getIconUrl = (color) => `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;

const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';

const icons = {
  red: new L.Icon({ iconUrl: getIconUrl('red'), shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
  yellow: new L.Icon({ iconUrl: getIconUrl('gold'), shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
  blue: new L.Icon({ iconUrl: getIconUrl('blue'), shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
  green: new L.Icon({ iconUrl: getIconUrl('green'), shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] })
};

// Logic to determine which icon to show
const getMarkerIcon = (complaint) => {
  if (complaint.status === 'closed') return icons.green; // Repaired
  if (complaint.severity === 'Critical' || complaint.severity === 'High') return icons.red; // High Priority
  if (complaint.status === 'assigned' || complaint.status === 'work_started') return icons.blue; // Assigned
  return icons.yellow; // Pending
};

// Component to programmatically update map view
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function PotholeMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([19.15, 72.99]); // Default: Navi Mumbai area

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await getComplaints();
        setComplaints(data);
      } catch (err) {
        console.error("Failed to load map data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }
  };

  const LegendItem = ({ colorClass, fillClass, label }) => (
    <div className="flex items-center gap-5">
      <MapPin size={38} className={colorClass} fill={fillClass || "currentColor"} strokeWidth={1} />
      <span className="font-bold text-[#1e2a4a] text-[15px]">{label}</span>
    </div>
  );

  return (
    <div className="bg-white min-h-screen py-8 px-4 font-sans flex flex-col">
      <div className="container mx-auto max-w-6xl flex-1 flex flex-col">
        <h1 className="text-2xl font-extrabold text-[#1e2a4a] mb-6">Pothole Map</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" size={26} strokeWidth={2.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search Location"
            className="w-full border border-gray-200 rounded-md py-4 pl-14 pr-4 text-gray-700 outline-none focus:border-[#3b5998] font-medium shadow-sm transition placeholder-gray-300"
          />
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8 flex-1 pb-10">
          
          {/* Map Section */}
          <div className="flex-1 h-[600px] bg-gray-100 rounded-xl overflow-hidden shadow-sm relative z-0 border border-gray-200">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">Loading Map...</div>
            ) : (
              <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer 
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapUpdater center={mapCenter} />
                
                {complaints.map(c => (
                  <Marker 
                    key={c.complaint_code} 
                    position={[c.latitude, c.longitude]}
                    icon={getMarkerIcon(c)}
                  >
                    <Popup className="font-sans">
                      <div className="p-1">
                        <strong className="text-[#3b5998] text-sm block mb-1">{c.complaint_code}</strong>
                        <span className="text-gray-600 text-xs block mb-2">{c.location}</span>
                        <a href={`/complaints/${c.complaint_code}`} className="text-blue-500 hover:underline text-xs font-bold">
                          View Details &rarr;
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>

          {/* Legend Section */}
          <div className="w-full lg:w-64 h-fit border border-gray-200 bg-white shadow-sm p-8 flex flex-col gap-8 flex-shrink-0">
            <LegendItem colorClass="text-[#ea4335]" label="High Priority" />
            <LegendItem colorClass="text-[#fbbc04]" label="Pending" />
            <LegendItem colorClass="text-[#3b5998]" label="Assigned" />
            <LegendItem colorClass="text-[#34a853]" label="Repaired" />
          </div>

        </div>
      </div>
    </div>
  );
}

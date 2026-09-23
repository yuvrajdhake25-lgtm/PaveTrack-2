import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getComplaints } from '../api/complaints';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ClipboardList, Clock, Check, Megaphone, MapPin, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await getComplaints();
        // Just sort to show latest first
        const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setComplaints(sorted);
      } catch (err) {
        console.error("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'closed').length;
  const inProgress = total - resolved;
  const announcements = 3; // Static as per design

  // Stats Card Component
  const StatCard = ({ icon: Icon, color, bg, title, value }) => (
    <div className="border border-[#d0d7e5] rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 bg-white shadow-sm">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${bg} shrink-0`}>
        <Icon className={color} size={28} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col text-right flex-1 pr-1 sm:pr-2">
        <span className="text-gray-500 text-[11px] sm:text-xs font-bold mb-1">{title}</span>
        <span className="text-xl sm:text-2xl font-extrabold text-gray-800">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen py-8 px-4 font-sans">
      <div className="container mx-auto max-w-6xl">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1e2a4a] mb-1">Hello, {user?.name || 'Citizen'}!</h1>
          <p className="text-gray-500 font-medium">Welcome to your dashboard</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={ClipboardList} color="text-blue-600" bg="bg-blue-100" title="Total Complaints" value={total} />
          <StatCard icon={Clock} color="text-orange-500" bg="bg-orange-100" title="In Progress" value={inProgress} />
          <StatCard icon={Check} color="text-green-600" bg="bg-green-200" title="Resolved" value={resolved} />
          <StatCard icon={Megaphone} color="text-purple-500" bg="bg-purple-200" title="Announcements" value={announcements} />
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-extrabold text-[#3b5998]">Recent Complaints</h2>
              <button 
                onClick={() => navigate('/track')} 
                className="border border-[#b8c2d8] text-gray-500 hover:bg-gray-50 text-[11px] font-bold px-3 py-1 rounded-full transition"
              >
                View all
              </button>
            </div>

            {/* Recent Complaints List */}
            <div className="border border-[#d0d7e5] rounded-xl bg-white shadow-sm flex flex-col mb-8 overflow-hidden">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading complaints...</div>
              ) : complaints.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No recent complaints found.</div>
              ) : (
                complaints.slice(0, 3).map((complaint, idx) => (
                  <div 
                    key={complaint.complaint_code} 
                    onClick={() => navigate(`/complaints/${complaint.complaint_code}`)}
                    className={`flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition ${idx !== 2 ? 'border-b border-[#d0d7e5]' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Clock size={22} className="text-green-600" />
                      </div>
                      {/* Details */}
                      <div className="flex flex-col">
                        <span className="font-bold text-[#3b5998] text-[15px]">{complaint.complaint_code}</span>
                        <span className="text-gray-600 text-xs font-medium mt-0.5">
                          {complaint.location.split(',')[0]} : {formatDate(complaint.created_at)}
                        </span>
                      </div>
                    </div>
                    {/* Status Pill */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      complaint.status === 'closed' 
                        ? 'bg-[#dcfce7] text-[#16a34a]' 
                        : 'bg-[#ffedd5] text-[#f97316]'
                    }`}>
                      {complaint.status === 'closed' ? 'Resolved' : 'In Progress'}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Your Area Box */}
            <div className="border border-[#d0d7e5] rounded-xl bg-white shadow-sm p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                <MapPin className="text-[#3b5998]" size={36} fill="currentColor" strokeWidth={1} />
                <div className="flex flex-col">
                  <span className="text-[#3b5998] font-bold text-sm">Your Area</span>
                  <span className="text-[#3b5998] font-bold text-lg">{user?.area || 'Airoli, Navi Mumbai'}</span>
                </div>
              </div>
              <ChevronDown className="text-gray-500" size={24} />
            </div>

          </div>

          {/* Right Column (Map) */}
          <div className="h-full min-h-[400px] border border-[#d0d7e5] rounded-xl overflow-hidden shadow-sm relative z-0">
            <MapContainer 
              center={[19.15, 72.99]} // Default Navi Mumbai
              zoom={11} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {!loading && complaints.map(c => (
                <Marker key={c.complaint_code} position={[c.latitude, c.longitude]}>
                  <Popup>
                    <strong>{c.complaint_code}</strong><br />
                    {c.location}<br />
                    Status: {c.status}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

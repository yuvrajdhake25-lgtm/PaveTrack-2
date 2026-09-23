import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { createComplaint } from '../api/complaints';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, ChevronDown, Plus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
}

export default function ReportPothole() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    location: '',
    severity: 'Medium',
    description: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [latLng, setLatLng] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [mapCenter, setMapCenter] = useState([19.076, 72.877]); // Default: Mumbai
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSearchLocation = async () => {
    if (!form.location) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapCenter([lat, lon]);
        setLatLng({ lat: lat, lng: lon }); // Automatically drop the pin!
        setMarkerPos({ lat: lat, lng: lon });
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  // Compress image before upload to speed up submission
  const compressImage = (file, maxWidthPx = 1024, quality = 0.75) => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidthPx / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', quality);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      const compressed = await compressImage(file);
      setPhoto(compressed);
    }
  };

  const [submitted, setSubmitted] = useState(null); // stores complaint_code after success

  const handleMapClick = (latlng) => {
    setLatLng(latlng);
    setMarkerPos(latlng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) { setError('Please upload a photo of the pothole.'); return; }
    if (!latLng) { setError('Please select the pothole location on the map.'); return; }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('location', form.location);
    formData.append('latitude', latLng.lat);
    formData.append('longitude', latLng.lng);
    formData.append('severity', form.severity);
    formData.append('description', form.description);
    formData.append('photo', photo);

    try {
      const result = await createComplaint(formData);
      setSubmitted(result.complaint_code); // Show success screen
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  // ---- SUCCESS SCREEN ----
  if (submitted) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4 font-sans">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full flex flex-col items-center text-center">
          {/* Checkmark Circle */}
          <div className="w-20 h-20 rounded-full bg-[#3b5998] flex items-center justify-center mb-6 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold text-[#1e2a4a] mb-2">Complaint Submitted!</h2>
          <p className="text-gray-500 font-medium mb-8">Your pothole complaint has been successfully recorded.</p>

          {/* Complaint ID Box */}
          <div className="w-full bg-[#eef2fb] rounded-xl py-5 px-6 mb-6">
            <p className="text-gray-400 text-sm font-semibold mb-1">Complaint ID</p>
            <p className="text-[#3b5998] text-3xl font-extrabold tracking-wide">{submitted}</p>
          </div>

          <p className="text-gray-500 text-sm font-medium mb-8">
            Please save this Complaint ID to track your complaint.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => navigate(`/complaints/${submitted}`)}
              className="w-full bg-[#3b5998] hover:bg-[#2d4373] text-white font-bold py-3 rounded-xl transition"
            >
              View Complaint Details
            </button>
            <button
              onClick={() => navigate('/track')}
              className="w-full border-2 border-[#3b5998] text-[#3b5998] font-bold py-3 rounded-xl hover:bg-[#f4f7fd] transition"
            >
              Track Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-8 px-4 font-sans">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-[#1e2a4a] mb-1">Report a Pothole</h1>
        <p className="text-gray-500 mb-8 font-medium">Help us make your roads safer. Provide the required details below.</p>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Top Grid: Location & Photo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Left Column: Location & Map */}
            <div className="flex flex-col gap-3">
              {/* Location Input Box */}
              <div className="border border-gray-300 rounded-md p-2 flex items-center justify-between bg-white relative">
                <div className="flex items-center gap-3 w-full pl-2">
                  <MapPin className="text-[#3b5998]" size={36} fill="currentColor" strokeWidth={1} />
                  <div className="flex flex-col flex-1">
                    <span className="text-xs font-bold text-[#3b5998]">Location</span>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      onBlur={handleSearchLocation}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchLocation())}
                      className="outline-none text-[#3b5998] font-semibold w-full bg-transparent placeholder-[#3b5998]/50"
                      placeholder="e.g. Airoli, Navi Mumbai"
                      required
                    />
                  </div>
                </div>
                <ChevronDown className="text-gray-500 mr-2" size={20} />
              </div>

              {/* Map Box */}
              <div className="h-[200px] border border-gray-300 rounded-md overflow-hidden bg-gray-100 relative z-0">
                <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                  <LocationPicker onSelect={handleMapClick} />
                  <MapUpdater center={mapCenter} />
                  {markerPos && <Marker position={markerPos} />}
                </MapContainer>
              </div>
              {latLng && (
                <p className="text-green-600 text-xs">✓ Map pinned</p>
              )}
            </div>

            {/* Right Column: Photo Upload */}
            <div className="flex flex-col gap-3">
              {/* Upload Header Box */}
              <div className="border border-gray-300 rounded-md p-3 flex items-center justify-between bg-white">
                <span className="font-bold text-[#3b5998] ml-2">Upload Photo/Video</span>
                <label className="bg-[#aebff0] text-[#3b5998] font-semibold px-4 py-1.5 rounded cursor-pointer hover:bg-blue-300 transition text-sm">
                  Choose File
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>

              {/* Dashed Upload Boxes */}
              <div className="flex gap-4 h-[200px]">
                {/* Box 1 (Preview) */}
                <div className="flex-1 border-2 border-dashed border-[#8ba3db] rounded-md flex items-center justify-center bg-white relative overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Plus className="text-[#8ba3db]" size={28} />
                  )}
                </div>
                {/* Box 2 (Empty) */}
                <div className="flex-1 border-2 border-dashed border-[#8ba3db] rounded-md flex items-center justify-center bg-white">
                  <Plus className="text-[#8ba3db]" size={28} />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block font-bold text-[#3b5998] mb-2 text-lg">Description</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue (optional)"
              className="w-full border border-gray-300 rounded-md p-3 text-gray-700 focus:outline-none focus:border-[#3b5998]"
            />
          </div>

          {/* Severity */}
          <div className="mb-10">
            <label className="block font-bold text-[#3b5998] mb-4 text-lg">Severity</label>
            <div className="flex flex-col sm:flex-row gap-4">
              {['Low', 'Medium', 'High', 'Critical'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm({ ...form, severity: level })}
                  className={`flex-1 py-2.5 rounded-full border transition text-sm sm:text-base ${
                    form.severity === level
                      ? 'bg-[#c3d1f8] border-[#aebff0] text-[#3b5998] font-semibold'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3b5998] hover:bg-[#2d4373] text-white font-bold py-3.5 rounded-md text-lg transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
}

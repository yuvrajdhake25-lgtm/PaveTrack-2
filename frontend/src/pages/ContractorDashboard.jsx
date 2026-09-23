import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getComplaints } from '../api/complaints';
import api from '../api/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ClipboardList, Check, Wrench, ChevronRight, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function ContractorDashboard() {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [repairModal, setRepairModal] = useState(null);
  const [repairPhoto, setRepairPhoto] = useState(null);
  const [repairPreview, setRepairPreview] = useState(null);
  const [submittingRepair, setSubmittingRepair] = useState(false);
  const navigate = useNavigate();

  const fetchComplaints = async () => {
    try {
      const data = await getComplaints();
      // Filter only complaints assigned to or relevant to contractor
      const assigned = data.filter(c =>
        ['assigned', 'work_started', 'repair_submitted', 'ai_verified', 'closed'].includes(c.status)
      );
      setComplaints(assigned.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  const total = complaints.length;
  const inProgress = complaints.filter(c => c.status === 'work_started').length;
  const completed = complaints.filter(c => ['repair_submitted', 'ai_verified', 'closed'].includes(c.status)).length;

  const handleWorkStarted = async (code) => {
    setActionLoading(code);
    try {
      await api.patch(`/complaints/${code}/work-started`);
      fetchComplaints();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setActionLoading('');
    }
  };

  const handleRepairPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRepairPhoto(file);
      setRepairPreview(URL.createObjectURL(file));
    }
  };

  const handleRepairSubmit = async () => {
    if (!repairPhoto || !repairModal) return;
    setSubmittingRepair(true);
    try {
      const formData = new FormData();
      formData.append('photo', repairPhoto);
      formData.append('latitude', repairModal.latitude || 0);
      formData.append('longitude', repairModal.longitude || 0);
      await api.post(`/complaints/${repairModal.code}/repair-submission`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRepairModal(null);
      setRepairPhoto(null);
      setRepairPreview(null);
      fetchComplaints();
    } catch (err) {
      alert('Failed to submit repair');
    } finally {
      setSubmittingRepair(false);
    }
  };

  const StatusPill = ({ status }) => {
    const map = {
      assigned: 'bg-yellow-100 text-yellow-700',
      work_started: 'bg-orange-100 text-orange-700',
      repair_submitted: 'bg-teal-100 text-teal-700',
      ai_verified: 'bg-green-100 text-green-700',
      closed: 'bg-green-200 text-green-800',
    };
    const label = {
      assigned: 'Assigned', work_started: 'Work Started',
      repair_submitted: 'Repair Submitted', ai_verified: 'AI Verified', closed: 'Closed'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {label[status] || status}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, color, bg, title, value }) => (
    <div className="border border-[#d0d7e5] rounded-xl p-4 flex items-center gap-4 bg-white shadow-sm">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${bg} shrink-0`}>
        <Icon className={color} size={28} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col text-right flex-1 pr-2">
        <span className="text-gray-500 text-xs font-bold mb-1">{title}</span>
        <span className="text-2xl font-extrabold text-gray-800">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen py-8 px-4 font-sans">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1e2a4a] mb-1">Hello, {user?.name || 'Contractor'}!</h1>
          <p className="text-gray-500 font-medium">Contractor Dashboard — Manage your assigned work</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard icon={ClipboardList} color="text-blue-600" bg="bg-blue-100" title="Assigned Complaints" value={total} />
          <StatCard icon={Wrench} color="text-orange-500" bg="bg-orange-100" title="Work In Progress" value={inProgress} />
          <StatCard icon={Check} color="text-green-600" bg="bg-green-200" title="Completed" value={completed} />
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Assigned Complaints List */}
          <div>
            <h2 className="text-xl font-extrabold text-[#3b5998] mb-4">My Assignments</h2>
            <div className="border border-[#d0d7e5] rounded-xl bg-white shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : complaints.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No assignments yet.</div>
              ) : (
                complaints.map((c, idx) => (
                  <div
                    key={c.complaint_code}
                    className={`p-4 ${idx !== complaints.length - 1 ? 'border-b border-[#d0d7e5]' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <button
                          onClick={() => navigate(`/complaints/${c.complaint_code}`)}
                          className="font-bold text-[#3b5998] hover:underline text-sm"
                        >
                          {c.complaint_code}
                        </button>
                        <p className="text-gray-500 text-xs mt-0.5">{c.location} · {formatDate(c.created_at)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Severity: <span className={`font-bold ${c.severity === 'High' || c.severity === 'Critical' ? 'text-red-500' : 'text-yellow-600'}`}>{c.severity}</span></p>
                      </div>
                      <StatusPill status={c.status} />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {/* Mark Work Started */}
                      {c.status === 'assigned' && (
                        <button
                          onClick={() => handleWorkStarted(c.complaint_code)}
                          disabled={actionLoading === c.complaint_code}
                          className="text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-full transition disabled:opacity-50 flex items-center gap-1"
                        >
                          <Wrench size={12} />
                          {actionLoading === c.complaint_code ? 'Updating...' : 'Mark Work Started'}
                        </button>
                      )}

                      {/* Submit Repair */}
                      {c.status === 'work_started' && (
                        <button
                          onClick={() => setRepairModal({ code: c.complaint_code, latitude: c.latitude, longitude: c.longitude })}
                          className="text-xs font-bold bg-[#3b5998] hover:bg-[#2d4373] text-white px-3 py-1.5 rounded-full transition flex items-center gap-1"
                        >
                          <Upload size={12} />
                          Submit Repair
                        </button>
                      )}

                      {/* View Details */}
                      <button
                        onClick={() => navigate(`/complaints/${c.complaint_code}`)}
                        className="text-xs font-bold border border-gray-300 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-50 transition flex items-center gap-1"
                      >
                        View <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Map */}
          <div className="h-[560px] border border-[#d0d7e5] rounded-xl overflow-hidden shadow-sm relative z-0">
            <MapContainer center={[19.15, 72.99]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {!loading && complaints.filter(c => c.latitude && c.longitude).map(c => (
                <Marker key={c.complaint_code} position={[c.latitude, c.longitude]}>
                  <Popup>
                    <strong className="text-[#3b5998]">{c.complaint_code}</strong><br />
                    {c.location}<br />
                    <span className="text-xs">Status: {c.status}</span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Submit Repair Modal */}
      {repairModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-extrabold text-[#1e2a4a]">Submit Repair</h3>
              <button onClick={() => { setRepairModal(null); setRepairPhoto(null); setRepairPreview(null); }} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Complaint: <strong className="text-[#3b5998]">{repairModal.code}</strong></p>

            {/* Photo Upload */}
            <div
              className="border-2 border-dashed border-[#3b5998] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer mb-6 bg-[#f4f7fd] hover:bg-[#eef2fb] transition"
              onClick={() => document.getElementById('repair-photo-input').click()}
            >
              {repairPreview ? (
                <img src={repairPreview} alt="After repair" className="w-full h-40 object-cover rounded-lg" />
              ) : (
                <>
                  <Upload size={32} className="text-[#3b5998] mb-2" />
                  <p className="text-[#3b5998] font-bold text-sm">Upload After-Repair Photo</p>
                  <p className="text-gray-400 text-xs mt-1">Click to choose a file</p>
                </>
              )}
            </div>
            <input id="repair-photo-input" type="file" accept="image/*" className="hidden" onChange={handleRepairPhotoChange} />

            <div className="flex gap-3">
              <button onClick={() => { setRepairModal(null); setRepairPhoto(null); setRepairPreview(null); }} className="flex-1 border-2 border-gray-300 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleRepairSubmit} disabled={!repairPhoto || submittingRepair} className="flex-1 bg-[#3b5998] text-white font-bold py-3 rounded-xl hover:bg-[#2d4373] transition disabled:opacity-50">
                {submittingRepair ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

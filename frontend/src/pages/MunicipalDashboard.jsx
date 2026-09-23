import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getComplaints } from '../api/complaints';
import api from '../api/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ClipboardList, Clock, Check, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MunicipalDashboard() {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null); // holds complaint_code
  const [contractorName, setContractorName] = useState('');
  const [assigning, setAssigning] = useState(false);
  const navigate = useNavigate();

  const fetchComplaints = async () => {
    try {
      const data = await getComplaints();
      setComplaints(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'reported').length;
  const inProgress = complaints.filter(c => !['reported', 'closed'].includes(c.status)).length;
  const resolved = complaints.filter(c => c.status === 'closed').length;

  const handleAssign = async () => {
    if (!contractorName.trim()) return;
    setAssigning(true);
    try {
      await api.patch(`/complaints/${assignModal}/assign`, { contractor_name: contractorName });
      setAssignModal(null);
      setContractorName('');
      fetchComplaints();
    } catch (err) {
      alert('Failed to assign contractor');
    } finally {
      setAssigning(false);
    }
  };

  const StatusPill = ({ status }) => {
    const map = {
      reported: 'bg-blue-100 text-blue-700',
      verified: 'bg-purple-100 text-purple-700',
      assigned: 'bg-yellow-100 text-yellow-700',
      work_started: 'bg-orange-100 text-orange-700',
      repair_submitted: 'bg-teal-100 text-teal-700',
      ai_verified: 'bg-green-100 text-green-700',
      closed: 'bg-green-200 text-green-800',
    };
    const label = {
      reported: 'Reported', verified: 'Verified', assigned: 'Assigned',
      work_started: 'Work Started', repair_submitted: 'Repair Submitted',
      ai_verified: 'AI Verified', closed: 'Resolved'
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
          <h1 className="text-3xl font-extrabold text-[#1e2a4a] mb-1">Hello, {user?.name || 'Municipal Officer'}!</h1>
          <p className="text-gray-500 font-medium">Municipal Dashboard — Manage all pothole complaints</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={ClipboardList} color="text-blue-600" bg="bg-blue-100" title="Total Complaints" value={total} />
          <StatCard icon={Clock} color="text-orange-500" bg="bg-orange-100" title="Pending" value={pending} />
          <StatCard icon={Clock} color="text-yellow-600" bg="bg-yellow-100" title="In Progress" value={inProgress} />
          <StatCard icon={Check} color="text-green-600" bg="bg-green-200" title="Resolved" value={resolved} />
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* All Complaints List */}
          <div>
            <h2 className="text-xl font-extrabold text-[#3b5998] mb-4">All Complaints</h2>
            <div className="border border-[#d0d7e5] rounded-xl bg-white shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : complaints.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No complaints found.</div>
              ) : (
                complaints.map((c, idx) => (
                  <div
                    key={c.complaint_code}
                    className={`p-4 ${idx !== complaints.length - 1 ? 'border-b border-[#d0d7e5]' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <button
                          onClick={() => navigate(`/complaints/${c.complaint_code}`)}
                          className="font-bold text-[#3b5998] hover:underline text-sm"
                        >
                          {c.complaint_code}
                        </button>
                        <p className="text-gray-500 text-xs mt-0.5">{c.location} · {formatDate(c.created_at)}</p>
                        {c.assigned_contractor && (
                          <p className="text-xs text-green-700 font-semibold mt-0.5">Assigned to: {c.assigned_contractor}</p>
                        )}
                      </div>
                      <StatusPill status={c.status} />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => { setAssignModal(c.complaint_code); setContractorName(c.assigned_contractor || ''); }}
                        className="text-xs font-bold border border-[#3b5998] text-[#3b5998] px-3 py-1.5 rounded-full hover:bg-[#f4f7fd] transition"
                      >
                        {c.assigned_contractor ? 'Reassign' : 'Assign Contractor'}
                      </button>
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

      {/* Assign Contractor Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-[#1e2a4a]">Assign Contractor</h3>
              <button onClick={() => setAssignModal(null)} className="text-gray-400 hover:text-gray-700"><X size={24} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Complaint: <strong className="text-[#3b5998]">{assignModal}</strong></p>
            <input
              type="text"
              value={contractorName}
              onChange={e => setContractorName(e.target.value)}
              placeholder="Enter contractor name..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-[#3b5998] font-medium"
            />
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="flex-1 border-2 border-gray-300 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleAssign} disabled={assigning} className="flex-1 bg-[#3b5998] text-white font-bold py-3 rounded-xl hover:bg-[#2d4373] transition disabled:opacity-50">
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

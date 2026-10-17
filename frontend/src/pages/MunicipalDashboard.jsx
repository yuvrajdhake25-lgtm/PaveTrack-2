import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getComplaints, getPendingApprovals, approveUser, rejectUser } from '../api/complaints';
import api from '../api/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ClipboardList, Clock, Check, ChevronRight, X, Brain, AlertTriangle, Wrench, UserCheck, UserX, ShieldCheck } from 'lucide-react';
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
  const [pendingContractors, setPendingContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null); // holds complaint_code
  const [contractorName, setContractorName] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'contractors'
  const [actionLoading, setActionLoading] = useState('');
  const [approvalFeedback, setApprovalFeedback] = useState('');
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [complaintsData, contractorsData] = await Promise.all([
        getComplaints(),
        getPendingApprovals().catch(() => [])
      ]);
      setComplaints((complaintsData || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setPendingContractors(contractorsData || []);
    } catch (err) {
      console.error('Failed to load municipal dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleApproveContractor = async (contractorId, name) => {
    setActionLoading(contractorId);
    setApprovalFeedback('');
    try {
      await approveUser(contractorId);
      setApprovalFeedback(`Authorized contractor: ${name}`);
      setPendingContractors(prev => prev.filter(c => c._id !== contractorId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to approve contractor');
    } finally {
      setActionLoading('');
    }
  };

  const handleRejectContractor = async (contractorId, name) => {
    if (!window.confirm(`Reject contractor registration for ${name}?`)) return;
    setActionLoading(contractorId);
    setApprovalFeedback('');
    try {
      await rejectUser(contractorId);
      setApprovalFeedback(`Rejected registration for ${name}`);
      setPendingContractors(prev => prev.filter(c => c._id !== contractorId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reject contractor');
    } finally {
      setActionLoading('');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  const total = complaints.length;
  const unresolved = complaints.filter(c => c.status !== 'closed').length;
  const aiVerified = complaints.filter(c => c.status === 'ai_verified' || c.status === 'closed').length;
  const manualReviews = complaints.filter(c => c.status === 'manual_review').length;

  const handleAssign = async () => {
    if (!contractorName.trim()) return;
    setAssigning(true);
    try {
      await api.patch(`/complaints/${assignModal}/assign`, { contractor_name: contractorName });
      setAssignModal(null);
      setContractorName('');
      fetchDashboardData();
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
      manual_review: 'bg-red-100 text-red-700',
      closed: 'bg-green-200 text-green-800',
    };
    const label = {
      reported: 'Reported', verified: 'Verified', assigned: 'Assigned',
      work_started: 'Work Started', repair_submitted: 'Repair Submitted',
      ai_verified: 'AI Verified', manual_review: 'Manual Review', closed: 'Resolved'
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
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1e2a4a] mb-1">Hello, {user?.name || 'Municipal Officer'}!</h1>
            <p className="text-gray-500 font-medium">Municipal Dashboard — Manage accountability, road works, and contractor authorization</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="self-start md:self-auto bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold text-[#1e2a4a] shadow-sm transition"
          >
            Refresh Data
          </button>
        </div>

        {/* Feedback Banner */}
        {approvalFeedback && (
          <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-xl text-xs font-bold mb-6 flex justify-between items-center">
            <span>{approvalFeedback}</span>
            <button onClick={() => setApprovalFeedback('')} className="text-green-700 hover:text-black">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ClipboardList} color="text-blue-600" bg="bg-blue-100" title="Total Reports" value={total} />
          <StatCard icon={Clock} color="text-orange-500" bg="bg-orange-100" title="Unresolved Issues" value={unresolved} />
          <StatCard icon={Brain} color="text-green-600" bg="bg-green-100" title="AI-Verified Repairs" value={aiVerified} />
          <StatCard icon={Wrench} color="text-purple-600" bg="bg-purple-100" title="Pending Contractors" value={pendingContractors.length} />
        </div>

        {/* View Switcher Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-6 py-3 text-sm font-extrabold rounded-t-xl border-b-2 transition flex items-center gap-2 ${
              activeTab === 'complaints'
                ? 'border-[#3b5998] text-[#3b5998] bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ClipboardList size={16} /> Complaints & City Map
          </button>
          <button
            onClick={() => setActiveTab('contractors')}
            className={`px-6 py-3 text-sm font-extrabold rounded-t-xl border-b-2 transition flex items-center gap-2 ${
              activeTab === 'contractors'
                ? 'border-[#3b5998] text-[#3b5998] bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldCheck size={16} /> Contractor Approvals
            {pendingContractors.length > 0 && (
              <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingContractors.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 2: Contractor Approvals View */}
        {activeTab === 'contractors' && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#3b5998]">Contractor Registration Approvals</h2>
                <p className="text-xs text-gray-500">
                  Municipal authorities can verify and grant road repair assignment rights to verified contractors.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 font-bold">
                Loading contractor requests...
              </div>
            ) : pendingContractors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <Check size={40} className="text-green-500 mx-auto mb-2" />
                <h3 className="font-extrabold text-gray-800 text-base">All Contractors Approved</h3>
                <p className="text-gray-500 text-xs mt-1">There are no pending contractor applications awaiting municipal authorization.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingContractors.map(c => (
                  <div key={c._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-blue-100 text-blue-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
                          🛠️ Road Contractor
                        </span>
                        <span className="text-[11px] text-gray-400">Registered: {formatDate(c.created_at)}</span>
                      </div>
                      <h3 className="text-lg font-black text-[#1e2a4a]">{c.name}</h3>
                      <p className="text-xs font-mono text-gray-500 mb-3">{c.email}</p>
                      
                      <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 mb-4 space-y-1">
                        <p><strong className="text-gray-800">Phone:</strong> {c.phone || 'Not provided'}</p>
                        <p><strong className="text-gray-800">Operating Area:</strong> {c.area || 'All Sectors'}</p>
                        <p><strong className="text-gray-800">Status:</strong> <span className="text-amber-600 font-bold">Pending Municipal Approval</span></p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleRejectContractor(c._id, c.name)}
                        disabled={actionLoading === c._id}
                        className="flex-1 py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <UserX size={14} /> Reject
                      </button>
                      <button
                        onClick={() => handleApproveContractor(c._id, c.name)}
                        disabled={actionLoading === c._id}
                        className="flex-1 py-2 px-3 bg-[#3b5998] hover:bg-[#2d4373] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        <UserCheck size={14} /> {actionLoading === c._id ? 'Approving...' : 'Authorize Contractor'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Complaints & Map View */}
        {activeTab === 'complaints' && (
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
        )}
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

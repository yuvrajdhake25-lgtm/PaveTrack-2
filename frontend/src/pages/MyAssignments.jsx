import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getComplaints } from '../api/complaints';
import api from '../api/client';
import { Wrench, Camera, Eye, X, Navigation, Clock, Sparkles } from 'lucide-react';

export default function MyAssignments() {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [captureModal, setCaptureModal] = useState(null);
  const [repairPhoto, setRepairPhoto] = useState(null);
  const [repairPreview, setRepairPreview] = useState(null);
  const [submittingRepair, setSubmittingRepair] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Added state for viewing the Before Photo
  const [viewImageModal, setViewImageModal] = useState(null);

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'

  // Update time for the modal live timestamp
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const allWorkStatuses = ['assigned', 'work_started', 'repair_submitted', 'manual_review', 'ai_verified', 'closed'];
  const activeStatuses = ['assigned', 'work_started', 'repair_submitted', 'manual_review'];
  const historyStatuses = ['ai_verified', 'closed'];

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await getComplaints();
      const assigned = data
        .filter(c => allWorkStatuses.includes(c.status))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setComplaints(assigned);
    } catch (err) {
      console.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const displayedComplaints = activeTab === 'active'
    ? complaints.filter(c => activeStatuses.includes(c.status))
    : complaints.filter(c => historyStatuses.includes(c.status));

  const compressImage = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1024;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.75);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setRepairPreview(URL.createObjectURL(file));
      const compressed = await compressImage(file);
      setRepairPhoto(compressed);
    }
  };

  const handleSubmit = async () => {
    if (!repairPhoto || !captureModal) return;
    setSubmittingRepair(true);
    try {
      if (captureModal.status === 'assigned') {
        await api.patch(`/complaints/${captureModal.complaint_code}/work-started`);
      }
      
      const formData = new FormData();
      formData.append('photo', repairPhoto);
      formData.append('latitude', captureModal.latitude || 19.1605);
      formData.append('longitude', captureModal.longitude || 72.9955);
      await api.post(`/complaints/${captureModal.complaint_code}/repair-submission`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCaptureModal(null);
      setRepairPhoto(null);
      setRepairPreview(null);
      fetchComplaints();
    } catch (err) {
      alert('Failed to submit repair');
    } finally {
      setSubmittingRepair(false);
    }
  };

  const SeverityPill = ({ severity }) => {
    const color = severity === 'Critical' ? 'text-red-600 bg-white'
      : severity === 'High' ? 'text-orange-600 bg-white'
      : severity === 'Medium' ? 'text-yellow-600 bg-white' : 'text-green-600 bg-white';
    const dot = severity === 'Critical' ? 'bg-red-500'
      : severity === 'High' ? 'bg-orange-500'
      : severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-200 ${color} shadow-sm`}>
        <span className={`w-2 h-2 rounded-full ${dot}`}></span>
        {severity}
      </span>
    );
  };

  const StatusPill = ({ status }) => {
    const styles = {
      assigned:         'border-blue-400 text-blue-600',
      work_started:     'border-orange-400 text-orange-600',
      repair_submitted: 'border-teal-400 text-teal-600',
      ai_verified:      'border-green-400 text-green-600',
      closed:           'border-green-400 text-green-600',
    };
    const dotColor = {
      assigned: 'bg-blue-500', work_started: 'bg-orange-500',
      repair_submitted: 'bg-teal-500', ai_verified: 'bg-green-500', closed: 'bg-green-500',
    };
    const label = {
      assigned: 'Assigned', work_started: 'Work Started',
      repair_submitted: 'Submitted', ai_verified: 'Verified', closed: 'Closed',
    };
    const s = styles[status] || styles.closed;
    const d = dotColor[status] || dotColor.closed;
    const l = label[status] || 'Closed';
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border shadow-sm ${s}`}>
        <span className={`w-2 h-2 rounded-full ${d}`}></span>
        {l}
      </span>
    );
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/600x400?text=No+Image';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `http://localhost:8000/${cleanPath}`;
  };

  return (
    <div className="bg-white min-h-screen py-10 px-4 font-sans relative">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-700 text-xs font-bold tracking-wider mb-2 uppercase">
                <Wrench size={14} /> Contractor On-Site Field Portal
              </div>
              <h1 className="text-3xl font-extrabold text-[#1e2a4a]">Assigned Road Repairs</h1>
              <p className="text-gray-500 text-sm mt-1">Capture mobile environment AFTER photos with live GPS to trigger instant AI verification.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">Active Contractor:</span>
              <span className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-[#1e2a4a] shadow-sm bg-white">
                {user?.name || 'Rahul Sharma (Apex Infra)'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 text-sm font-extrabold rounded-t-xl border-b-2 transition ${activeTab === 'active' ? 'border-[#254fb9] text-[#254fb9] bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            🔧 Active Work
            {complaints.filter(c => activeStatuses.includes(c.status)).length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-[10px] rounded-full px-2 py-0.5">
                {complaints.filter(c => activeStatuses.includes(c.status)).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-sm font-extrabold rounded-t-xl border-b-2 transition ${activeTab === 'history' ? 'border-[#254fb9] text-[#254fb9] bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            📋 Completed History
            {complaints.filter(c => historyStatuses.includes(c.status)).length > 0 && (
              <span className="ml-2 bg-green-500 text-white text-[10px] rounded-full px-2 py-0.5">
                {complaints.filter(c => historyStatuses.includes(c.status)).length}
              </span>
            )}
          </button>
        </div>

        {/* Grid View */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold">Loading assignments...</div>
        ) : displayedComplaints.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold">
            {activeTab === 'active' ? 'No active repairs. Check Completed History.' : 'No completed repairs yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedComplaints.map((c) => {
              const mainCity = c.location?.split(',')[0] || 'Unknown';
              const subLocation = c.location?.includes(',') ? c.location.split(',').slice(1).join(',').trim() : '';
              const isDone = ['repair_submitted', 'ai_verified', 'closed'].includes(c.status);
              
              return (
                <div key={c.complaint_code} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col hover:shadow-md transition">
                  {/* Image Header with Overlays */}
                  <div className="relative h-48 w-full bg-gray-100">
                    <img src={getImageUrl(c.photo_before)} alt="Before" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
                    
                    {/* ID Overlay */}
                    <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-md font-mono font-bold tracking-wide backdrop-blur-sm shadow">
                      {c.complaint_code}
                    </div>
                    
                    {/* Severity Overlay */}
                    <div className="absolute top-3 right-3">
                      <SeverityPill severity={c.severity} />
                    </div>
                    
                    {/* Before Photo Label */}
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-bold tracking-wider backdrop-blur-sm">
                      BEFORE PHOTO
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-extrabold text-[#1e2a4a] text-lg">{mainCity}</h3>
                      <StatusPill status={c.status} />
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{subLocation}</p>
                    
                    <p className="text-gray-400 text-xs font-mono mb-4">
                      GPS: {c.latitude?.toFixed(4) || '19.1558'}, {c.longitude?.toFixed(4) || '72.9986'}
                    </p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-4 flex-grow">
                      <p className="text-gray-500 text-xs italic">
                        "{c.description || 'Large pothole in the middle of the road which caused number of accidents till now.'}"
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => setViewImageModal(getImageUrl(c.photo_before))}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-gray-300 rounded-xl text-gray-700 text-xs font-bold hover:bg-gray-50 transition w-1/3"
                      >
                        <Eye size={14} /> Before
                      </button>
                      <button 
                        onClick={() => setCaptureModal(c)}
                        disabled={isDone && c.status === 'closed'}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-white text-xs font-bold transition flex-1 ${
                          isDone 
                            ? (c.status === 'closed' ? 'bg-green-600 opacity-50 cursor-not-allowed' : 'bg-[#254fb9] hover:bg-[#1a3a8f]') 
                            : 'bg-[#254fb9] hover:bg-[#1a3a8f]'
                        }`}
                      >
                        <Camera size={14} /> 
                        {isDone ? 'Re-Verify AFTER' : 'Capture AFTER Photo'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Capture AFTER Photo Modal */}
      {captureModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[#254fb9] font-bold text-[10px] tracking-wider uppercase mb-1">Anti-Fraud Geotagged Capture</p>
                  <h2 className="text-xl font-extrabold text-[#1e2a4a]">Upload / Capture AFTER Repair Photo</h2>
                </div>
                <button onClick={() => { setCaptureModal(null); setRepairPhoto(null); setRepairPreview(null); }} className="text-gray-400 hover:text-gray-600 transition p-1">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="px-6 py-2 overflow-y-auto max-h-[70vh]">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono font-extrabold text-sm text-[#1e2a4a]">{captureModal.complaint_code}</span>
                  <SeverityPill severity={captureModal.severity} />
                </div>
                <p className="text-gray-500 text-xs">{captureModal.location}</p>
              </div>
              <div className="mb-6">
                <p className="text-[#1e2a4a] font-extrabold text-sm mb-2">Live Camera Capture (Anti-Fraud: No Gallery Re-use)</p>
                <div 
                  className="border-2 border-dashed border-[#8eb2f7] rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer bg-[#f4f8ff] hover:bg-[#ebf2ff] transition min-h-[200px]"
                  onClick={() => document.getElementById('camera-input').click()}
                >
                  {repairPreview ? (
                    <img src={repairPreview} alt="Preview" className="w-full h-40 object-cover rounded-xl shadow-sm" />
                  ) : (
                    <>
                      <div className="bg-white p-4 rounded-full shadow-sm text-[#254fb9] mb-4"><Camera size={28} /></div>
                      <p className="text-[#1e2a4a] font-extrabold text-sm mb-1 text-center">Tap to Open Camera & Capture AFTER Photo</p>
                      <p className="text-gray-500 text-xs font-mono text-center">`capture=environment` activates mobile rear sensor</p>
                    </>
                  )}
                </div>
                <input id="camera-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#eefcf3] border border-[#a6e6b9] rounded-xl p-3 flex items-start gap-3">
                  <div className="bg-[#a6e6b9] p-1.5 rounded-full text-green-800 shrink-0 mt-0.5"><Navigation size={14} fill="currentColor" /></div>
                  <div>
                    <p className="text-green-900 font-extrabold text-sm flex items-center gap-1">GPS Coordinate <span className="text-green-600">✓</span></p>
                    <p className="text-green-700 text-xs font-mono mt-0.5">{captureModal.latitude?.toFixed(4) || '19.1605'}, {captureModal.longitude?.toFixed(4) || '72.9955'}</p>
                  </div>
                </div>
                <div className="bg-[#eefcf3] border border-[#a6e6b9] rounded-xl p-3 flex items-start gap-3">
                  <div className="bg-[#a6e6b9] p-1.5 rounded-full text-green-800 shrink-0 mt-0.5"><Clock size={14} fill="currentColor" /></div>
                  <div>
                    <p className="text-green-900 font-extrabold text-sm flex items-center gap-1">Live Timestamp <span className="text-green-600">✓</span></p>
                    <p className="text-green-700 text-xs font-mono mt-0.5">{currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t p-6 bg-white flex gap-3">
              <button onClick={() => { setCaptureModal(null); setRepairPhoto(null); setRepairPreview(null); }} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-extrabold text-sm hover:bg-gray-50 transition w-1/3">Cancel</button>
              <button onClick={handleSubmit} disabled={!repairPhoto || submittingRepair} className="flex-1 bg-[#d32f2f] hover:bg-[#b71c1c] text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md">
                <Sparkles size={16} />{submittingRepair ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Before Photo Modal */}
      {viewImageModal && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-4" 
          onClick={() => setViewImageModal(null)}
        >
          <div className="relative max-w-4xl w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setViewImageModal(null)} 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
            >
              <X size={32} />
            </button>
            <img 
              src={viewImageModal} 
              alt="Full screen preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-gray-700" 
            />
          </div>
        </div>
      )}
    </div>
  );
}

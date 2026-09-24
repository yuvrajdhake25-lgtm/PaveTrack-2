import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaint } from '../api/complaints';
import { MapPin, Calendar, Activity, User, ChevronRight, Check } from 'lucide-react';

const STAGES = [
  'Reported',
  'Verified',
  'Assigned',
  'Work Started',
  'Repair Submitted',
  'AI Verification',
  'Closed'
];

const STATUS_MAP = {
  'reported': 0,
  'verified': 1,
  'assigned': 2,
  'work_started': 3,
  'repair_submitted': 4,
  'ai_verified': 5,
  'closed': 6
};

export default function PotholeDetails() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const data = await getComplaint(code);
        setComplaint(data);
      } catch (err) {
        setError('Complaint not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [code]);

  if (loading) return <div className="text-center py-20 text-xl font-bold text-gray-500">Loading details...</div>;
  if (error || !complaint) return <div className="text-center py-20 text-red-500 font-bold text-xl">{error}</div>;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const currentStageIndex = STATUS_MAP[complaint.status] || 0;

  // Render a row for the info table
  const DataRow = ({ icon, label, value }) => (
    <div className="flex border-b border-gray-300 last:border-0">
      <div className="w-1/3 p-3 sm:p-4 border-r border-gray-300 flex items-center gap-2 pl-4 sm:pl-6">
        <div className="text-[#3b5998]">{icon}</div>
        <span className="font-bold text-[#1e2a4a] text-sm sm:text-base">{label}</span>
      </div>
      <div className="w-2/3 p-3 sm:p-4 flex items-center pl-4 sm:pl-6">
        <div className="font-bold text-[#1e2a4a] text-sm sm:text-base">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen py-8 px-4 font-sans">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold text-[#1e2a4a] mb-6">Pothole Details</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left Column: Image and Details Table */}
          <div className="flex flex-col gap-6">
            
            {/* Pothole Image */}
            <div className="w-full h-[280px] rounded-sm overflow-hidden bg-gray-100">
              <img 
                src={(() => {
                  const path = complaint.photo_before;
                  if (!path) return 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80';
                  if (path.startsWith('http')) return path;
                  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
                  const API_BASE = import.meta.env.VITE_API_URL || 'https://pavetrack-2.onrender.com';
                  return `${API_BASE}/${cleanPath}`;
                })()}
                alt="Pothole" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80' }} // Fallback image
              />
            </div>

            {/* Details Table */}
            <div className="border border-gray-300 rounded-md bg-white overflow-hidden shadow-sm">
              
              {/* ID Header Row */}
              <div className="flex border-b border-gray-300">
                <div className="w-1/3 p-4 border-r border-gray-300 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-[#1e2a4a]">ID</span>
                </div>
                <div className="w-2/3 p-4 flex items-center pl-6">
                  <span className="text-2xl sm:text-3xl font-bold text-[#1e2a4a] tracking-wide">{complaint.complaint_code}</span>
                </div>
              </div>

              {/* Data Rows */}
              <DataRow icon={<MapPin size={20} strokeWidth={2.5}/>} label="Location" value={complaint.location} />
              <DataRow icon={<Calendar size={20} strokeWidth={2.5}/>} label="Reported" value={formatDate(complaint.created_at)} />
              <DataRow 
                icon={<Activity size={20} strokeWidth={2.5}/>} 
                label="Status" 
                value={
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${complaint.status === 'closed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                    {complaint.status === 'closed' ? 'Closed' : 'In Progress'}
                  </span>
                } 
              />
              <DataRow icon={<User size={20} strokeWidth={2.5}/>} label="Assigned" value="ABC Roads" />
            
            </div>
          </div>

          {/* Right Column: Timeline and Action Buttons */}
          <div className="flex flex-col gap-6">
            
            {/* Timeline Box */}
            <div className="border border-gray-300 rounded-md p-6 bg-white shadow-sm flex flex-col justify-center">
              <div className="relative pl-4 py-2">
                {/* Background continuous gray line */}
                <div className="absolute left-[29px] top-6 bottom-6 w-1.5 bg-gray-300 rounded-full z-0"></div>
                
                {/* Foreground green line (height based on progress) */}
                <div 
                  className="absolute left-[29px] top-6 w-1.5 bg-green-600 rounded-full z-0 transition-all duration-500"
                  style={{ height: `${(Math.min(currentStageIndex, 5) / 6) * 100}%` }}
                ></div>

                {/* Timeline Nodes */}
                <div className="flex flex-col gap-5 relative z-10">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex + 1;
                    
                    return (
                      <div key={stage} className="flex items-center gap-6">
                        {/* Status Icon */}
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white">
                          {isCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-sm">
                              <Check size={20} className="text-white" strokeWidth={4} />
                            </div>
                          ) : isCurrent ? (
                            <div className="w-8 h-8 rounded-full border-[3px] border-[#3b5998] flex items-center justify-center bg-white shadow-sm">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#3b5998]"></div>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full border-[2.5px] border-gray-400 bg-[#eef1f6] shadow-inner"></div>
                          )}
                        </div>

                        {/* Text details */}
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm ${isCompleted || isCurrent ? 'text-[#3b5998]' : 'text-[#6b7b9e]'}`}>
                            {stage}
                          </span>
                          <span className="text-xs text-[#3b5998]/80 font-medium mt-0.5">
                            {idx === 0 && formatDate(complaint.created_at)}
                            {idx > 0 && isCompleted && formatDate(complaint.updated_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate(`/complaints/${complaint.complaint_code}/verification`)}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-[#1e2a4a] font-bold py-3.5 px-4 rounded flex items-center justify-between shadow-sm transition"
              >
                View Verification Details <ChevronRight size={20} strokeWidth={2.5} className="text-[#1e2a4a]/50" />
              </button>
              
              <button 
                onClick={() => navigate(`/complaints/${complaint.complaint_code}/comparison`)}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-[#1e2a4a] font-bold py-3.5 px-4 rounded flex items-center justify-between shadow-sm transition"
              >
                View Changes <ChevronRight size={20} strokeWidth={2.5} className="text-[#1e2a4a]/50" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

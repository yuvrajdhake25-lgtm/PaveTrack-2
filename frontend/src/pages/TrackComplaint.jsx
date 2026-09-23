import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Check, ChevronRight } from 'lucide-react';
import { getComplaint } from '../api/complaints';

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

export default function TrackComplaint() {
  const [code, setCode] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!code) return;
    
    setLoading(true);
    setError('');
    setComplaint(null);
    
    try {
      const data = await getComplaint(code.trim().toUpperCase());
      setComplaint(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Complaint not found. Please check the ID.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const currentStageIndex = complaint ? (STATUS_MAP[complaint.status] || 0) : -1;

  return (
    <div className="bg-white min-h-screen py-10 px-4 font-sans">
      <div className="container mx-auto max-w-5xl">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-[#3b5998] mb-1">Track your Complaint</h1>
        <p className="text-gray-500 mb-8 font-medium">Enter your complaint ID to view the latest status and updates</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Search & Summary */}
          <div className="flex flex-col gap-6">
            
            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PTH-2026-00125"
                className="flex-1 border border-gray-300 rounded-md p-4 text-xl font-bold text-center text-gray-800 focus:outline-none focus:border-[#3b5998]"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#3b5998] hover:bg-[#2d4373] text-white px-8 py-4 rounded-md flex items-center justify-center gap-2 font-bold text-xl transition"
              >
                <Search size={24} strokeWidth={2.5} />
                {loading ? '...' : 'Track'}
              </button>
            </form>

            {error && (
              <div className="bg-red-100 text-red-600 p-4 rounded-md font-medium text-center">
                {error}
              </div>
            )}

            {/* Complaint Card */}
            {complaint && (
              <>
                <div className="border border-gray-300 rounded-md p-6 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-[#3b5998] font-bold text-lg">Complaint ID</h3>
                      <h2 className="text-[#3b5998] font-extrabold text-3xl tracking-wide">{complaint.complaint_code}</h2>
                    </div>
                    <div className="bg-[#2ecc71] text-white px-4 py-1.5 rounded-full font-bold text-sm">
                      {complaint.status === 'closed' ? 'Closed' : 'In Progress'}
                    </div>
                  </div>
                  
                  <p className="text-[#3b5998] font-bold text-sm mb-6">
                    Location: <span className="font-medium">{complaint.location}</span>
                  </p>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-[#3b5998] font-bold text-sm">Reported:</p>
                      <p className="text-[#3b5998] font-medium text-sm">{formatDate(complaint.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#3b5998] font-bold text-sm">Severity</p>
                      <p className={`font-bold text-sm ${complaint.severity === 'Critical' || complaint.severity === 'High' ? 'text-red-500' : 'text-yellow-600'}`}>
                        {complaint.severity}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/complaints/${complaint.complaint_code}`)}
                  className="w-full border-2 border-[#3b5998] text-[#3b5998] font-bold py-3 rounded-md flex items-center justify-center gap-1 hover:bg-[#f4f7fd] transition"
                >
                  View Details <ChevronRight size={20} strokeWidth={3} />
                </button>
              </>
            )}
          </div>

          {/* Right Column: Timeline (Only visible if a complaint is loaded) */}
          {complaint && (
            <div className="border border-gray-300 rounded-md p-6 bg-white shadow-sm h-full flex flex-col justify-center">
              <div className="relative pl-4 py-2">
                
                {/* Background continuous gray line */}
                <div className="absolute left-[29px] top-6 bottom-6 w-1.5 bg-gray-300 rounded-full z-0"></div>
                
                {/* Foreground green line (height based on progress) */}
                <div 
                  className="absolute left-[29px] top-6 w-1.5 bg-green-600 rounded-full z-0 transition-all duration-500"
                  style={{ height: `${(Math.min(currentStageIndex, 5) / 6) * 100}%` }}
                ></div>

                {/* Timeline Nodes */}
                <div className="flex flex-col gap-6 relative z-10">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex + 1;
                    
                    return (
                      <div key={stage} className="flex items-center gap-6">
                        
                        {/* Status Icon */}
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white">
                          {isCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-md">
                              <Check size={20} className="text-white" strokeWidth={4} />
                            </div>
                          ) : isCurrent ? (
                            <div className="w-8 h-8 rounded-full border-[3px] border-[#3b5998] flex items-center justify-center bg-white shadow-md">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#3b5998]"></div>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-gray-400 bg-gray-200 shadow-inner"></div>
                          )}
                        </div>

                        {/* Text details */}
                        <div className="flex flex-col">
                          <span className={`font-bold ${isCompleted || isCurrent ? 'text-[#3b5998]' : 'text-gray-500'}`}>
                            {stage}
                          </span>
                          {/* Only show dates for reported or completed tasks (simulated with created_at/updated_at for realism) */}
                          <span className="text-sm text-[#3b5998]/80 font-medium">
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
          )}

        </div>
      </div>
    </div>
  );
}

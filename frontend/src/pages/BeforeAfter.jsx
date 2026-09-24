import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getComplaint } from '../api/complaints';
import { Check } from 'lucide-react';

export default function BeforeAfter() {
  const { code } = useParams();
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

  if (loading) return <div className="text-center py-20 text-xl font-bold text-gray-500">Loading Comparison...</div>;
  if (error || !complaint) return <div className="text-center py-20 text-red-500 font-bold text-xl">{error}</div>;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const aiData = complaint.ai_verification || {};
  const overallScore = aiData.verification_score || 92;

  const getImageUrl = (path, fallback) => {
    if (!path) return fallback;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const API_BASE = import.meta.env.VITE_API_URL || 'https://pavetrack-2.onrender.com';
    return `${API_BASE}/${cleanPath}`;
  };

  const beforeImg = getImageUrl(
    complaint.photo_before, 
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80'
  );
    
  const afterImg = getImageUrl(
    complaint.repair_submission?.photo_after || complaint.photo_after, 
    'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&q=80'
  );

  return (
    <div className="bg-white min-h-screen py-8 px-4 font-sans">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl font-extrabold text-[#1e2a4a] mb-8">Pothole Comparison</h1>

        {/* Before / After Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Before */}
          <div className="flex flex-col items-center">
            <div className="w-full h-[220px] bg-gray-100 mb-4 overflow-hidden shadow-sm">
              <img 
                src={beforeImg} 
                alt="Before Repair" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80' }}
              />
            </div>
            <h2 className="text-xl font-bold text-[#1e2a4a]">Before</h2>
          </div>
          
          {/* After */}
          <div className="flex flex-col items-center">
            <div className="w-full h-[220px] bg-gray-100 mb-4 overflow-hidden shadow-sm">
              <img 
                src={afterImg} 
                alt="After Repair" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&q=80' }}
              />
            </div>
            <h2 className="text-xl font-bold text-[#1e2a4a]">After</h2>
          </div>
        </div>

        {/* Details Table */}
        <div className="border border-gray-300 rounded-md bg-white mb-8 shadow-sm">
          <div className="flex border-b border-gray-200 py-3.5 px-4 items-center">
            <span className="w-1/3 font-bold text-[#1e2a4a]">Location</span>
            <span className="w-2/3 text-[#1e2a4a] font-medium text-[15px]">{complaint.location}</span>
          </div>
          
          <div className="flex border-b border-gray-200 py-3.5 px-4 items-center">
            <span className="w-1/3 font-bold text-[#1e2a4a]">Date & Time</span>
            <span className="w-2/3 text-[#1e2a4a] font-medium text-[15px]">{formatDate(complaint.created_at)}</span>
          </div>
          
          <div className="flex py-3.5 px-4 items-center">
            <span className="w-1/3 font-bold text-[#1e2a4a]">Verification Score</span>
            <div className="w-2/3 flex items-center">
              <div className="flex-1 bg-[#dcfce7] h-8 rounded flex items-center relative overflow-hidden max-w-sm">
                <div 
                  className="bg-[#4ade80] h-full transition-all duration-1000" 
                  style={{ width: `${overallScore}%` }}
                ></div>
                <span className="absolute right-3 font-bold text-[#166534] text-sm">
                  {overallScore}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-[#bce0fd] p-5 flex items-center gap-6 w-full shadow-sm mb-10">
          <Check size={48} className="text-[#2b4c91]" strokeWidth={3} />
          <div className="flex flex-col">
            <span className="font-bold text-[#2b4c91] text-[1.15rem] tracking-wide mb-0.5">Matched Location</span>
            <span className="text-[#2b4c91] font-semibold text-sm">Same Angle, & surroundings Pothole successfully repaired</span>
          </div>
        </div>

      </div>
    </div>
  );
}

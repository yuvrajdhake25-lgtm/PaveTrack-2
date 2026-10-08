import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaint } from '../api/complaints';
import { Check, ShieldAlert, MapPin, Camera, Image as ImageIcon, Ruler, Brain } from 'lucide-react';

export default function BeforeAfter() {
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

  if (loading) return <div className="text-center py-20 text-xl font-bold text-gray-500">Loading AI Analysis...</div>;
  if (error || !complaint) return <div className="text-center py-20 text-red-500 font-bold text-xl">{error}</div>;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const aiData = complaint.ai_verification || null;
  
  // Use actual scores from backend, or fallback if AI verification hasn't run yet
  const isVerified = aiData ? aiData.verified : false;
  const overallScore = aiData ? aiData.overall_score : 0;
  const gpsScore = aiData ? aiData.gps_match_score : 0;
  const angleScore = aiData ? aiData.angle_match_score : 0;
  const backgroundScore = aiData ? aiData.background_match_score : 0;
  const repairScore = aiData ? aiData.road_region_score : 0;
  const reasoning = aiData ? aiData.reasoning : "AI verification has not been completed for this repair yet.";

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

  const ScoreBar = ({ label, score, icon: Icon }) => (
    <div className="flex flex-col mb-3">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2 text-[#1e2a4a] font-semibold text-sm">
          {Icon && <Icon size={16} className="text-gray-500" />}
          {label}
        </div>
        <span className={`font-bold text-sm ${score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
          {score}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 font-sans">
      <div className="container mx-auto max-w-4xl">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-[#1e2a4a]">AI-Assisted Verification Report</h1>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-semibold rounded hover:bg-gray-50"
          >
            ← Back to Details
          </button>
        </div>

        {/* Before / After Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-[#1e2a4a] mb-3 border-b pb-2">Original Report (Before)</h2>
            <div className="w-full h-[240px] bg-gray-100 overflow-hidden rounded">
              <img src={beforeImg} alt="Before Repair" className="w-full h-full object-cover" />
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-semibold text-gray-800">Location:</span> {complaint.location}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-[#1e2a4a] mb-3 border-b pb-2">Contractor Submission (After)</h2>
            <div className="w-full h-[240px] bg-gray-100 overflow-hidden rounded">
              <img src={afterImg} alt="After Repair" className="w-full h-full object-cover" />
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-semibold text-gray-800">Submitted:</span> {formatDate(complaint.repair_submission?.submitted_at)}
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-[#1e2a4a] p-4 flex items-center gap-3">
            <Brain className="text-white" size={24} />
            <h2 className="text-xl font-bold text-white tracking-wide">Gemini Vision AI Analysis</h2>
          </div>
          
          <div className="p-6">
            {!aiData ? (
              <div className="text-center py-8 text-gray-500 italic">
                Waiting for contractor to submit repair photos and trigger AI verification...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Col: Scores */}
                <div>
                  <h3 className="text-md font-bold text-gray-800 mb-4 border-b pb-2">Confidence Metrics</h3>
                  <ScoreBar label="GPS Coordinate Match" score={gpsScore} icon={MapPin} />
                  <ScoreBar label="Camera Angle Consistency" score={angleScore} icon={Camera} />
                  <ScoreBar label="Background/Surroundings Match" score={backgroundScore} icon={ImageIcon} />
                  <ScoreBar label="Repair Quality Assessment" score={repairScore} icon={Ruler} />
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-gray-700">Overall AI Confidence</span>
                    <span className={`text-2xl font-extrabold ${overallScore >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                      {overallScore}%
                    </span>
                  </div>
                </div>

                {/* Right Col: Reasoning */}
                <div>
                  <h3 className="text-md font-bold text-gray-800 mb-4 border-b pb-2">AI Reasoning Log</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-[280px] overflow-y-auto text-sm text-gray-700 leading-relaxed font-mono">
                    {reasoning}
                  </div>
                </div>
                
              </div>
            )}
          </div>
        </div>

        {/* Verdict Banner */}
        {aiData && (
          isVerified ? (
            <div className="bg-green-50 border border-green-200 p-5 rounded-lg flex items-center gap-4 w-full shadow-sm mb-10">
              <div className="bg-green-500 p-2 rounded-full"><Check size={32} className="text-white" strokeWidth={3} /></div>
              <div className="flex flex-col">
                <span className="font-bold text-green-900 text-lg mb-0.5">Verification Passed</span>
                <span className="text-green-800 text-sm">The AI confirms the location matches and the repair appears successful. Ready to close.</span>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 p-5 rounded-lg flex items-center gap-4 w-full shadow-sm mb-10">
              <div className="bg-red-500 p-2 rounded-full"><ShieldAlert size={32} className="text-white" strokeWidth={3} /></div>
              <div className="flex flex-col">
                <span className="font-bold text-red-900 text-lg mb-0.5">Manual Review Required</span>
                <span className="text-red-800 text-sm">The AI detected inconsistencies in the repair evidence. Please inspect physically.</span>
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
}

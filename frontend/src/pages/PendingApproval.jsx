import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Clock, RefreshCw, FileText, Map, Search, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PendingApproval() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');

  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage('');
    try {
      const updated = await refreshUser();
      if (updated?.approval_status === 'approved') {
        setMessage('Congratulations! Your account has been approved. Redirecting to your dashboard...');
        setTimeout(() => {
          navigate(0); // reload to trigger RoleDashboard
        }, 1200);
      } else {
        setMessage('Your account is still pending verification. Please check back shortly.');
      }
    } catch (err) {
      setMessage('Unable to verify status at this moment. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const roleTitle = user?.role === 'municipal' ? 'Municipal Authority' : 'Road Contractor';

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 font-sans flex items-center justify-center">
      <div className="container mx-auto max-w-2xl">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-8 text-white text-center relative overflow-hidden">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
              <Clock size={40} className="text-white animate-pulse" />
            </div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider uppercase mb-2">
              Verification in Progress
            </span>
            <h1 className="text-3xl font-black">Account Approval Pending</h1>
            <p className="text-white/90 text-sm mt-1 max-w-md mx-auto">
              Welcome, <span className="font-bold underline">{user?.name || 'Officer'}</span>. Your {roleTitle} account registration was received.
            </p>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex gap-4 items-start">
              <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={24} />
              <div className="text-sm text-amber-900 leading-relaxed">
                <p className="font-bold mb-1">Why does this account require approval?</p>
                <p className="text-xs text-amber-800">
                  {user?.role === 'municipal' 
                    ? 'Municipal accounts hold administrative powers to oversee city-wide complaints and assign contractors. For civic accountability, an Administrator must verify your municipal credentials before granting dashboard access.'
                    : 'Contractor accounts hold operational powers to claim and submit road repair evidence. An Administrator or Municipal Officer must verify your contracting credentials before assigning active road projects.'}
                </p>
              </div>
            </div>

            {/* Status Check Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl mb-8">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Live Verification Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                  <span className="font-extrabold text-gray-800 text-sm">Awaiting Review</span>
                </div>
              </div>
              <button
                onClick={handleCheckStatus}
                disabled={checking}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#1e2a4a] hover:bg-[#2b3c66] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
                {checking ? 'Checking...' : 'Check Approval Status'}
              </button>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs font-bold mb-6 text-center ${
                message.includes('Congratulations') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-700'
              }`}>
                {message}
              </div>
            )}

            {/* Allowed Public Features */}
            <div>
              <h3 className="text-sm font-extrabold text-[#1e2a4a] mb-2 uppercase tracking-wide">
                Available Features While Pending
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                You can immediately explore the public transparency platform and report local issues:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/report')}
                  className="p-4 border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl flex items-center justify-between transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700">Report a Pothole</p>
                      <p className="text-[11px] text-gray-400">File a road complaint</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 transition" />
                </button>

                <button
                  onClick={() => navigate('/track')}
                  className="p-4 border border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 rounded-2xl flex items-center justify-between transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Search size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 group-hover:text-purple-700">Track Complaint</p>
                      <p className="text-[11px] text-gray-400">Search by ticket code</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-purple-600 transition" />
                </button>

                <button
                  onClick={() => navigate('/map')}
                  className="p-4 border border-gray-200 hover:border-green-500 hover:bg-green-50/50 rounded-2xl flex items-center justify-between transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                      <Map size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 group-hover:text-green-700">Public Map</p>
                      <p className="text-[11px] text-gray-400">View city road map</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-green-600 transition" />
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="p-4 border border-gray-200 hover:border-gray-500 hover:bg-gray-100/50 rounded-2xl flex items-center justify-between transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 group-hover:text-gray-900">Home Platform</p>
                      <p className="text-[11px] text-gray-400">Read overview & stats</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-700 transition" />
                </button>
              </div>
            </div>

            {/* Note about admin testing */}
            <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
              Demo Tip: Log in with <span className="font-mono text-gray-600 font-bold">admin@pavetrack.gov</span> (pwd: <span className="font-mono text-gray-600 font-bold">admin123</span>) or <span className="font-mono text-gray-600 font-bold">admin@example.com</span> to approve pending accounts.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

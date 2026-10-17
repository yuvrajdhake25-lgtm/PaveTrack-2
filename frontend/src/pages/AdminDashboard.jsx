import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getPendingApprovals, getAllUsers, approveUser, rejectUser } from '../api/complaints';
import { ShieldCheck, UserCheck, UserX, Clock, Building2, Wrench, Users, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'municipal' | 'contractor' | 'all'
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingData, usersData] = await Promise.all([
        getPendingApprovals(),
        getAllUsers()
      ]);
      setPendingUsers(pendingData || []);
      setAllUsers(usersData || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (userId, name, role) => {
    setActionLoading(userId);
    setFeedback({ text: '', type: '' });
    try {
      await approveUser(userId);
      setFeedback({ text: `Approved ${name} (${role}) successfully!`, type: 'success' });
      // Update local state immediately
      setPendingUsers(prev => prev.filter(u => u._id !== userId));
      setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, approval_status: 'approved' } : u));
    } catch (err) {
      setFeedback({ text: err.response?.data?.detail || 'Failed to approve user.', type: 'error' });
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (userId, name, role) => {
    if (!window.confirm(`Are you sure you want to reject the ${role} request for ${name}?`)) return;
    setActionLoading(userId);
    setFeedback({ text: '', type: '' });
    try {
      await rejectUser(userId);
      setFeedback({ text: `Rejected request for ${name}.`, type: 'info' });
      setPendingUsers(prev => prev.filter(u => u._id !== userId));
      setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, approval_status: 'rejected' } : u));
    } catch (err) {
      setFeedback({ text: err.response?.data?.detail || 'Failed to reject user.', type: 'error' });
    } finally {
      setActionLoading('');
    }
  };

  const pendingMunicipal = pendingUsers.filter(u => u.role === 'municipal');
  const pendingContractors = pendingUsers.filter(u => u.role === 'contractor');
  const totalUsersCount = allUsers.length;
  const activeCitizensCount = allUsers.filter(u => u.role === 'citizen').length;

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 font-sans">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold tracking-wider mb-1 uppercase">
              <ShieldCheck size={16} /> PaveTrack Central Administration
            </div>
            <h1 className="text-3xl font-black text-[#1e2a4a]">Account Verification Portal</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Review and authorize Municipal Authorities and Road Contractors before operational access is granted.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-xs font-bold text-[#1e2a4a] shadow-sm transition disabled:opacity-50 self-start md:self-auto"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Queue
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback.text && (
          <div className={`p-4 rounded-2xl text-xs font-bold mb-6 flex items-center justify-between shadow-sm ${
            feedback.type === 'success' ? 'bg-green-100 text-green-900 border border-green-300' :
            feedback.type === 'error' ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-gray-100 text-gray-800'
          }`}>
            <span>{feedback.text}</span>
            <button onClick={() => setFeedback({ text: '', type: '' })} className="text-gray-500 hover:text-black">✕</button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">Pending Municipal</p>
              <p className="text-2xl font-black text-gray-800">{pendingMunicipal.length}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Wrench size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">Pending Contractors</p>
              <p className="text-2xl font-black text-gray-800">{pendingContractors.length}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">Active Citizens</p>
              <p className="text-2xl font-black text-gray-800">{activeCitizensCount}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">Total User Accounts</p>
              <p className="text-2xl font-black text-gray-800">{totalUsersCount}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-3 text-sm font-extrabold rounded-t-xl border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'pending'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock size={16} /> Pending Approvals
            {pendingUsers.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('municipal')}
            className={`px-5 py-3 text-sm font-extrabold rounded-t-xl border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'municipal'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 size={16} /> Municipal Officers
          </button>

          <button
            onClick={() => setActiveTab('contractor')}
            className={`px-5 py-3 text-sm font-extrabold rounded-t-xl border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'contractor'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wrench size={16} /> Road Contractors
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-3 text-sm font-extrabold rounded-t-xl border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={16} /> All Registered Users
          </button>
        </div>

        {/* Tab 1: Pending Approvals */}
        {activeTab === 'pending' && (
          <div>
            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 font-bold">
                Loading approval requests...
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-extrabold text-gray-800">Queue is Clear!</h3>
                <p className="text-gray-500 text-xs mt-1">
                  All Municipal and Contractor registrations have been reviewed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingUsers.map(applicant => (
                  <div key={applicant._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      {/* Role Pill & Date */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          applicant.role === 'municipal' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {applicant.role === 'municipal' ? '🏛️ Municipal Authority' : '🛠️ Road Contractor'}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          Registered: {formatDate(applicant.created_at)}
                        </span>
                      </div>

                      {/* Applicant Details */}
                      <h3 className="text-xl font-black text-[#1e2a4a] mb-1">{applicant.name}</h3>
                      <p className="text-gray-600 text-xs font-mono mb-2">{applicant.email}</p>
                      
                      <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 mb-4 space-y-1">
                        <p><strong className="text-gray-800">Phone:</strong> {applicant.phone || 'Not provided'}</p>
                        <p><strong className="text-gray-800">Assigned Area:</strong> {applicant.area || 'All Districts'}</p>
                        <p><strong className="text-gray-800">Status:</strong> <span className="text-amber-600 font-bold">Awaiting Admin Verification</span></p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleReject(applicant._id, applicant.name, applicant.role)}
                        disabled={actionLoading === applicant._id}
                        className="flex-1 py-2.5 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <UserX size={14} /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(applicant._id, applicant.name, applicant.role)}
                        disabled={actionLoading === applicant._id}
                        className="flex-1 py-2.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        <UserCheck size={14} /> {actionLoading === applicant._id ? 'Approving...' : 'Approve Account'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Municipal Officers */}
        {activeTab === 'municipal' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-xs text-gray-500 uppercase">
              Registered Municipal Officers ({allUsers.filter(u => u.role === 'municipal').length})
            </div>
            <div className="divide-y divide-gray-100">
              {allUsers.filter(u => u.role === 'municipal').map(m => (
                <div key={m._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#1e2a4a] text-sm">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.email} · {m.area || 'City-wide'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      m.approval_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {m.approval_status === 'approved' ? 'Approved' : 'Pending'}
                    </span>
                    {m.approval_status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(m._id, m.name, m.role)}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Contractors */}
        {activeTab === 'contractor' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-xs text-gray-500 uppercase">
              Registered Road Contractors ({allUsers.filter(u => u.role === 'contractor').length})
            </div>
            <div className="divide-y divide-gray-100">
              {allUsers.filter(u => u.role === 'contractor').map(c => (
                <div key={c._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#1e2a4a] text-sm">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.email} · {c.area || 'All Sectors'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      c.approval_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {c.approval_status === 'approved' ? 'Approved' : 'Pending'}
                    </span>
                    {c.approval_status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(c._id, c.name, c.role)}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: All Registered Users */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-xs text-gray-500 uppercase">
              Complete User Registry ({allUsers.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Area</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allUsers.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-800">{u.name}</p>
                        <p className="text-gray-400 font-mono text-[11px]">{u.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize font-bold text-gray-700">{u.role}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{u.area || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                          u.approval_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {u.approval_status || 'approved'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.approval_status === 'pending' && (
                          <button
                            onClick={() => handleApprove(u._id, u.name, u.role)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1 rounded text-[11px]"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

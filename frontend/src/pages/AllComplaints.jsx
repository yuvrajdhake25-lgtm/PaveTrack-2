import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getComplaints } from '../api/complaints';
import api from '../api/client';
import { X } from 'lucide-react';

export default function AllComplaints() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null);
  const [contractorName, setContractorName] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

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

  const activeStatuses = ['reported', 'verified', 'assigned', 'work_started', 'repair_submitted', 'manual_review'];
  const closedStatuses = ['ai_verified', 'closed'];

  const displayedComplaints = activeTab === 'all'
    ? complaints
    : activeTab === 'active'
    ? complaints.filter(c => activeStatuses.includes(c.status))
    : complaints.filter(c => closedStatuses.includes(c.status));

  const handleAssign = async () => {
    if (!contractorName.trim()) return;
    setAssigning(true);
    try {
      await api.patch(`/complaints/${assignModal.complaint_code}/assign`, {
        contractor_name: contractorName
      });
      setAssignModal(null);
      setContractorName('');
      fetchComplaints();
    } catch (err) {
      alert('Failed to assign contractor');
    } finally {
      setAssigning(false);
    }
  };

  const SeverityDot = ({ severity }) => {
    const color = severity === 'Critical' ? 'bg-red-600'
      : severity === 'High' ? 'bg-orange-500'
      : severity === 'Medium' ? 'bg-yellow-500'
      : 'bg-green-500';
    const text = severity === 'Critical' ? 'text-red-600'
      : severity === 'High' ? 'text-orange-500'
      : severity === 'Medium' ? 'text-yellow-600'
      : 'text-green-600';
    return (
      <div className="flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`}></span>
        <span className={`font-bold text-sm ${text}`}>{severity}</span>
      </div>
    );
  };

  const StatusPill = ({ status }) => {
    const styles = {
      reported:         'border border-red-400 text-red-600 bg-white',
      verified:         'border border-yellow-500 text-yellow-600 bg-white',
      assigned:         'border border-blue-400 text-blue-600 bg-white',
      work_started:     'border border-orange-400 text-orange-600 bg-white',
      repair_submitted: 'border border-teal-400 text-teal-600 bg-white',
      ai_verified:      'border border-purple-400 text-purple-600 bg-white',
      closed:           'bg-green-500 text-white border border-green-500',
    };
    const dotColor = {
      reported: 'bg-red-500', verified: 'bg-yellow-500', assigned: 'bg-blue-500',
      work_started: 'bg-orange-500', repair_submitted: 'bg-teal-500',
      ai_verified: 'bg-purple-500', closed: 'bg-white',
    };
    const label = {
      reported: 'Reported', verified: 'Verified', assigned: 'Assigned',
      work_started: 'Work Started', repair_submitted: 'Repair Submitted',
      ai_verified: 'AI Verified', closed: 'Closed',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        <span className={`w-2 h-2 rounded-full ${dotColor[status] || 'bg-gray-400'}`}></span>
        {label[status] || status}
      </span>
    );
  };

  return (
    <div className="bg-white min-h-screen py-8 px-4 font-sans">
      <div className="container mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#1e2a4a]">Municipal Complaint Master Register</h1>
          <p className="text-gray-500 font-medium mt-1">
            Showing {displayedComplaints.length} of {complaints.length} registered grievances
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { key: 'all', label: '📋 All Complaints', count: complaints.length },
            { key: 'active', label: '🔴 Active', count: complaints.filter(c => activeStatuses.includes(c.status)).length },
            { key: 'completed', label: '✅ Completed History', count: complaints.filter(c => closedStatuses.includes(c.status)).length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-extrabold rounded-t-lg border-b-2 transition ${activeTab === tab.key ? 'border-[#3b5998] text-[#3b5998] bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
              <span className={`ml-2 text-[10px] rounded-full px-2 py-0.5 ${activeTab === tab.key ? 'bg-[#3b5998] text-white' : 'bg-gray-200 text-gray-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold">Loading complaints...</div>
        ) : displayedComplaints.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold">No complaints in this category.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['ID', 'LOCATION & AREA', 'SEVERITY', 'ASSIGNED CONTRACTOR', 'STATUS', 'ACTIONS'].map(h => (
                    <th key={h} className="px-5 py-4 text-xs font-extrabold text-gray-400 tracking-widest uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedComplaints.map((c, idx) => (
                  <tr
                    key={c.complaint_code}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-white'}`}
                  >
                    {/* ID */}
                    <td className="px-5 py-4 max-w-[180px]">
                      <span className="font-bold text-[#1e2a4a] text-xs break-all">
                        {c._id || c.complaint_code}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-[#1e2a4a] text-sm block">{c.location?.split(',')[0]}</span>
                      {c.location?.includes(',') && (
                        <span className="text-gray-400 text-xs">{c.location?.split(',').slice(1).join(',').trim()}</span>
                      )}
                    </td>

                    {/* Severity */}
                    <td className="px-5 py-4">
                      <SeverityDot severity={c.severity} />
                    </td>

                    {/* Assigned Contractor */}
                    <td className="px-5 py-4">
                      {c.assigned_contractor ? (
                        <span className="text-[#1e2a4a] font-semibold text-sm">{c.assigned_contractor}</span>
                      ) : (
                        <span className="text-orange-500 font-bold italic text-sm">Unassigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusPill status={c.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Assign button — only if not yet assigned */}
                        {!c.assigned_contractor && (
                          <button
                            onClick={() => { setAssignModal(c); setContractorName(''); }}
                            className="px-4 py-1.5 rounded-md border-2 border-[#3b5998] text-[#3b5998] text-xs font-bold hover:bg-[#f4f7fd] transition"
                          >
                            Assign
                          </button>
                        )}
                        {/* Reassign — if already assigned */}
                        {c.assigned_contractor && (
                          <button
                            onClick={() => { setAssignModal(c); setContractorName(c.assigned_contractor); }}
                            className="px-4 py-1.5 rounded-md border-2 border-gray-300 text-gray-500 text-xs font-bold hover:bg-gray-50 transition"
                          >
                            Reassign
                          </button>
                        )}
                        {/* Inspect */}
                        <button
                          onClick={() => navigate(`/complaints/${c.complaint_code}`)}
                          className="px-4 py-1.5 rounded-md border-2 border-[#3b5998] bg-[#3b5998] text-white text-xs font-bold hover:bg-[#2d4373] transition"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Contractor Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-extrabold text-[#1e2a4a]">Assign Contractor</h3>
              <button onClick={() => setAssignModal(null)} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-1">
              Complaint: <strong className="text-[#3b5998]">{assignModal.complaint_code}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Location: <span className="font-medium text-[#1e2a4a]">{assignModal.location}</span>
            </p>
            <input
              type="text"
              value={contractorName}
              onChange={e => setContractorName(e.target.value)}
              placeholder="Enter contractor name..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-[#3b5998] font-medium"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setAssignModal(null)}
                className="flex-1 border-2 border-gray-300 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={assigning || !contractorName.trim()}
                className="flex-1 bg-[#3b5998] text-white font-bold py-3 rounded-xl hover:bg-[#2d4373] transition disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

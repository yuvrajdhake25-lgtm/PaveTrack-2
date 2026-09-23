import React from 'react';

const STAGES = [
  'reported',
  'verified',
  'assigned',
  'work_started',
  'repair_submitted',
  'ai_verified',
  'closed'
];

export default function StatusTimeline({ history = [] }) {
  const currentStatusIndex = STAGES.indexOf(history[history.length - 1]?.status || 'reported');

  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow">
      <h3 className="font-bold text-lg mb-2">Status Timeline</h3>
      {STAGES.map((stage, index) => {
        const isCompleted = index <= currentStatusIndex;
        const historyItem = history.find(h => h.status === stage);
        
        return (
          <div key={stage} className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className="flex flex-col">
              <span className={`capitalize ${isCompleted ? 'text-navy-900 font-semibold' : 'text-gray-400'}`}>
                {stage.replace('_', ' ')}
              </span>
              {historyItem && (
                <span className="text-xs text-gray-500">
                  {new Date(historyItem.timestamp).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Circle, Gift } from 'lucide-react';

const DailyQuests = () => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuests = async () => {
    try {
      const res = await axios.get('/api/quests');
      setQuests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const handleClaim = async (questId) => {
    try {
      const res = await axios.post('/api/quests/claim', { questId });
      if (res.data.success) {
        // Refresh quests to update status
        fetchQuests();
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.error || '领取失败');
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-2xl"></div>;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>📅</span> 每日任务
      </h3>
      <div className="space-y-3">
        {quests.map(quest => (
          <div key={quest.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${quest.status === 'claimed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                {quest.status === 'claimed' ? <CheckCircle size={20} /> : <Circle size={20} />}
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">{quest.title}</div>
                <div className="text-xs text-gray-500">
                  {quest.desc} ({quest.progress}/{quest.target})
                </div>
              </div>
            </div>
            
            {quest.status === 'claimable' && (
              <button 
                onClick={() => handleClaim(quest.id)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm animate-bounce"
              >
                领取
              </button>
            )}
            
            {quest.status === 'claimed' && (
              <span className="text-xs text-gray-400 font-medium px-2">已完成</span>
            )}
            
            {quest.status === 'locked' && (
              <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                <Gift size={12} />
                <span>{quest.rewardCoins}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyQuests;
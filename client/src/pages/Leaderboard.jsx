import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/api/leaderboard');
        setList(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="p-8 text-center">加载中...</div>;

  const getRankIcon = (rank) => {
    if (rank === 1) return <span className="text-3xl">🥇</span>;
    if (rank === 2) return <span className="text-3xl">🥈</span>;
    if (rank === 3) return <span className="text-3xl">🥉</span>;
    return <span className="text-xl font-bold text-gray-500 w-8 text-center">{rank}</span>;
  };

  return (
    <div className="p-6 max-w-md mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="text-yellow-500" /> 排行榜
        </h1>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      <div className="space-y-3">
        {list.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="flex-shrink-0 w-10 flex justify-center">
              {getRankIcon(item.rank)}
            </div>
            
            <div className="relative">
               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-sm overflow-hidden">
                 🐱
                 {item.equippedItem === 'sunglasses' && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm z-10">🕶️</div>}
                 {item.equippedItem === 'crown' && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-sm z-10">👑</div>}
                 {item.equippedItem === 'bow' && <div className="absolute top-0 left-0 text-xs z-10">🎀</div>}
               </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">{item.catName}</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-md">Lv.{item.level}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">主人: {item.owner}</div>
            </div>

            <div className="text-right">
              <div className="font-bold text-blue-600">{item.exp} EXP</div>
              <div className="text-xs text-gray-400">毛发 {item.fur}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
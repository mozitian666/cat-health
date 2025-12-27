import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CatDisplay from '../components/CatDisplay';
import { Droplet, Gamepad2 } from 'lucide-react';

const Plan = () => {
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCat = async () => {
    try {
      const res = await axios.get('/api/dashboard');
      setCat(res.data.cat);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCat();
  }, []);

  const handleDrinkWater = async () => {
    try {
      const res = await axios.post('/api/water');
      if (res.data.success) {
        setCat(res.data.cat);
        alert('咕噜咕噜~ 小猫喝水了！活力值 +10');
      }
    } catch (err) {
      console.error(err);
      alert('网络错误');
    }
  };

  const handlePlay = async () => {
    try {
      const res = await axios.post('/api/play');
      if (res.data.success) {
        setCat(res.data.cat);
        alert(res.data.message);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('网络错误');
    }
  };

  if (loading) return <div className="p-8 text-center">加载中...</div>;
  if (!cat) return <div className="p-8 text-center text-red-500">未找到小猫数据，请检查网络或刷新重试。</div>;

  return (
    <div className="p-6 max-w-md mx-auto h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">我的小猫 🐱</h1>
      
      <div className="flex-1 flex flex-col justify-center relative">
        <CatDisplay cat={cat} />
        
        {/* Interaction Buttons */}
        <div className="absolute top-0 right-0 flex flex-col gap-3">
          {/* Drink Water */}
          <button 
            onClick={handleDrinkWater}
            className="flex flex-col items-center gap-1 bg-blue-100 p-3 rounded-2xl hover:bg-blue-200 transition active:scale-95 shadow-sm w-20"
          >
            <div className="bg-blue-500 text-white p-2 rounded-full">
              <Droplet size={20} fill="currentColor" />
            </div>
            <span className="text-xs font-bold text-blue-600">喝水打卡</span>
            <span className="text-[10px] text-blue-400">活力+10</span>
          </button>

          {/* Play */}
          <button 
            onClick={handlePlay}
            className="flex flex-col items-center gap-1 bg-purple-100 p-3 rounded-2xl hover:bg-purple-200 transition active:scale-95 shadow-sm w-20"
          >
            <div className="bg-purple-500 text-white p-2 rounded-full">
              <Gamepad2 size={20} />
            </div>
            <span className="text-xs font-bold text-purple-600">陪它玩耍</span>
            <span className="text-[10px] text-purple-400">活力-20</span>
          </button>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-3 text-lg">成长指南</h3>
        <ul className="space-y-3 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
            <span>喂食和喝水可以补充活力，让小猫健康成长。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
            <span>陪小猫玩耍会消耗活力，但能大幅增加经验值哦！</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
            <span>活力值太低时，小猫会不想动，记得及时补充能量。</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Plan;

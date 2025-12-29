import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CatDisplay from '../components/CatDisplay';
import { Droplet, Gamepad2, ShoppingBag, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const Plan = () => {
  const [cat, setCat] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [catRes, invRes] = await Promise.all([
        axios.get('/api/dashboard'),
        axios.get('/api/inventory')
      ]);
      setCat(catRes.data.cat);
      setInventory(invRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUseItem = async (inventoryId) => {
    try {
        const res = await axios.post('/api/inventory/use', { inventoryId });
        if (res.data.success) {
            alert(res.data.message);
            // Refresh data
            fetchData();
        }
    } catch (err) {
        alert(err.response?.data?.error || '使用失败');
    }
  };

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
  // if (!cat) return <div className="p-8 text-center text-red-500">未找到小猫数据，请检查网络或刷新重试。</div>;

  return (
    <div className="p-6 max-w-md mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的小猫 🐱</h1>
        <Link to="/shop" className="bg-orange-100 text-orange-600 p-2 rounded-xl">
            <ShoppingBag size={20} />
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col justify-center relative">
        {cat && <CatDisplay cat={cat} />}
        
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

          {/* Inventory Toggle */}
          <button 
            onClick={() => setShowInventory(!showInventory)}
            className="flex flex-col items-center gap-1 bg-green-100 p-3 rounded-2xl hover:bg-green-200 transition active:scale-95 shadow-sm w-20"
          >
            <div className="bg-green-500 text-white p-2 rounded-full">
              <Package size={20} />
            </div>
            <span className="text-xs font-bold text-green-600">我的背包</span>
          </button>
        </div>
      </div>

      {/* Inventory Drawer/Panel */}
      {showInventory && (
        <div className="mt-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                <span>🎒 背包 ({inventory.length})</span>
                <span className="text-xs text-gray-400">点击物品使用</span>
            </h3>
            {inventory.length === 0 ? (
                <div className="text-center text-gray-400 py-4 text-sm">
                    背包空空如也，去 <Link to="/shop" className="text-orange-500 underline">商店</Link> 看看吧
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-2">
                    {inventory.map(inv => (
                        <button 
                            key={inv.id}
                            onClick={() => handleUseItem(inv.id)}
                            className="flex flex-col items-center p-2 bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition relative"
                        >
                            <div className="text-2xl mb-1">{inv.Item.icon}</div>
                            <div className="text-[10px] font-bold text-gray-600 truncate w-full text-center">{inv.Item.name}</div>
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                                {inv.quantity}
                            </div>
                            {inv.Item.type === 'decoration' && cat?.equippedItem === inv.Item.effectValue && (
                                <div className="absolute top-0 left-0 bg-green-500 text-white text-[10px] px-1 rounded-tl-xl rounded-br-xl">
                                    已穿戴
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
      )}

      {!showInventory && (
        <div className="mt-8 bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-3 text-lg">成长指南</h3>
            <ul className="space-y-3 text-sm text-blue-700">
            <li className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                <span>喂食和喝水可以补充活力，让小猫健康成长。</span>
            </li>
            <li className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                <span>商城里有高级猫粮和玩具，可以更快升级哦！</span>
            </li>
            </ul>
        </div>
      )}
    </div>
  );
};

export default Plan;

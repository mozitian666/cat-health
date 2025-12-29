import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingBag, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Shop = () => {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [itemsRes, catRes] = await Promise.all([
        axios.get('/api/shop'),
        axios.get('/api/dashboard')
      ]);
      setItems(itemsRes.data);
      setCat(catRes.data.cat);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBuy = async (itemId) => {
    try {
      const res = await axios.post('/api/shop/buy', { itemId });
      if (res.data.success) {
        alert(res.data.message);
        setCat(res.data.cat);
      }
    } catch (err) {
      alert(err.response?.data?.error || '购买失败');
    }
  };

  if (loading) return <div className="p-8 text-center">加载中...</div>;

  return (
    <div className="p-6 max-w-md mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag /> 喵喵便利店
        </h1>
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold">
            <span>💰</span> {cat?.coins || 0}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-4">
        {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="text-4xl mb-2">{item.icon}</div>
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-2 h-8 line-clamp-2">{item.description}</p>
                <button 
                    onClick={() => handleBuy(item.id)}
                    className="mt-auto w-full bg-orange-100 text-orange-600 py-1.5 rounded-lg text-sm font-bold hover:bg-orange-200 transition"
                >
                    {item.price} 💰
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Flame, Zap, Droplet, Plus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import DailyQuests from '../components/DailyQuests';
import WeeklyReport from '../components/WeeklyReport';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/dashboard');
      console.log('Dashboard Data:', res.data);
      setData(res.data);
    } catch (err) {
      console.error('Fetch Error:', err);
      alert('Fetch Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReport = async () => {
    setReportLoading(true);
    try {
        const res = await axios.get('/api/report/weekly');
        setReportData(res.data);
        setShowReport(true);
    } catch (err) {
        alert('生成周报失败');
    } finally {
        setReportLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;
  if (!data) return <div className="p-8 text-center text-gray-500">加载数据失败</div>;

  const { stats, recentRecords } = data;
  const GOAL_CALORIES = 2200;
  const caloriesLeft = Math.max(0, GOAL_CALORIES - stats.totalCalories);
  const percent = Math.min(100, Math.round((stats.totalCalories / GOAL_CALORIES) * 100));

  // Date Format
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="p-6 max-w-md mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-gray-500 text-sm font-medium">{dateStr}</span>
            <div className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
              <span>🔥</span> 连续 5 天
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">你好, 主人 👋</h1>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleOpenReport}
                disabled={reportLoading}
                className="bg-purple-50 p-2 rounded-xl text-purple-600 hover:bg-purple-100 transition relative"
            >
                {reportLoading ? <span className="text-sm animate-spin">⏳</span> : <FileText size={24} />}
            </button>
            <Link to="/leaderboard" className="bg-yellow-50 p-2 rounded-xl text-yellow-600 hover:bg-yellow-100 transition">
                <span className="text-2xl">🏆</span>
            </Link>
        </div>
      </div>

      {/* Main Green Card */}
      <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Background Decorative Circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="text-green-50 font-medium mb-1">剩余卡路里</div>
            <div className="text-5xl font-bold mb-1">{caloriesLeft}</div>
            <div className="text-green-100 text-sm">目标 {GOAL_CALORIES} kcal</div>
          </div>
          
          {/* Progress Circle SVG */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-green-600 opacity-30"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="white"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * percent) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-xl font-bold">{percent}%</div>
          </div>
        </div>
      </div>

      {/* Macronutrients */}
      <div className="grid grid-cols-3 gap-4">
        {/* Carbs */}
        <div className="bg-blue-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
          <div className="text-blue-500"><Zap size={20} fill="currentColor" /></div>
          <div className="text-gray-500 text-sm font-medium">碳水</div>
          <div className="text-gray-900 font-bold text-lg">{stats.totalCarbs}g</div>
        </div>
        {/* Protein */}
        <div className="bg-purple-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
          <div className="text-purple-500"><Flame size={20} fill="currentColor" /></div>
          <div className="text-gray-500 text-sm font-medium">蛋白质</div>
          <div className="text-gray-900 font-bold text-lg">{stats.totalProtein}g</div>
        </div>
        {/* Fat */}
        <div className="bg-yellow-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
          <div className="text-yellow-500"><Droplet size={20} fill="currentColor" /></div>
          <div className="text-gray-500 text-sm font-medium">脂肪</div>
          <div className="text-gray-900 font-bold text-lg">{stats.totalFat}g</div>
        </div>
      </div>

      {/* Daily Quests */}
      <DailyQuests />

      {/* Today's Meals */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">今日饮食</h2>
          <Link to="/upload" className="text-green-600 font-medium text-sm hover:underline">记录饮食</Link>
        </div>

        <div className="space-y-4">
          {recentRecords.length === 0 ? (
             <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
               <p className="text-gray-400 text-sm mb-2">今天还没有记录哦</p>
               <Link to="/upload" className="text-green-500 font-bold text-sm">开始记录</Link>
             </div>
          ) : (
            recentRecords.map((record) => (
              <div key={record.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {record.imagePath ? (
                    <img 
                      src={`http://localhost:3000${record.imagePath}`} 
                      alt={record.foodName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">🥣</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{record.foodName}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(record.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{record.calories} kcal</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showReport && <WeeklyReport report={reportData} onClose={() => setShowReport(false)} />}
    </div>
  );
};

export default Dashboard;

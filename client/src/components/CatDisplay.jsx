import React from 'react';

const CatDisplay = ({ cat }) => {
  if (!cat) return <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div>;

  const { level, weight, energy, furQuality, name, exp, equippedItem } = cat;

  // Level Logic
  let maxExp = 100;
  if (level === 2) maxExp = 500;
  if (level >= 3) maxExp = 1000; // Cap at some point

  const expPercent = Math.min(100, (exp / maxExp) * 100);

  // Simple visual logic
  let sizeClass = 'w-32 h-32';
  if (level === 2) sizeClass = 'w-48 h-48';
  if (level === 3) sizeClass = 'w-56 h-56';

  let colorClass = 'bg-gray-200'; // Default
  if (furQuality > 80) colorClass = 'bg-white border-4 border-yellow-300 shadow-lg'; // Shiny
  else if (furQuality < 40) colorClass = 'bg-gray-400 border-2 border-dashed border-gray-600'; // Poor

  // Fat logic
  const isFat = weight > 5 && level === 2 || weight > 2 && level === 1;
  const shapeClass = isFat ? 'rounded-full' : 'rounded-3xl';

  return (
    <div className="bg-blue-50 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Coins Display */}
      <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-yellow-200 z-10">
        <span className="text-lg">💰</span>
        <span className="font-bold">{cat.coins || 0}</span>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">{name} (Lv.{level})</h2>
      
      {/* Cat Visual */}
      <div className={`transition-all duration-500 flex items-center justify-center text-6xl relative ${sizeClass} ${colorClass} ${shapeClass}`}>
        <span className="z-10">🐱</span>
        
        {/* Equipped Item Visual */}
        {equippedItem === 'sunglasses' && (
           <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl z-20">🕶️</div>
        )}
        {equippedItem === 'bow' && (
           <div className="absolute -top-2 left-0 text-3xl z-20 rotate-[-20deg]">🎀</div>
        )}
        {equippedItem === 'crown' && (
           <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl z-20">👑</div>
        )}

        {/* Status Indicators */}
        {energy < 30 && (
          <div className="absolute -top-4 -right-4 text-sm bg-red-500 text-white px-2 py-1 rounded-full animate-bounce">
            饿了!
          </div>
        )}
      </div>

      <div className="w-full mt-8 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="体重" value={`${weight.toFixed(1)}kg`} />
          <StatCard label="活力" value={energy} />
        </div>

        {/* EXP Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
           <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
             <span>当前经验</span>
             <span>{exp} / {maxExp}</span>
           </div>
           <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
             <div 
               className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
               style={{ width: `${expPercent}%` }}
             ></div>
           </div>
           <div className="text-center mt-2 text-xs text-orange-500 font-medium">
             {level < 3 ? `距离下一级还差 ${maxExp - exp} EXP` : '已达到最高等级！'}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white p-3 rounded-lg shadow-sm text-center">
    <div className="text-gray-500 text-sm">{label}</div>
    <div className="font-bold text-lg text-blue-600">{value}</div>
  </div>
);

export default CatDisplay;

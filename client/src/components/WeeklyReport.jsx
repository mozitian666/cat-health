import React from 'react';
import { X, Calendar, Activity, TrendingUp } from 'lucide-react';

const WeeklyReport = ({ onClose, report }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
        >
            <X size={20} />
        </button>

        <div className="text-center mb-6">
            <div className="text-sm font-bold text-blue-500 mb-1 flex items-center justify-center gap-1">
                <Calendar size={14} /> 
                {report.startDate} ~ {report.endDate}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">AI 健康周报</h2>
        </div>

        <div className="bg-blue-50 rounded-2xl p-6 text-center mb-6">
            <div className="text-sm text-blue-400 font-bold mb-1">健康评分</div>
            <div className="text-5xl font-bold text-blue-600 mb-2">{report.score}</div>
            <p className="text-xs text-blue-500 px-4">{report.summary}</p>
        </div>

        <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                    <Activity size={20} />
                </div>
                <div>
                    <div className="text-xs text-gray-400 font-bold">平均摄入</div>
                    <div className="font-bold text-gray-800">{report.avgCalories} kcal</div>
                </div>
                <div className="ml-auto text-xs text-gray-400">记录 {report.recordCount} 次</div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <div className="text-xs text-gray-400 font-bold">AI 建议</div>
                    <div className="text-xs font-medium text-gray-700 leading-relaxed mt-0.5">
                        {report.suggestion}
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-gray-50 p-2 rounded-lg">
                <div className="text-gray-400 mb-1">蛋白质</div>
                <div className="font-bold text-gray-800">{report.macros.protein}g</div>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
                <div className="text-gray-400 mb-1">碳水</div>
                <div className="font-bold text-gray-800">{report.macros.carbs}g</div>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
                <div className="text-gray-400 mb-1">脂肪</div>
                <div className="font-bold text-gray-800">{report.macros.fat}g</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;
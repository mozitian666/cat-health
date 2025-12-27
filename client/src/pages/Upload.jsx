import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recognized, setRecognized] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    foodName: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    imagePath: ''
  });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setRecognized(false);
    }
  };

  const handleRecognize = async () => {
    if (!file) return;
    setLoading(true);
    
    // 1. Upload Image
    const uploadData = new FormData();
    uploadData.append('image', file);
    
    try {
      const uploadRes = await axios.post('/api/upload', uploadData);
      const imagePath = uploadRes.data.imagePath;

      // 2. Recognize
      const recognizeRes = await axios.post('/api/recognize');
      const foodData = recognizeRes.data;

      setFormData({
        ...foodData,
        imagePath
      });
      setRecognized(true);
    } catch (err) {
      console.error(err);
      alert('识别失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/diet', formData);
      alert('记录成功！小猫获得了能量！');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('保存失败');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">📸 拍摄饮食</h2>

      {/* Image Upload Area */}
      <div className="mb-8">
        {!preview ? (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <span className="text-4xl mb-2">📷</span>
              <p className="text-sm text-gray-500">点击上传或拍照</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="relative">
             <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-2xl shadow-md" />
             <button 
               onClick={() => { setPreview(null); setFile(null); setRecognized(false); }}
               className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full text-xs hover:bg-opacity-70 backdrop-blur-sm"
             >
               重新拍摄
             </button>
          </div>
        )}
      </div>

      {/* Action Button */}
      {file && !recognized && (
        <button 
          onClick={handleRecognize}
          disabled={loading}
          className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-lg hover:bg-green-600 transition disabled:opacity-50 shadow-lg shadow-green-200"
        >
          {loading ? 'AI 正在识别中...' : '✨ 开始识别'}
        </button>
      )}

      {/* Result Form */}
      {recognized && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4">
            <h3 className="font-bold text-blue-800 mb-1">AI 识别成功</h3>
            <p className="text-xs text-blue-600">如果不准确，您可以手动修改下方数据</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">食物名称</label>
            <input 
              type="text" 
              value={formData.foodName}
              onChange={e => setFormData({...formData, foodName: e.target.value})}
              className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 p-3 border bg-gray-50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">卡路里 (kcal)</label>
              <input 
                type="number" 
                value={formData.calories}
                onChange={e => setFormData({...formData, calories: Number(e.target.value)})}
                className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 p-3 border bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">蛋白质 (g)</label>
              <input 
                type="number" 
                value={formData.protein}
                onChange={e => setFormData({...formData, protein: Number(e.target.value)})}
                className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 p-3 border bg-gray-50"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-lg hover:bg-green-600 transition mt-6 shadow-lg shadow-green-200"
          >
            ✅ 确认并喂食
          </button>
        </form>
      )}
    </div>
  );
};

export default Upload;

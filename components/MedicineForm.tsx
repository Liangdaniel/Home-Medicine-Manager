
import React, { useState } from 'react';
import { Medicine } from '../types';
import { analyzeMedicineContent, getRemainingUses } from '../services/geminiService';
import { Type, Loader2, Save, X, Info, Sparkles, Wand2 } from 'lucide-react';

interface Props {
  initialData?: Medicine;
  onSave: (medicine: Medicine) => void;
  onCancel: () => void;
}

export const MedicineForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Medicine>(initialData || {
    id: Date.now().toString(),
    name: '',
    brand: '',
    ingredients: '',
    specs: '',
    indications: '',
    usage: '',
    expiryDate: '',
  });

  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [remaining, setRemaining] = useState(getRemainingUses());

  const handleSmartFill = async () => {
    if (!aiInput.trim()) return;
    if (remaining <= 0) {
      alert('今日 AI 额度已用完');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeMedicineContent(aiInput);
      if (result) {
        setFormData(prev => ({ 
          ...prev, 
          ...result,
          // Don't overwrite ID if it's an edit
          id: prev.id 
        }));
        setRemaining(getRemainingUses());
        setAiInput(''); 
      }
    } catch (error: any) {
      alert(error.message || '识别失败，请检查网络');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl transition-all">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              {initialData ? '编辑药品' : '录入药品'}
              <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">AI Assistant</span>
            </h2>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {!initialData && (
            <div className="mb-8">
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 shadow-inner">
                <label className="block text-xs font-black text-indigo-600 uppercase mb-3 ml-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI 极速填单
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入药名或描述，如：布洛芬缓释胶囊"
                    className="flex-1 px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm placeholder:text-slate-300"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSmartFill()}
                  />
                  <button 
                    onClick={handleSmartFill}
                    disabled={isAnalyzing || !aiInput}
                    className="bg-indigo-600 text-white px-5 rounded-xl text-sm font-black hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    <span>分析</span>
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1"><Info className="w-3 h-3" /> 试试输入：小朋友吃的感冒药</span>
                  <span>今日剩余: {remaining} 次</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">药品通用名称</label>
                <input
                  type="text"
                  placeholder="请输入药品名"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">生产品牌</label>
                <input
                  type="text"
                  placeholder="如：同仁堂、白云山"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  value={formData.brand}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">规格大小</label>
                  <input
                    type="text"
                    placeholder="如：0.5g*12片"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    value={formData.specs}
                    onChange={e => setFormData({...formData, specs: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">有效期至</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    value={formData.expiryDate}
                    onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">主要成分</label>
                <textarea
                  placeholder="列出主要化学成分"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  rows={2}
                  value={formData.ingredients}
                  onChange={e => setFormData({...formData, ingredients: e.target.value})}
                />
              </div>
               <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">适应症 / 功能主治</label>
                <input
                  type="text"
                  placeholder="感冒、发烧、止痛等"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  value={formData.indications}
                  onChange={e => setFormData({...formData, indications: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">标准用法用量</label>
                <textarea
                  placeholder="一日三次，每次一片..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  rows={2}
                  value={formData.usage}
                  onChange={e => setFormData({...formData, usage: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="mt-10">
            <button
              onClick={() => onSave(formData)}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 active:scale-[0.98]"
            >
              <Save className="w-5 h-5" />
              完成并保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

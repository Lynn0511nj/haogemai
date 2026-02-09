import React from 'react';
import Button from './Button';
import { 
  canUseShareReward, 
  unlockByShare, 
  getRemainingDimensionsCount,
  isAllDimensionsUnlocked
} from '../services/unlockManager';

interface ShareModalProps {
  onClose: () => void;
  onShareSuccess?: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose, onShareSuccess }) => {
  const canShare = canUseShareReward();
  const remainingCount = getRemainingDimensionsCount();
  const allUnlocked = isAllDimensionsUnlocked();
  
  const handleShare = () => {
    if (!canShare) {
      alert(allUnlocked ? '🎉 已查看所有维度分析' : '今天的分享次数已用完啦～');
      return;
    }
    
    const newDimension = unlockByShare();
    if (newDimension) {
      alert(`🎉 已解锁新维度\n\n「${newDimension}」的详细分析\n\n请在诊断结果页面查看`);
      onShareSuccess?.();
    }
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#7C9A92]/10 rounded-full mb-2">
            <svg className="w-10 h-10 text-[#7C9A92]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">分享查看维度详细分析</h3>
          <p className="text-base text-slate-500 px-4 leading-relaxed">
            每个维度都有深度分析和优化建议。<br/>
            分享后可查看 <span className="text-[#7C9A92] font-bold">1 个维度的详细分析</span>
          </p>
        </div>
        
        {!canShare && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-sm text-amber-800 font-medium">
              {allUnlocked ? '🎉 已查看所有维度分析' : '今天的分享次数已用完啦～'}
            </p>
          </div>
        )}
        
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-slate-700 mb-1">关于维度分析</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                每个维度的详细分析包含现状描述、问题分析和优化建议。
                {remainingCount > 0 && `还有 ${remainingCount} 个维度待解锁。`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 pt-2">
          <Button 
            variant="primary" 
            className="w-full py-4 text-lg shadow-lg shadow-[#7C9A92]/20 font-bold" 
            onClick={handleShare}
            disabled={!canShare}
          >
            {canShare ? '生成分享卡片' : '今日已分享'}
          </Button>
          {canShare && (
            <Button 
              variant="ghost" 
              className="w-full text-sm text-slate-400" 
              onClick={() => { 
                alert('链接已复制'); 
                onClose(); 
              }}
            >
              仅复制链接
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

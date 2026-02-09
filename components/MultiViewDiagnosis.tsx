/**
 * 多视角诊断展示组件
 * 展示从不同角度分析的诊断结果
 */

import React from 'react';
import { DiagnosisResult, DiagnosisModule } from '../types';
import { getUnlockStatus, getModuleDisplayName, canUseShareReward, getRemainingModulesCount } from '../services/unlockManager';
import Card from './Card';
import Button from './Button';

interface MultiViewDiagnosisProps {
  result: DiagnosisResult;
  onBack: () => void;
  onShareClick?: () => void;
}

const ModuleIcon: React.FC<{ moduleId: string }> = ({ moduleId }) => {
  const icons: Record<string, JSX.Element> = {
    content_view: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    account_positioning_view: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    user_psychology_view: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    growth_bottleneck_view: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    optimization_actions_view: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    case_reference_view: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  };
  
  return icons[moduleId] || icons.content_view;
};

const ModuleCard: React.FC<{ module: DiagnosisModule; isLocked?: boolean }> = ({ module, isLocked }) => {
  const colors: Record<string, string> = {
    content_view: 'from-blue-50 to-blue-100 border-blue-200',
    account_positioning_view: 'from-purple-50 to-purple-100 border-purple-200',
    user_psychology_view: 'from-pink-50 to-pink-100 border-pink-200',
    growth_bottleneck_view: 'from-green-50 to-green-100 border-green-200',
    optimization_actions_view: 'from-amber-50 to-amber-100 border-amber-200',
    case_reference_view: 'from-cyan-50 to-cyan-100 border-cyan-200'
  };
  
  const iconColors: Record<string, string> = {
    content_view: 'text-blue-600',
    account_positioning_view: 'text-purple-600',
    user_psychology_view: 'text-pink-600',
    growth_bottleneck_view: 'text-green-600',
    optimization_actions_view: 'text-amber-600',
    case_reference_view: 'text-cyan-600'
  };
  
  const colorClass = colors[module.id] || colors.content_view;
  const iconColor = iconColors[module.id] || iconColors.content_view;
  
  if (isLocked) {
    return (
      <Card className="bg-slate-50 border-slate-200 p-6 relative overflow-hidden opacity-60">
        <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[2px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <svg className="w-8 h-8 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-slate-500 font-medium">分享后解锁</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-400`}>
            <ModuleIcon moduleId={module.id} />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-bold text-slate-700 text-base">{module.title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed blur-sm select-none">
              这是一段被锁定的诊断内容，分享后即可查看完整分析...
            </p>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className={`bg-gradient-to-br ${colorClass} border-2 p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor} shadow-sm`}>
          <ModuleIcon moduleId={module.id} />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-bold text-slate-800 text-base">{module.title}</h4>
          <p className="text-sm text-slate-700 leading-relaxed">{module.content}</p>
        </div>
      </div>
    </Card>
  );
};

const MultiViewDiagnosis: React.FC<MultiViewDiagnosisProps> = ({ result, onBack, onShareClick }) => {
  if (!result.multiViewDiagnosis) {
    return null;
  }
  
  const { multiViewDiagnosis } = result;
  const unlockStatus = getUnlockStatus();
  const unlockedSet = new Set(unlockStatus.unlocked_modules);
  const canShare = canUseShareReward();
  const remainingCount = getRemainingModulesCount();
  
  // 所有模块按顺序
  const allModules = [
    multiViewDiagnosis.diagnosis_modules.content_view,
    multiViewDiagnosis.diagnosis_modules.user_psychology_view,
    multiViewDiagnosis.diagnosis_modules.growth_bottleneck_view,
    multiViewDiagnosis.diagnosis_modules.account_positioning_view,
    multiViewDiagnosis.diagnosis_modules.optimization_actions_view,
    multiViewDiagnosis.diagnosis_modules.case_reference_view
  ];
  
  return (
    <div className="px-6 py-10 space-y-8 fade-in pb-48 max-w-xl mx-auto">
      {/* 标题 */}
      <header className="flex items-center gap-4 border-b-2 border-slate-100 pb-5">
        <button onClick={onBack} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">多视角诊断</h2>
          <p className="text-sm text-slate-500 mt-1">同一份诊断，从不同角度看</p>
        </div>
      </header>
      
      {/* 快速结论 */}
      <Card className="bg-gradient-to-br from-[#7C9A92] to-[#5C7A72] text-white border-none p-8 shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest opacity-80 font-bold">综合评分</span>
            <span className="text-3xl font-black">{multiViewDiagnosis.core_score}/10</span>
          </div>
          <p className="text-lg font-bold leading-relaxed">{multiViewDiagnosis.base_summary}</p>
        </div>
      </Card>
      
      {/* 提示信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-800 leading-relaxed">
          以下所有视角来自同一次诊断结果，不会重复检测，但会带你看到之前没展示的分析角度。
        </p>
      </div>
      
      {/* 所有视角模块 */}
      <div className="space-y-5">
        {allModules.map((module) => (
          <ModuleCard 
            key={module.id} 
            module={module} 
            isLocked={!unlockedSet.has(module.id)}
          />
        ))}
      </div>
      
      {/* 分享解锁提示 */}
      {canShare && remainingCount > 0 && onShareClick && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-slate-700 font-medium mb-2">
                还有 <span className="text-purple-600 font-bold">{remainingCount} 个视角</span> 未解锁
              </p>
              <p className="text-xs text-slate-500">分享后立即解锁 {Math.min(3, remainingCount)} 个新视角</p>
            </div>
            <Button 
              onClick={onShareClick}
              className="w-full py-4 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
            >
              分享解锁更多视角
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiViewDiagnosis;


import React, { useState, useEffect, useRef } from 'react';
import { AppStep, UserContext, DiagnosisResult } from './types';
import { diagnoseAccount, fullDiagnosis } from './services/diagnosisService';
import Button from './components/Button';
import Card from './components/Card';
import ImageUpload from './components/ImageUpload';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const BrandIcon = ({ className = "w-12 h-12" }) => (
  <img 
    src="/logo.png" 
    alt="号个脉 Logo" 
    className={className}
  />
);

const SelectionGroup: React.FC<{
  label: string; options: string[]; value: string | undefined; onChange: (val: string) => void; placeholder?: string;
}> = ({ label, options, value, onChange, placeholder }) => {
  const [isCustom, setIsCustom] = useState(false);
  const handleSelect = (opt: string) => { setIsCustom(false); onChange(opt); };
  const handleCustomClick = () => { setIsCustom(true); onChange(""); };
  return (
    <div className="space-y-4">
      <label className="text-base font-semibold text-slate-700 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => handleSelect(opt)}
            className={`px-4 py-2.5 rounded-full text-sm transition-all border ${value === opt && !isCustom ? "bg-[#7C9A92] text-white border-[#7C9A92]" : "bg-white text-slate-500 border-slate-200"}`}>
            {opt}
          </button>
        ))}
        <button type="button" onClick={handleCustomClick}
          className={`px-4 py-2.5 rounded-full text-sm transition-all border ${isCustom ? "bg-[#7C9A92] text-white border-[#7C9A92]" : "bg-white text-slate-500 border-slate-200"}`}>
          自定义...
        </button>
      </div>
      {isCustom && <input autoFocus className="w-full bg-white border border-[#7C9A92] rounded-2xl px-5 py-3.5 text-base outline-none fade-in" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
};

const LongReportModal: React.FC<{ result: DiagnosisResult; onClose: () => void }> = ({ result, onClose }) => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'generating' | 'ready' | 'error'>('generating');

  useEffect(() => {
    const generateImage = async () => {
      await new Promise(r => setTimeout(r, 800));
      if (captureRef.current) {
        try {
          // @ts-ignore
          const canvas = await html2canvas(captureRef.current, { useCORS: true, scale: 2, backgroundColor: '#FDFBF7' });
          setImageUrl(canvas.toDataURL('image/png'));
          setStatus('ready');
        } catch (err) { setStatus('error'); }
      }
    };
    generateImage();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col items-center overflow-hidden fade-in">
      <div className="w-full max-w-xl flex justify-between items-center p-6 text-white z-10">
        <h3 className="font-bold text-lg">保存诊断报告</h3>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="flex-1 w-full overflow-y-auto px-6 pb-24 flex flex-col items-center">
        {status === 'generating' && (
          <div className="mt-40 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
            <p className="text-white/60 text-base">正在绘制高清长图...</p>
          </div>
        )}
        {status === 'ready' && imageUrl && (
          <div className="max-w-md w-full animate-fade-in">
            <img src={imageUrl} className="w-full rounded-2xl shadow-2xl" alt="Report" />
            <div className="mt-6 bg-white/10 p-4 rounded-2xl text-center"><p className="text-sm text-white/80 font-medium">长按保存图片</p></div>
          </div>
        )}
      </div>
      <div ref={captureRef} className="absolute top-0 left-[-9999px] bg-[#FDFBF7] w-[375px] p-8 space-y-8 text-slate-800">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2"><BrandIcon className="w-8 h-8" /><span className="text-xl font-bold text-[#7C9A92]">号个脉</span></div>
           <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">陪你把账号慢慢理顺</div>
        </div>
        <div className="bg-gradient-to-br from-[#7C9A92] to-[#5C7A72] text-white rounded-[2.5rem] p-8 text-center space-y-3">
          <div className="text-[10px] uppercase tracking-widest opacity-80 font-bold">账号定性</div>
          <div className="text-2xl font-bold leading-tight">{result.fullReport?.coreStatus || result.clarityPhase}</div>
        </div>
        <div className="space-y-3">
           <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
             <span className="w-1 h-5 bg-[#D88B7B] rounded-full"></span>
             核心问题
           </h4>
           <div className="bg-[#F3E8E2] border-l-4 border-[#D88B7B] p-5 rounded-r-2xl">
             <p className="text-slate-900 text-sm leading-relaxed font-medium">{result.fullReport?.coreProblem}</p>
           </div>
        </div>
        {result.fullReport?.actionableExample && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-1 h-5 bg-[#7C9A92] rounded-full"></span>
              {result.fullReport.actionableExample.title}
            </h4>
            <div className="bg-white border-2 border-[#7C9A92]/20 rounded-2xl p-5 space-y-3">
              <p className="text-slate-700 text-xs leading-relaxed">{result.fullReport.actionableExample.context}</p>
              <div className="bg-[#7C9A92]/5 p-3 rounded-xl border border-[#7C9A92]/20">
                <p className="text-[10px] text-[#7C9A92] font-bold uppercase tracking-widest mb-1">示例</p>
                <p className="text-slate-800 text-xs font-medium leading-relaxed">{result.fullReport.actionableExample.example}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest mb-1">执行限制</p>
                <p className="text-slate-700 text-xs leading-relaxed">{result.fullReport.actionableExample.constraint}</p>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
           <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
             <span className="w-1.5 h-6 bg-[#7C9A92] rounded-full"></span>
             7天优化行动清单
           </h4>
           <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 ml-2 py-2">
             {result.fullReport?.sevenDayPlan.map((item, i) => (
               <div key={i} className="relative">
                  <div className="absolute -left-[29px] top-0 w-4 h-4 bg-white border-2 border-[#7C9A92] rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#7C9A92] rounded-full"></div>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-[#7C9A92] uppercase tracking-widest">{item.day}</p>
                     <p className="text-xs text-slate-700 font-bold leading-relaxed">{item.action}</p>
                     <p className="text-[10px] text-slate-400 italic">目标：{item.goal}</p>
                  </div>
               </div>
             ))}
           </div>
        </div>
        <div className="pt-10 border-t border-dashed border-slate-100 flex items-end justify-between">
           <div className="space-y-1"><p className="text-base font-bold text-slate-900 italic">扫码开启你的成长旅程</p><p className="text-xs text-slate-400">搜索小程序「<span className="text-[#7C9A92] font-bold">号个脉</span>」立即体验</p></div>
           <div className="w-20 h-20 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center"><div className="w-full h-full opacity-40 grid grid-cols-5 gap-0.5">{Array.from({length: 25}).map((_, i) => (<div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-[#7C9A92]' : 'bg-transparent'}`}></div>))}</div></div>
        </div>
      </div>
    </div>
  );
};


const PaymentModal: React.FC<{ onClose: () => void; onConfirm: () => void }> = ({ onClose, onConfirm }) => {
  const [payMethod, setPayMethod] = useState<'wechat' | 'alipay'>('wechat');
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        <div className="text-center space-y-2"><h3 className="text-2xl font-bold text-slate-800">解锁深度诊断报告</h3><p className="text-base text-slate-500 px-4">赞助开发者一杯咖啡 ☕️，支持我们不断打磨 AI 陪跑算法。</p></div>
        <div className="bg-slate-50 rounded-3xl p-6 text-center space-y-1"><div className="text-sm text-slate-400 uppercase tracking-widest">赞助金额</div><div className="text-5xl font-bold text-slate-800">¥ 29.9</div></div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setPayMethod('wechat')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${payMethod === 'wechat' ? 'border-[#07C160] bg-[#07C160]/5' : 'border-slate-100 opacity-60'}`}><div className="w-12 h-12 bg-[#07C160] rounded-full flex items-center justify-center text-white text-xl font-bold">微</div><span className="text-sm font-medium">微信支付</span></button>
          <button onClick={() => setPayMethod('alipay')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${payMethod === 'alipay' ? 'border-[#1677FF] bg-[#1677FF]/5' : 'border-slate-100 opacity-60'}`}><div className="w-12 h-12 bg-[#1677FF] rounded-full flex items-center justify-center text-white text-xl font-bold">支</div><span className="text-sm font-medium">支付宝支付</span></button>
        </div>
        <div className="flex flex-col items-center space-y-4 pt-4"><div className="w-40 h-40 bg-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner"><div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]"><Button onClick={onConfirm} className="text-sm px-5 py-2.5 scale-90">模拟支付成功</Button></div></div><p className="text-xs text-slate-400 italic font-medium">扫码支付后报告将立即解锁</p></div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [context, setContext] = useState<UserContext>({ profileImage: '' });
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showLongReportModal, setShowLongReportModal] = useState(false);
  const [devClickCount, setDevClickCount] = useState(0);
  
  // 分析页面的状态
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState('opacity-100');
  
  const analyzingTips = [
    "正在扫描你的账号结构…",
    "已匹配同类账号成长模型…",
    "分析你的主页信号强度…",
    "对比迷茫期常见卡点中…",
    "正在生成你的关键判断…"
  ];
  
  // 分析页面的提示语轮播效果
  useEffect(() => {
    if (step !== AppStep.ANALYZING) return;
    
    const interval = setInterval(() => {
      setFadeClass('opacity-0');
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % analyzingTips.length);
        setFadeClass('opacity-100');
      }, 300);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [step]);

  // 开发环境自动启用开发者模式
  const checkIfDevDevice = () => {
    // 如果是 Vite 开发环境，自动启用
    if (import.meta.env.DEV) {
      localStorage.setItem('DEV_ACCESS_KEY', 'true');
      return true;
    }
    return localStorage.getItem('DEV_ACCESS_KEY') === 'true';
  };

  const handleStart = () => {
    const isDev = checkIfDevDevice();
    const lastDiagnosis = localStorage.getItem('lastDiagnosisTime');
    if (lastDiagnosis && !isDev) {
      const timeSince = Date.now() - parseInt(lastDiagnosis);
      if (timeSince < 24 * 60 * 60 * 1000) {
        setStep(AppStep.RATE_LIMITED);
        return;
      }
    }
    setStep(AppStep.INPUT);
  };

  const handleLogoClick = () => {
    setDevClickCount(prev => {
      const next = prev + 1;
      if (next === 7) {
        localStorage.setItem('DEV_ACCESS_KEY', 'true');
        console.log("Internal: Developer mode enabled. Rate limit bypassed.");
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.profileImage) { alert("主页诊断位不可或缺哦～"); return; }
    setStep(AppStep.ANALYZING);
    try {
      console.log('📤 开始诊断，用户输入:', context);
      
      // 调用 Prompt A：极速初判（免费版）
      const data = await diagnoseAccount(context);
      
      console.log('🔍 诊断结果 (完整):', JSON.stringify(data, null, 2));
      console.log('📊 维度数据:', data.dimensions);
      
      // 详细检查每个字段
      console.log('=== 数据完整性检查 ===');
      console.log('clarityPhase:', data.clarityPhase);
      console.log('phaseInspiration:', data.phaseInspiration);
      console.log('empathyMessage:', data.empathyMessage);
      console.log('dimensions 是否存在:', !!data.dimensions);
      console.log('dimensions 是否为数组:', Array.isArray(data.dimensions));
      console.log('dimensions 长度:', data.dimensions?.length);
      
      // 检查维度数据
      if (data.dimensions && data.dimensions.length > 0) {
        console.log('✅ 维度数量:', data.dimensions.length);
        data.dimensions.forEach((dim, index) => {
          console.log(`维度${index + 1}:`, {
            name: dim.name,
            score: dim.score,
            description: dim.description,
            hasDetailedAnalysis: !!dim.detailedAnalysis,
            detailedAnalysisLength: dim.detailedAnalysis?.length || 0
          });
        });
      } else {
        console.error('❌ 没有维度数据或维度数据为空');
      }
      
      console.log('=== 准备设置结果并跳转 ===');
      setResult(data);
      localStorage.setItem('lastDiagnosisTime', Date.now().toString());
      setStep(AppStep.RESULT);
      console.log('✅ 已跳转到结果页面');
    } catch (err) { 
      console.error('❌ 诊断失败 (详细):', err);
      console.error('错误类型:', err instanceof Error ? err.constructor.name : typeof err);
      console.error('错误消息:', err instanceof Error ? err.message : String(err));
      console.error('错误堆栈:', (err as Error).stack);
      
      // 显示更详细的错误信息
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`诊断失败：${errorMessage}\n\n请查看控制台了解详情`);
      
      setStep(AppStep.INPUT); 
    }
  };

  // 处理付费解锁，加载完整报告
  const handleUnlockFullReport = async () => {
    if (!context.profileImage || !result) return;
    
    setShowPayModal(false);
    setStep(AppStep.ANALYZING);
    
    try {
      // 调用 Prompt B：完整深度诊断（付费版）
      const fullReport = await fullDiagnosis(context);
      
      // 更新 result，添加完整报告
      setResult({
        ...result,
        fullReport
      });
      
      setIsUnlocked(true);
      setStep(AppStep.FULL_REPORT);
    } catch (err) {
      setStep(AppStep.RESULT);
      alert("加载完整报告失败，请重试");
    }
  };

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center space-y-10 fade-in relative">
      <div 
        className="w-28 h-28 bg-[#7C9A92]/20 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-sm"
        onClick={handleLogoClick}
      >
        <BrandIcon className="w-16 h-16" />
      </div>
      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-[#7C9A92] tracking-tight">号个脉</h1>
        <p className="text-[#7C9A92] font-bold text-lg">AI 账号诊断，专治迷茫与卡点</p>
      </div>
      <div className="w-full max-w-sm bg-[#F3E8E2] p-8 rounded-[2.5rem] text-base text-[#8C6D5E] leading-relaxed text-left relative overflow-hidden shadow-sm space-y-4">
        <p className="font-bold text-lg text-[#7C9A92]">想知道账号目前处于什么阶段？😵‍💫</p>
        
        <div className="space-y-2">
          <p className="font-medium">
            <span className="text-[#7C9A92]">新手入门 / 数据瓶颈</span>，一键找答案
          </p>
          <p className="font-medium">
            小白不迷茫，老手破卡点
          </p>
        </div>
        
        <div className="border-t border-[#8C6D5E]/20 pt-4 space-y-2">
          <p>我们不提供冰冷的分数，只为你把脉找准流量卡点。</p>
          <p className="font-medium text-[#7C9A92]">
            AI 诊断 + 优化建议，7 天行动清单一目了然
          </p>
        </div>
        
        <p className="text-sm italic pt-2">
          每天仅限一次深度诊断，让内容在沉淀中自然生长。🚀
        </p>
      </div>
      <Button onClick={handleStart} className="w-full max-w-xs py-5 text-lg shadow-xl shadow-[#7C9A92]/20 font-bold">开始今日免费诊断</Button>
      <p className="text-sm text-slate-400 italic font-medium">“慢慢来，比较快。”</p>
    </div>
  );

  const renderRateLimited = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center space-y-10 fade-in">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <div className="space-y-5">
        <h2 className="text-3xl font-bold text-slate-800">今天已经号过脉啦～</h2>
        <p className="text-slate-600 text-base leading-relaxed px-4">
          每一次诊断后的优化都需要时间去发酵。<br/>
          建议你先消化当前的建议，尝试做一些调整，<br/>
          <span className="font-bold text-[#7C9A92]">24 小时后</span>我们再来复诊。
        </p>
      </div>
      <Card className="bg-[#7C9A92]/5 border-[#7C9A92]/20 p-8 max-sm:p-6 max-w-sm">
        <p className="text-sm text-slate-500 italic leading-relaxed font-medium">“账号的成长不是数字的堆砌，而是表达的持续对齐。”</p>
      </Card>
      <Button onClick={() => setStep(AppStep.WELCOME)} variant="ghost" className="text-base">返回首页</Button>
    </div>
  );

  const renderInput = () => (
    <div className="px-6 py-10 space-y-10 fade-in max-w-xl mx-auto pb-48">
      <header className="space-y-3"><h2 className="text-3xl font-bold text-slate-800">关于你的账号</h2><p className="text-slate-500 text-base">先简单了解一下，以便给予准确的分析和建议。</p></header>
      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ImageUpload 
              label="主页诊断位 (必填)" description="个人主页截图" required
              currentImage={context.profileImage} onUpload={(b) => setContext({...context, profileImage: b})}
            />
            <ImageUpload 
              label="补充脉象位 (选填)" description="笔记、数据或评论截图" 
              currentImage={context.supplementImage} onUpload={(b) => setContext({...context, supplementImage: b})}
            />
          </div>
          <div className="space-y-10 pt-4">
            <SelectionGroup label="你目前处于什么阶段？" options={["刚起步的新手", "流量不稳定", "增长瓶颈期", "转型再出发", "纯记录生活"]} value={context.accountStage} onChange={(val) => setContext({...context, accountStage: val})} />
            <SelectionGroup label="目前的创作重心是？" options={["打造个人IP", "引流变现", "分享专业知识", "纯记录/好奇"]} value={context.mainGoal} onChange={(val) => setContext({...context, mainGoal: val})} />
            <SelectionGroup label="目前最迷茫的地方是？" options={["没流量", "涨粉难/互动少", "灵感匮乏", "定位太乱", "不懂变现"]} value={context.stressPoint} onChange={(val) => setContext({...context, stressPoint: val})} />
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 flex flex-col gap-3 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <Button type="submit" className="w-full font-bold py-4.5 text-lg">查看诊断结果</Button>
          <Button variant="ghost" onClick={() => setStep(AppStep.WELCOME)} className="w-full text-base">返回</Button>
        </div>
      </form>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center space-y-12">
      <div className="relative">
        <div className="w-28 h-28 border-4 border-[#7C9A92]/10 border-t-[#7C9A92] rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <BrandIcon className="w-10 h-10 opacity-80" />
        </div>
      </div>
      <div className="space-y-4 min-h-[100px] flex flex-col justify-center">
        <h3 className={`text-2xl font-medium text-slate-800 transition-all duration-300 ${fadeClass}`}>
          {analyzingTips[currentTipIndex]}
        </h3>
        <p className="text-slate-400 text-base italic font-medium">
          不看冷冰冰的数据，只看你表达的灵魂。
        </p>
      </div>
    </div>
  );

  const renderResult = () => {
    console.log('🎨 renderResult 被调用');
    console.log('📊 result:', result);
    console.log('📊 dimensions:', result?.dimensions);
    
    if (!result) {
      console.error('❌ renderResult: result is null');
      return (
        <div className="px-6 py-10 space-y-8 fade-in pb-32 max-w-2xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-bold mb-2">⚠️ 诊断结果为空</p>
            <p className="text-red-600 text-sm">请返回重新诊断</p>
            <button 
              onClick={() => setStep(AppStep.INPUT)}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              返回重新诊断
            </button>
          </div>
        </div>
      );
    }
    
    // 安全检查：确保有维度数据
    if (!result.dimensions || result.dimensions.length === 0) {
      console.error('❌ renderResult: dimensions missing or empty', result);
      return (
        <div className="px-6 py-10 space-y-8 fade-in pb-32 max-w-2xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center space-y-4">
            <p className="text-red-800 font-bold mb-2">⚠️ 诊断数据异常</p>
            <p className="text-red-600 text-sm">未能获取完整的诊断数据</p>
            {import.meta.env.DEV && (
              <div className="bg-white rounded p-3 text-left text-xs">
                <p className="font-mono text-slate-600">Debug Info:</p>
                <pre className="text-slate-500 mt-2 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
            <button 
              onClick={() => setStep(AppStep.INPUT)}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              返回重新诊断
            </button>
          </div>
        </div>
      );
    }
    
    // 检查基本字段
    if (!result.clarityPhase || !result.phaseInspiration || !result.empathyMessage) {
      console.error('❌ renderResult: missing basic fields', {
        clarityPhase: result.clarityPhase,
        phaseInspiration: result.phaseInspiration,
        empathyMessage: result.empathyMessage
      });
    }
    
    return (
      <div className="px-6 py-10 space-y-8 fade-in pb-32 max-w-2xl mx-auto">
        
        {/* 标题区 */}
        <div className="text-center space-y-2 pb-4 border-b-2 border-slate-100">
          <h2 className="text-3xl font-bold text-slate-800">你的账号诊断</h2>
          <p className="text-sm text-slate-500">基于AI的快速分析</p>
        </div>
        
        {/* 核心诊断卡片 */}
        <div className="bg-white rounded-3xl shadow-lg border-2 border-slate-100 overflow-hidden">
          {/* 当前阶段 */}
          <div className="bg-gradient-to-br from-[#7C9A92] to-[#5C7A72] text-white p-8 text-center">
            <div className="text-xs uppercase tracking-widest opacity-80 font-bold mb-2">当前阶段</div>
            <div className="text-2xl font-bold leading-tight">{result.clarityPhase}</div>
          </div>
          
          {/* 核心判断 */}
          <div className="p-6 border-b-2 border-slate-100">
            <h3 className="text-sm font-bold text-[#7C9A92] uppercase tracking-wider mb-3">核心判断</h3>
            <p className="text-slate-900 font-bold text-lg leading-relaxed">{result.phaseInspiration}</p>
          </div>
          
          {/* 判断依据 */}
          <div className="p-6 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">判断依据</h3>
            <p className="text-slate-600 text-base leading-relaxed">{result.empathyMessage}</p>
          </div>
        </div>
        
        {/* 维度评分雷达图 */}
        <div className="bg-white rounded-3xl shadow-lg border-2 border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">五维度评分</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.dimensions}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} />
                <Radar name="诊断" dataKey="score" stroke="#7C9A92" fill="#7C9A92" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* 解锁完整报告 */}
        {!isUnlocked ? (
          <div className="bg-white rounded-3xl shadow-lg border-2 border-[#D88B7B] p-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D88B7B]/10 rounded-full mb-2">
              <svg className="w-8 h-8 text-[#D88B7B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">解锁完整诊断报告</h3>
            <p className="text-base text-slate-600 leading-relaxed">
              我们为你准备了完整的诊断报告，包含案例实操和7天可执行清单
            </p>
            <Button 
              onClick={() => setShowPayModal(true)} 
              className="w-full py-5 text-xl font-bold bg-gradient-to-r from-[#D88B7B] to-[#C97A6A] text-white border-none shadow-xl shadow-[#D88B7B]/30"
            >
              解锁完整报告（￥29.9）
            </Button>
            <p className="text-xs text-slate-500">赞助开发者一杯咖啡 ☕️</p>
          </div>
        ) : (
          <Button onClick={() => setStep(AppStep.FULL_REPORT)} className="w-full font-bold py-5 text-lg">查看完整报告</Button>
        )}
      </div>
    );
  };


  const renderFullReport = () => {
    if (!result || !result.fullReport) return null;
    const report = result.fullReport;
    
    return (
      <div className="px-6 py-10 space-y-10 fade-in pb-48 max-w-xl mx-auto">
        {/* 标题 */}
        <header className="flex items-center gap-4 border-b-2 border-slate-100 pb-5">
           <button onClick={() => setStep(AppStep.RESULT)} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors">
             <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
             </svg>
           </button>
           <h2 className="text-2xl font-bold text-slate-900">{report.title || '你的完整账号诊断报告'}</h2>
        </header>

        {/* 一句话定性 */}
        <section className="space-y-4">
           <Card className="bg-gradient-to-br from-[#7C9A92] to-[#5C7A72] text-white border-none p-8 shadow-xl">
             <p className="text-lg font-bold leading-relaxed">{report.coreStatus}</p>
           </Card>
        </section>

        {/* 核心矛盾诊断 */}
        <section className="space-y-4">
           <Card className="bg-[#F3E8E2] border-l-4 border-[#D88B7B] p-6 rounded-r-3xl shadow-md">
             <p className="text-slate-900 font-bold text-base leading-relaxed">{report.coreProblem}</p>
           </Card>
        </section>

        {/* 对标案例启发 */}
        {report.benchmarkInsight && (
          <section className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <span className="w-1.5 h-6 bg-[#7C9A92] rounded-full"></span>
              对标案例启发
            </h3>
            <Card className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-3xl">
              <p className="text-slate-700 text-base leading-relaxed">{report.benchmarkInsight}</p>
            </Card>
          </section>
        )}

        {/* 下一步，你可以这样试一次 */}
        <section className="space-y-4">
           <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
             <span className="w-1.5 h-6 bg-[#7C9A92] rounded-full"></span>
             {report.actionableExample.title}
           </h3>
           <Card className="bg-white p-6 space-y-4 border-2 border-[#7C9A92]/20">
             <p className="text-slate-700 text-base leading-relaxed">{report.actionableExample.context}</p>
             <div className="bg-[#7C9A92]/5 p-4 rounded-xl border border-[#7C9A92]/20">
               <p className="text-sm text-[#7C9A92] font-bold uppercase tracking-widest mb-2">示例</p>
               <p className="text-slate-800 font-medium leading-relaxed">{report.actionableExample.example}</p>
             </div>
             <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
               <p className="text-sm text-amber-800 font-bold uppercase tracking-widest mb-2">执行限制</p>
               <p className="text-slate-700 text-sm leading-relaxed">{report.actionableExample.constraint}</p>
             </div>
           </Card>
        </section>

        {/* 7天行动清单 */}
        <section className="space-y-6 pt-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xl">
            <span className="w-2.5 h-8 bg-[#7C9A92] rounded-full"></span>
            7天优化行动清单
          </h3>
          <div className="relative pl-8 space-y-10 border-l-2 border-slate-100 ml-4 py-3">
            {report.sevenDayPlan.map((item, i) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[41px] top-0 w-6 h-6 bg-white border-2 border-[#7C9A92] rounded-full flex items-center justify-center shadow-sm group-hover:bg-[#7C9A92] transition-colors">
                  <div className="w-2.5 h-2.5 bg-[#7C9A92] group-hover:bg-white rounded-full"></div>
                </div>
                <div className="space-y-1">
                   <p className="text-xs font-bold text-[#7C9A92] uppercase tracking-widest">{item.day}</p>
                   <p className="text-base text-slate-700 font-bold leading-relaxed">{item.action}</p>
                   <p className="text-xs text-slate-400 italic">预期目标：{item.goal}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 1 对 1 陪跑：把判断真正变成结果 */}
        <section className="space-y-4 pt-6">
           <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
             <span className="w-1.5 h-6 bg-[#8C6D5E] rounded-full"></span>
             {report.coachingSection.title}
           </h3>
           
           {/* 简短介绍 */}
           <p className="text-slate-600 text-sm leading-relaxed px-2">{report.coachingSection.intro}</p>
           
           {/* 行动入口 */}
           <Card className="bg-gradient-to-br from-[#7C9A92] to-[#5C7A72] p-6 text-center space-y-4 border-none shadow-lg">
             <p className="text-white text-base font-bold">{report.coachingSection.cta.text}</p>
             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
               <p className="text-white text-sm">微信号：<span className="font-mono font-bold text-base">{report.coachingSection.cta.wechatId}</span></p>
               <p className="text-white/80 text-xs">{report.coachingSection.cta.note}</p>
             </div>
             <Button 
               onClick={() => {
                 // 复制微信号到剪贴板
                 navigator.clipboard.writeText(report.coachingSection.cta.wechatId);
                 alert('微信号已复制到剪贴板');
               }}
               className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 text-sm shadow-lg transition-all hover:scale-105"
             >
               复制微信号
             </Button>
           </Card>
        </section>

        {/* 陪伴总结 */}
        <Card className="bg-gradient-to-br from-[#FDFBF7] to-[#F3E8E2] border-[#7C9A92]/20 p-8 space-y-5 text-center shadow-inner">
          <h4 className="font-bold text-[#7C9A92] text-lg">慢慢来，比较快</h4>
          <p className="text-sm text-slate-600 font-bold leading-relaxed">{report.closingMessage}</p>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
           <Button onClick={() => setShowLongReportModal(true)} className="w-full max-w-xl mx-auto py-5 font-bold text-base">生成报告长图</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-700 no-scrollbar overflow-y-auto">
      <main className="max-w-xl mx-auto">
        {step === AppStep.WELCOME && renderWelcome()}
        {step === AppStep.INPUT && renderInput()}
        {step === AppStep.ANALYZING && renderAnalyzing()}
        {step === AppStep.RESULT && renderResult()}
        {step === AppStep.FULL_REPORT && renderFullReport()}
        {step === AppStep.RATE_LIMITED && renderRateLimited()}
      </main>
      {showPayModal && <PaymentModal onClose={() => setShowPayModal(false)} onConfirm={handleUnlockFullReport} />}
      {showLongReportModal && result && <LongReportModal result={result} onClose={() => setShowLongReportModal(false)} />}
      <style>{`
        @keyframes pulse-subtle { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes tip-fade { 0% { opacity: 0; transform: translateY(8px); } 10% { opacity: 1; transform: translateY(0); } 90% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-8px); } }
        .animate-tip-fade { animation: tip-fade 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default App;

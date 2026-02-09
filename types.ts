
export interface UserContext {
  accountStage?: string;
  mainGoal?: string;
  stressPoint?: string;
  profileImage?: string; // 第一张：账号主页
  supplementImage?: string; // 第二张：补充截图
}

export interface DimensionScore {
  name: string;
  score: number;
  description: string;
  detailedAnalysis?: string; // 详细分析（300字以内，分享后展示）
}

export interface FullReport {
  // 报告标题
  title: string;
  // 一句话总判断
  coreStatus: string;
  // 核心矛盾拆解
  coreProblem: string;
  // 对标案例启发（新增）
  benchmarkInsight?: string;
  // 下一步可执行操作
  actionableExample: {
    title: string;
    context: string;  // 今天可以做的
    example: string;  // 本周可以完成的
    constraint: string;  // 容易被忽略但很关键的点
  };
  // 1 对 1 陪跑
  coachingSection: {
    title: string;
    intro: string;
    cta: {
      type: string;
      text: string;
      wechatId: string;
      note: string;
    };
  };
  // 7天行动清单（每天独立）
  sevenDayPlan: {
    day: string;  // Day 1, Day 2, ...
    action: string;
    goal: string;
  }[];
  // 陪伴总结
  closingMessage: string;
}

// 用户解锁状态（用于分享解锁维度详细分析）
export interface UnlockStatus {
  unlocked_dimensions: string[]; // 已解锁的维度名称列表（默认包含"定位清晰度"）
  last_share_date: string; // 最后分享日期
}

export interface DiagnosisResult {
  clarityPhase: string;
  phaseInspiration: string;
  empathyMessage: string;
  dimensions: DimensionScore[]; // 5个维度评分 + 详细分析
  fullReport?: FullReport;
}

export enum AppStep {
  WELCOME = 'WELCOME',
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  FULL_REPORT = 'FULL_REPORT',
  RATE_LIMITED = 'RATE_LIMITED'
}

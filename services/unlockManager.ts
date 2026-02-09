/**
 * 解锁管理器（维度详细分析版）
 * 管理5个维度详细分析的解锁状态
 * 
 * 核心规则：
 * 1. 默认展示"定位清晰度"的详细分析
 * 2. 其他4个维度（内容价值、表达清晰度、信任感、更新节奏）需要分享解锁
 * 3. 每次分享解锁1个维度
 * 4. 每天最多分享4次（解锁所有维度）
 */

import { UnlockStatus } from '../types';

const STORAGE_KEY = 'unlock_status';
const DEFAULT_UNLOCKED = ['定位清晰度']; // 默认解锁的维度

// 所有维度（按顺序）
const ALL_DIMENSIONS = [
  '定位清晰度',  // 默认展示
  '内容价值',    // 分享解锁
  '表达清晰度',  // 分享解锁
  '信任感',      // 分享解锁
  '更新节奏'     // 分享解锁
];

/**
 * 获取当前解锁状态
 */
export const getUnlockStatus = (): UnlockStatus => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const defaultStatus = {
        unlocked_dimensions: [...DEFAULT_UNLOCKED],
        last_share_date: ''
      };
      // 保存默认状态
      saveUnlockStatus(defaultStatus);
      return defaultStatus;
    }
    
    const status: UnlockStatus = JSON.parse(stored);
    
    // 验证数据结构
    if (!status.unlocked_dimensions || !Array.isArray(status.unlocked_dimensions)) {
      console.warn('⚠️ 存储的 unlocked_dimensions 无效，重置为默认值');
      const defaultStatus = {
        unlocked_dimensions: [...DEFAULT_UNLOCKED],
        last_share_date: ''
      };
      // 保存修复后的状态
      saveUnlockStatus(defaultStatus);
      return defaultStatus;
    }
    
    // 检查是否需要重置每日限制
    const today = new Date().toDateString();
    if (status.last_share_date !== today) {
      status.unlocked_dimensions = [...DEFAULT_UNLOCKED];
      status.last_share_date = '';
      saveUnlockStatus(status);
    }
    
    return status;
  } catch (error) {
    console.error('❌ 读取解锁状态失败:', error);
    const defaultStatus = {
      unlocked_dimensions: [...DEFAULT_UNLOCKED],
      last_share_date: ''
    };
    saveUnlockStatus(defaultStatus);
    return defaultStatus;
  }
};

/**
 * 保存解锁状态
 */
export const saveUnlockStatus = (status: UnlockStatus): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
};

/**
 * 检查某个维度是否已解锁
 */
export const isDimensionUnlocked = (dimensionName: string): boolean => {
  const status = getUnlockStatus();
  // 安全检查：确保 unlocked_dimensions 存在且是数组
  if (!status.unlocked_dimensions || !Array.isArray(status.unlocked_dimensions)) {
    console.warn('⚠️ unlocked_dimensions 不存在或不是数组，使用默认值');
    return DEFAULT_UNLOCKED.includes(dimensionName);
  }
  return status.unlocked_dimensions.includes(dimensionName);
};

/**
 * 检查是否可以使用分享奖励
 */
export const canUseShareReward = (): boolean => {
  const status = getUnlockStatus();
  // 安全检查
  if (!status.unlocked_dimensions || !Array.isArray(status.unlocked_dimensions)) {
    return true; // 如果数据异常，允许分享
  }
  return status.unlocked_dimensions.length < ALL_DIMENSIONS.length;
};

/**
 * 获取剩余可解锁的维度数量
 */
export const getRemainingDimensionsCount = (): number => {
  const status = getUnlockStatus();
  // 安全检查
  if (!status.unlocked_dimensions || !Array.isArray(status.unlocked_dimensions)) {
    return ALL_DIMENSIONS.length - DEFAULT_UNLOCKED.length;
  }
  return ALL_DIMENSIONS.length - status.unlocked_dimensions.length;
};

/**
 * 执行分享解锁
 * 返回新解锁的维度名称
 */
export const unlockByShare = (): string | null => {
  const status = getUnlockStatus();
  
  // 检查是否可以解锁
  if (!canUseShareReward()) {
    return null;
  }
  
  // 找出未解锁的维度
  const unlockedSet = new Set(status.unlocked_dimensions);
  const toUnlock = ALL_DIMENSIONS.filter(name => !unlockedSet.has(name));
  
  if (toUnlock.length === 0) {
    return null;
  }
  
  // 解锁第一个未解锁的维度
  const newlyUnlocked = toUnlock[0];
  status.unlocked_dimensions.push(newlyUnlocked);
  status.last_share_date = new Date().toDateString();
  
  saveUnlockStatus(status);
  
  return newlyUnlocked;
};

/**
 * 重置解锁状态（用于开发测试）
 */
export const resetUnlockStatus = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * 检查是否所有维度已解锁
 */
export const isAllDimensionsUnlocked = (): boolean => {
  const status = getUnlockStatus();
  // 安全检查：确保 unlocked_dimensions 存在且是数组
  if (!status.unlocked_dimensions || !Array.isArray(status.unlocked_dimensions)) {
    return false;
  }
  return status.unlocked_dimensions.length >= ALL_DIMENSIONS.length;
};

/**
 * 获取所有维度名称列表
 */
export const getAllDimensions = (): string[] => {
  return [...ALL_DIMENSIONS];
};


import { Medicine } from "../types";

const STORAGE_KEY_PREFIX = 'pillpal_ds_limit_';
const getTodayKey = () => `${STORAGE_KEY_PREFIX}${new Date().toISOString().split('T')[0]}`;

export const getRemainingUses = (): number => {
  const count = parseInt(localStorage.getItem(getTodayKey()) || '0', 10);
  return Math.max(0, 10 - count); // DeepSeek 成本更低，增加到10次
};

const incrementUsage = () => {
  const count = parseInt(localStorage.getItem(getTodayKey()) || '0', 10);
  localStorage.setItem(getTodayKey(), (count + 1).toString());
};

/**
 * 使用 DeepSeek 分析药品信息
 * @param input 可以是药品名、描述、或电商链接
 */
export const analyzeMedicineContent = async (input: string): Promise<Partial<Medicine> | null> => {
  const remaining = getRemainingUses();
  if (remaining <= 0) throw new Error("今日 AI 识别额度已用完");

  try {
    const response = await fetch('/api/analyze-medicine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'AI 识别失败');
    
    incrementUsage();
    return data;
  } catch (error: any) {
    console.error("DeepSeek Service Error:", error);
    throw error;
  }
};

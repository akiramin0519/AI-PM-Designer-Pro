/**
 * 使用 Zod 進行執行時型別驗證
 */
import { z } from 'zod';
import { ProductAnalysis, MarketingRoute, DirectorOutput, ContentItem, ContentPlan } from '../types';

// ProductAnalysis Schema
export const ProductAnalysisSchema = z.object({
  name: z.string().min(1, '產品名稱不能為空'),
  visual_description: z.string().min(10, '視覺描述至少需要 10 個字元'),
  key_features_zh: z.string().min(10, '核心賣點至少需要 10 個字元'),
});

// PromptData Schema
export const PromptDataSchema = z.object({
  prompt_en: z.string().min(50, '提示詞至少需要 50 個字元'),
  summary_zh: z.string().min(10, '摘要至少需要 10 個字元'),
});

// MarketingRoute Schema
export const MarketingRouteSchema = z.object({
  route_name: z.string().min(2).max(20),
  headline_zh: z.string().min(5).max(30),
  subhead_zh: z.string().min(10).max(50),
  style_brief_zh: z.string().min(20),
  target_audience_zh: z.string().optional(),
  visual_elements_zh: z.string().optional(),
  image_prompts: z.array(PromptDataSchema).length(3, '必須包含恰好 3 個提示詞'),
});

// DirectorOutput Schema
export const DirectorOutputSchema = z.object({
  product_analysis: ProductAnalysisSchema,
  marketing_routes: z.array(MarketingRouteSchema).length(3, '必須包含恰好 3 條行銷路線'),
});

// ContentItem Schema
export const ContentItemSchema = z.object({
  id: z.string().regex(/^img_\d+_(white|lifestyle|hook|problem|solution|features|trust|cta)$/, 'ID 格式不正確'),
  type: z.enum(['main_white', 'main_lifestyle', 'story_slide']),
  ratio: z.enum(['1:1', '9:16', '16:9']),
  title_zh: z.string().min(5).max(30),
  copy_zh: z.string().min(20).max(100),
  visual_prompt_en: z.string().min(50).max(500),
  visual_summary_zh: z.string().min(10).max(50),
});

// ContentPlan Schema
export const ContentPlanSchema = z.object({
  plan_name: z.string().min(10).max(50),
  items: z.array(ContentItemSchema).length(8, '必須包含恰好 8 個內容項目'),
});

/**
 * 驗證並解析 DirectorOutput
 */
export const validateDirectorOutput = (data: unknown): DirectorOutput => {
  try {
    return DirectorOutputSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`API 回應格式驗證失敗：\n${errors}`);
    }
    throw error;
  }
};

/**
 * 驗證並解析 ContentPlan
 */
export const validateContentPlan = (data: unknown): ContentPlan => {
  try {
    return ContentPlanSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`內容企劃格式驗證失敗：\n${errors}`);
    }
    throw error;
  }
};

/**
 * 驗證使用者輸入
 */
export const validateProductName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: '產品名稱不能為空' };
  }
  if (name.length > 100) {
    return { valid: false, error: '產品名稱不能超過 100 個字元' };
  }
  return { valid: true };
};

export const validateBrandContext = (context: string): { valid: boolean; error?: string } => {
  if (context.length > 5000) {
    return { valid: false, error: '品牌資訊不能超過 5000 個字元' };
  }
  return { valid: true };
};

export const validateRefCopy = (copy: string): { valid: boolean; error?: string } => {
  if (copy.length > 10000) {
    return { valid: false, error: '參考文案不能超過 10000 個字元' };
  }
  return { valid: true };
};


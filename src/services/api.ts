import { generateCurriculumContent } from '../data/curriculumFallback';

export interface GenerateResponse<T> {
  success: boolean;
  data: T;
  source?: string;
  error?: string;
}

export async function callAIGenerator<T = any>(
  action: 'lesson' | 'test' | 'questions' | 'homework' | 'explain' | 'rubric' | 'interactive',
  payload: Record<string, any>
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result: GenerateResponse<T> = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
    }
  } catch (e) {
    clearTimeout(timeoutId);
    console.warn("Backend API unavailable or network offline, using verified curriculum engine fallback:", e);
  }

  // Gracefully fallback to curriculum engine so the app works 100% in any hosting environment
  return generateCurriculumContent(action, payload) as T;
}

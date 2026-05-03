// API Configuration and Utility Functions
import type { ChatMessage, ChatCompletionResponse } from '@/types/api';

const DEFAULT_API_KEY = import.meta.env.VITE_GLM_API_KEY || '';
const DEFAULT_API_ENDPOINT = import.meta.env.VITE_GLM_API_ENDPOINT || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const DEFAULT_MODEL = import.meta.env.VITE_GLM_MODEL || 'glm-4.7';
const FREE_GENERATION_LIMIT = parseInt(import.meta.env.VITE_FREE_GENERATION_LIMIT || '3', 10);

/**
 * Get user's custom API key from localStorage
 */
export function getUserApiKey(): string | null {
  const customKey = localStorage.getItem('custom_glm_api_key');
  return customKey || null;
}

/**
 * Set user's custom API key
 */
export function setUserApiKey(apiKey: string): void {
  localStorage.setItem('custom_glm_api_key', apiKey);
}

/**
 * Get the effective API key (user's custom key or default)
 */
export function getEffectiveApiKey(): string {
  return getUserApiKey() || DEFAULT_API_KEY;
}

/**
 * Get generation count from localStorage
 */
export function getGenerationCount(): number {
  const count = localStorage.getItem('generation_count');
  return count ? parseInt(count, 10) : 0;
}

/**
 * Increment generation count
 */
export function incrementGenerationCount(): number {
  const currentCount = getGenerationCount();
  const newCount = currentCount + 1;
  localStorage.setItem('generation_count', newCount.toString());
  return newCount;
}

/**
 * Check if user has reached the free generation limit
 */
export function hasReachedFreeLimit(): boolean {
  const count = getGenerationCount();
  const hasCustomKey = getUserApiKey() !== null;
  
  // If user has custom API key, no limit
  if (hasCustomKey) {
    return false;
  }
  
  // Otherwise, check against free limit
  return count >= FREE_GENERATION_LIMIT;
}

/**
 * Get remaining free generations
 */
export function getRemainingGenerations(): number {
  const hasCustomKey = getUserApiKey() !== null;
  
  if (hasCustomKey) {
    return -1; // Unlimited
  }
  
  return Math.max(0, FREE_GENERATION_LIMIT - getGenerationCount());
}

/**
 * Make a chat completion request to GLM API
 */
export async function chatCompletion(
  messages: ChatMessage[],
  model: string = DEFAULT_MODEL,
  apiKey?: string
): Promise<ChatCompletionResponse> {
  const effectiveApiKey = apiKey || getEffectiveApiKey();
  const endpoint = DEFAULT_API_ENDPOINT;
  
  if (!effectiveApiKey) {
    throw new Error('No API key configured. Please configure your GLM API key.');
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API调用失败 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat completion error:', error);
    throw error;
  }
}

/**
 * Generate a suggestion for visa document issues
 */
export async function generateDocumentSuggestion(
  itemTitle: string,
  issue: string,
  apiKey?: string
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: '你是一个专业的法国签证申请顾问。用户在准备法国签证材料时遇到了问题，请提供具体、实用的解决方案和替代建议。回答要简洁明了，重点突出可行性。'
    },
    {
      role: 'user',
      content: `用户在准备法国签证材料"${itemTitle}"时遇到以下问题：${issue}。请提供具体的解决方案和替代建议。`
    }
  ];

  const response = await chatCompletion(messages, DEFAULT_MODEL, apiKey);
  const content = response.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('未能获取AI建议');
  }

  return content;
}

/**
 * Generate a cover letter for France visa application
 */
export async function generateCoverLetter(
  personalInfo: {
    name: string;
    passportNumber: string;
    travelPurpose: string;
    travelDates: string;
    itinerary: string;
  },
  completedItems: string[],
  issueItems: { id: number; description: string }[],
  apiKey?: string
): Promise<string> {
  const itemNamesEn: Record<number, string> = {
    1: "France-Visas application form and receipt",
    2: "Passport",
    3: "Passport photos",
    4: "Flight reservation",
    5: "Hotel booking confirmation",
    6: "Travel insurance",
    7: "Bank statements",
    8: "Employment certificate",
    9: "Business license",
    10: "Household registration booklet",
    11: "Identity card",
    12: "Travel itinerary",
    13: "Other fixed asset proofs",
    14: "Marriage status certificate",
    15: "TLScontact appointment confirmation",
    16: "Other supplementary materials"
  };

  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: `Please generate a professional and polite cover letter in English for a France visa application based on the following information:

Personal Information:
- Name: ${personalInfo.name}
- Passport Number: ${personalInfo.passportNumber}
- Travel Purpose (in Chinese): ${personalInfo.travelPurpose}
- Travel Dates (in Chinese): ${personalInfo.travelDates}
- Itinerary (in Chinese): ${personalInfo.itinerary}

Completed Documents:
${completedItems.map(item => `- ${item}`).join('\n')}

Documents with Issues:
${issueItems.map(item => `- ${itemNamesEn[item.id]}: ${item.description}`).join('\n')}

Requirements:
1. Translate any Chinese information into natural English
2. Expand on travel purposes with realistic details about why visiting France
3. Provide professional explanations for any document issues
4. Emphasize strong ties to China and intention to return
5. Use formal, respectful tone appropriate for visa application
6. Include all standard sections: purpose, itinerary, documents, ties to China, financial capacity, compliance commitment
7. Make it personalized based on the provided information

The letter should be comprehensive, professional, and persuasive while maintaining honesty about any document limitations.`
    }
  ];

  const response = await chatCompletion(messages, DEFAULT_MODEL, apiKey);
  const content = response.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('未能生成Cover Letter');
  }

  return content;
}

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
    employmentStatus: 'employed' | 'student' | 'retired' | 'unemployed' | 'self-employed';
    fundingSource: 'salary' | 'parents' | 'pension' | 'unemployment-benefits' | 'savings' | 'other';
    maritalStatus: 'single' | 'married-spouse-in-china' | 'married-spouse-abroad' | 'divorced' | 'widowed';
    hasAssetsInChina: boolean;
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

  // Build intelligent prompt based on user's actual situation
  let additionalRequirements = [];
  
  // Employment status handling
  const employmentDescriptions = {
    'employed': 'stable employment in China',
    'student': 'student status with ongoing studies',
    'retired': 'retirement with pension benefits',
    'unemployed': 'current unemployment with unemployment benefits',
    'self-employed': 'self-employment or business ownership'
  };
  
  // Funding source handling
  const fundingDescriptions = {
    'salary': 'personal salary income',
    'parents': 'financial support from parents',
    'pension': 'pension benefits',
    'unemployment-benefits': 'unemployment insurance benefits',
    'savings': 'personal savings',
    'other': 'other financial resources'
  };
  
  // Marital status handling
  const maritalDescriptions = {
    'single': 'single status',
    'married-spouse-in-china': 'marriage with spouse residing in China',
    'married-spouse-abroad': 'marriage with spouse residing abroad',
    'divorced': 'divorced status',
    'widowed': 'widowed status'
  };
  
  // Build supporting documents list - ONLY include what user actually completed
  let supportingDocuments = [];
  if (completedItems.includes("Identity card")) {
    supportingDocuments.push("Identity card");
  }
  if (completedItems.includes("Employment certificate")) {
    supportingDocuments.push("Employment certificate");
  }
  if (completedItems.includes("Bank statements")) {
    supportingDocuments.push("Bank statements");
  }
  if (completedItems.includes("Business license")) {
    supportingDocuments.push("Business license");
  }
  if (completedItems.includes("Household registration booklet")) {
    supportingDocuments.push("Household registration booklet");
  }
  if (completedItems.includes("Marriage status certificate")) {
    supportingDocuments.push("Marriage status certificate");
  }
  if (completedItems.includes("Other fixed asset proofs")) {
    supportingDocuments.push("Fixed asset proofs");
  }
  
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
- Employment Status: ${employmentDescriptions[personalInfo.employmentStatus]} (this affects how you describe the applicant's situation)
- Funding Source: ${fundingDescriptions[personalInfo.fundingSource]} (this affects how you describe financial support)
- Marital Status: ${maritalDescriptions[personalInfo.maritalStatus]} (this affects family ties to China)
- Has Assets in China: ${personalInfo.hasAssetsInChina ? 'Yes' : 'No'} (only mention assets if Yes)

Completed Documents (ONLY mention these exact documents, do not add any others):
${completedItems.map(item => `- ${item}`).join('\n')}

Documents with Issues (IMPORTANT: These need special explanation in the letter):
${issueItems.length > 0 ? issueItems.map(item => `- ${itemNamesEn[item.id]}: ${item.description}`).join('\n') : '- None'}

CRITICAL REQUIREMENTS:
1. Translate any Chinese information into natural English
2. Expand on travel purposes with realistic details about why visiting France
3. IMPORTANT: For documents with issues - create a DEDICATED PARAGRAPH after the supporting documents section specifically explaining these issues:
   ${issueItems.length > 0 ? issueItems.map(item => `   - For "${itemNamesEn[item.id]}": Explain that the user has the issue: "${item.description}" and provide a professional, reassuring explanation`).join('\n') : '   - No documents with issues to explain'}
   - This paragraph should be titled "Additional Notes on Supporting Documents" or similar
   - Provide honest but positive explanations that show the documents are still valid
   - Example format: "Regarding [document name], I would like to clarify that [explanation based on user's issue description]. Despite this, the document demonstrates..."
4. Emphasize strong ties to China and intention to return:
   - For marital status: describe family ties appropriately based on ${maritalDescriptions[personalInfo.maritalStatus]}
   - For employment: describe ${employmentDescriptions[personalInfo.employmentStatus]}
   - For assets: ${personalInfo.hasAssetsInChina ? 'mention property or assets in China as strong ties' : 'DO NOT mention property or assets'}
5. Describe financial capacity based on ${fundingDescriptions[personalInfo.fundingSource]}
6. Use formal, respectful tone appropriate for visa application
7. Include sections: purpose, itinerary, supporting documents (${supportingDocuments.join(', ') || 'general documents'})${issueItems.length > 0 ? ', additional notes on documents with issues' : ''}, ties to China, financial capacity, compliance commitment
8. Make it personalized based on the provided information
9. IMPORTANT: Only mention documents that the user actually completed. Do NOT add household registration booklet if not completed, do NOT add marriage certificate if not completed, etc.
10. Be honest about the applicant's actual situation - if unemployed, do not fabricate employment; if student, describe student status; etc.
${issueItems.length > 0 ? `11. CRITICAL: The user has specifically marked ${issueItems.length} document(s) with issues and provided explanations. You MUST include a dedicated paragraph explaining these issues. This is essential for the visa application.` : ''}

The letter should be comprehensive, professional, and persuasive while maintaining complete honesty about the applicant's actual situation.`
    }
  ];

  const response = await chatCompletion(messages, DEFAULT_MODEL, apiKey);
  const content = response.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('未能生成Cover Letter');
  }

  return content;
}

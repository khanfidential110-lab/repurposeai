// OpenRouter API Client - Fallback to multiple free AI models

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface OpenRouterOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface OpenRouterResponse {
    id: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// Free models available on OpenRouter
export const OPENROUTER_MODELS = {
    LLAMA_3_8B_FREE: 'meta-llama/llama-3-8b-instruct:free',
    PHI_3_MINI_FREE: 'microsoft/phi-3-mini-128k-instruct:free',
    QWEN_2_7B_FREE: 'qwen/qwen-2-7b-instruct:free',
    MISTRAL_7B_FREE: 'mistralai/mistral-7b-instruct:free',
} as const;

export class OpenRouterClient {
    private apiKey: string;
    private rateLimitRetries: number = 3;
    private modelFallbackOrder: string[];

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.modelFallbackOrder = [
            OPENROUTER_MODELS.LLAMA_3_8B_FREE,
            OPENROUTER_MODELS.QWEN_2_7B_FREE,
        ];
    }

    async chat(
        messages: OpenRouterMessage[],
        options: OpenRouterOptions = {}
    ): Promise<OpenRouterResponse> {
        const {
            model = OPENROUTER_MODELS.LLAMA_3_8B_FREE,
            temperature = 0.7,
            maxTokens = 4096,
        } = options;

        let lastError: Error | null = null;
        const modelsToTry = [model, ...this.modelFallbackOrder.filter(m => m !== model)];

        for (const currentModel of modelsToTry) {
            for (let attempt = 0; attempt < this.rateLimitRetries; attempt++) {
                try {
                    const response = await fetch(OPENROUTER_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.apiKey}`,
                            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                            'X-Title': 'RepurposeAI',
                        },
                        body: JSON.stringify({
                            model: currentModel,
                            messages,
                            temperature,
                            max_tokens: maxTokens,
                        }),
                    });

                    if (response.status === 429) {
                        // Rate limited - wait and retry
                        console.warn(`OpenRouter rate limited on ${currentModel}, waiting...`);
                        await new Promise((resolve) => setTimeout(resolve, 5000));
                        continue;
                    }

                    if (response.status === 402 || response.status === 503) {
                        // Model unavailable or requires payment - try next model
                        console.warn(`OpenRouter model ${currentModel} unavailable, trying next...`);
                        break;
                    }

                    if (!response.ok) {
                        const error = await response.text();
                        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
                    }

                    return await response.json();
                } catch (error) {
                    lastError = error as Error;
                    console.error(`OpenRouter attempt failed (${currentModel}):`, error);
                }
            }
        }

        throw lastError || new Error('OpenRouter API failed after all retries and fallbacks');
    }

    async generateText(prompt: string, options: OpenRouterOptions = {}): Promise<string> {
        const messages: OpenRouterMessage[] = [
            { role: 'user', content: prompt },
        ];

        const response = await this.chat(messages, options);
        return response.choices[0]?.message?.content || '';
    }

    async generateWithSystemPrompt(
        systemPrompt: string,
        userPrompt: string,
        options: OpenRouterOptions = {}
    ): Promise<string> {
        const messages: OpenRouterMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ];

        const response = await this.chat(messages, options);
        return response.choices[0]?.message?.content || '';
    }
}

// Create singleton instance
let openRouterClient: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
    if (!openRouterClient) {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENROUTER_API_KEY environment variable is not set');
        }
        openRouterClient = new OpenRouterClient(apiKey);
    }
    return openRouterClient;
}

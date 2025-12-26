// AI Provider - Smart switching between Groq and OpenRouter

import { getGroqClient, GroqClient, GROQ_MODELS } from './groq';
import { getOpenRouterClient, OpenRouterClient, OPENROUTER_MODELS } from './openrouter';

export type AIProvider = 'groq' | 'openrouter';

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIOptions {
    provider?: AIProvider;
    temperature?: number;
    maxTokens?: number;
}

class AIProviderManager {
    private currentProvider: AIProvider = 'groq';
    private groqClient: GroqClient | null = null;
    private openRouterClient: OpenRouterClient | null = null;
    private providerFailures: Map<AIProvider, number> = new Map();
    private maxFailures: number = 3;

    private getGroq(): GroqClient {
        if (!this.groqClient) {
            this.groqClient = getGroqClient();
        }
        return this.groqClient;
    }

    private getOpenRouter(): OpenRouterClient {
        if (!this.openRouterClient) {
            this.openRouterClient = getOpenRouterClient();
        }
        return this.openRouterClient;
    }

    private recordFailure(provider: AIProvider): void {
        const failures = (this.providerFailures.get(provider) || 0) + 1;
        this.providerFailures.set(provider, failures);

        // Switch to other provider if too many failures
        if (failures >= this.maxFailures) {
            this.currentProvider = provider === 'groq' ? 'openrouter' : 'groq';
            console.log(`Switching to ${this.currentProvider} after ${failures} failures`);
        }
    }

    private recordSuccess(provider: AIProvider): void {
        this.providerFailures.set(provider, 0);
    }

    async generate(
        systemPrompt: string,
        userPrompt: string,
        options: AIOptions = {}
    ): Promise<string> {
        const { provider, temperature = 0.7, maxTokens = 4096 } = options;
        const providerToUse = provider || this.currentProvider;

        // Try primary provider first
        try {
            let result: string;

            if (providerToUse === 'groq') {
                result = await this.getGroq().generateWithSystemPrompt(
                    systemPrompt,
                    userPrompt,
                    { model: GROQ_MODELS.LLAMA_3_70B, temperature, maxTokens }
                );
            } else {
                result = await this.getOpenRouter().generateWithSystemPrompt(
                    systemPrompt,
                    userPrompt,
                    { model: OPENROUTER_MODELS.LLAMA_3_8B_FREE, temperature, maxTokens }
                );
            }

            this.recordSuccess(providerToUse);
            return result;
        } catch (error) {
            console.error(`Provider ${providerToUse} failed:`, error);
            this.recordFailure(providerToUse);

            // Try fallback provider
            const fallbackProvider: AIProvider = providerToUse === 'groq' ? 'openrouter' : 'groq';

            try {
                let result: string;

                if (fallbackProvider === 'groq') {
                    result = await this.getGroq().generateWithSystemPrompt(
                        systemPrompt,
                        userPrompt,
                        { model: GROQ_MODELS.LLAMA_3_70B, temperature, maxTokens }
                    );
                } else {
                    result = await this.getOpenRouter().generateWithSystemPrompt(
                        systemPrompt,
                        userPrompt,
                        { model: OPENROUTER_MODELS.LLAMA_3_8B_FREE, temperature, maxTokens }
                    );
                }

                this.recordSuccess(fallbackProvider);
                this.currentProvider = fallbackProvider;
                return result;
            } catch (fallbackError) {
                console.error(`Fallback provider ${fallbackProvider} also failed:`, fallbackError);
                this.recordFailure(fallbackProvider);
                throw new Error('All AI providers failed. Please try again later.');
            }
        }
    }

    getCurrentProvider(): AIProvider {
        return this.currentProvider;
    }

    getStatus(): { provider: AIProvider; groqFailures: number; openRouterFailures: number } {
        return {
            provider: this.currentProvider,
            groqFailures: this.providerFailures.get('groq') || 0,
            openRouterFailures: this.providerFailures.get('openrouter') || 0,
        };
    }
}

// Singleton instance
let providerManager: AIProviderManager | null = null;

export function getAIProvider(): AIProviderManager {
    if (!providerManager) {
        providerManager = new AIProviderManager();
    }
    return providerManager;
}

// Convenience function for simple generation
export async function generateAI(
    systemPrompt: string,
    userPrompt: string,
    options: AIOptions = {}
): Promise<string> {
    return getAIProvider().generate(systemPrompt, userPrompt, options);
}

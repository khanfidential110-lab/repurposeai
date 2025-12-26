// Groq API Client - Free AI models (Llama 3.1, Mixtral)

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface GroqOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface GroqResponse {
    id: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// Available free models on Groq
export const GROQ_MODELS = {
    LLAMA_3_70B: 'llama-3.3-70b-versatile',
    LLAMA_3_8B: 'llama-3.1-8b-instant',
    MIXTRAL: 'mixtral-8x7b-32768',
    GEMMA_7B: 'gemma-2-9b-it',
} as const;

export class GroqClient {
    private apiKey: string;
    private rateLimitRetries: number = 3;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async chat(
        messages: GroqMessage[],
        options: GroqOptions = {}
    ): Promise<GroqResponse> {
        const {
            model = GROQ_MODELS.LLAMA_3_70B,
            temperature = 0.7,
            maxTokens = 4096,
        } = options;

        let lastError: Error | null = null;

        for (let attempt = 0; attempt < this.rateLimitRetries; attempt++) {
            try {
                const response = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature,
                        max_tokens: maxTokens,
                    }),
                });

                if (response.status === 429) {
                    // Rate limited - wait and retry
                    const retryAfter = parseInt(response.headers.get('retry-after') || '5');
                    console.warn(`Groq rate limited, waiting ${retryAfter}s...`);
                    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
                    continue;
                }

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(`Groq API error: ${response.status} - ${error}`);
                }

                return await response.json();
            } catch (error) {
                lastError = error as Error;
                console.error(`Groq attempt ${attempt + 1} failed:`, error);
            }
        }

        throw lastError || new Error('Groq API failed after retries');
    }

    async generateText(prompt: string, options: GroqOptions = {}): Promise<string> {
        const messages: GroqMessage[] = [
            { role: 'user', content: prompt },
        ];

        const response = await this.chat(messages, options);
        return response.choices[0]?.message?.content || '';
    }

    async generateWithSystemPrompt(
        systemPrompt: string,
        userPrompt: string,
        options: GroqOptions = {}
    ): Promise<string> {
        const messages: GroqMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ];

        const response = await this.chat(messages, options);
        return response.choices[0]?.message?.content || '';
    }

    async transcribe(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', 'whisper-large-v3');

        try {
            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Groq Transcription API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            return data.text || '';
        } catch (error) {
            console.error('Groq transcription failed:', error);
            throw error;
        }
    }
}

// Create singleton instance
let groqClient: GroqClient | null = null;

export function getGroqClient(): GroqClient {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY environment variable is not set');
        }
        groqClient = new GroqClient(apiKey);
    }
    return groqClient;
}

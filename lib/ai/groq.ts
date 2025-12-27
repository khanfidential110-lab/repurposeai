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
        const result = await this.transcribeWithTimestamps(file);
        return result.text;
    }

    /**
     * Transcribe audio/video with detailed timestamps for clip extraction
     */
    async transcribeWithTimestamps(file: File): Promise<{
        text: string;
        segments: Array<{
            id: number;
            start: number;
            end: number;
            text: string;
        }>;
        duration: number;
    }> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', 'whisper-large-v3');
        formData.append('response_format', 'verbose_json');
        formData.append('timestamp_granularities[]', 'segment');

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

            // Parse segments from Groq response
            const segments = (data.segments || []).map((seg: {
                id: number;
                start: number;
                end: number;
                text: string;
            }) => ({
                id: seg.id,
                start: seg.start,
                end: seg.end,
                text: seg.text.trim(),
            }));

            return {
                text: data.text || '',
                segments,
                duration: data.duration || 0,
            };
        } catch (error) {
            console.error('Groq transcription failed:', error);
            throw error;
        }
    }

    /**
     * Use LLM to identify the best clips from a transcript
     */
    async identifyBestClips(
        transcript: string,
        segments: Array<{ id: number; start: number; end: number; text: string }>,
        options: { numClips?: number; style?: string } = {}
    ): Promise<Array<{ start: number; end: number; text: string; reason: string }>> {
        const { numClips = 3, style = 'viral' } = options;

        const prompt = `Analyze this video transcript and identify the ${numClips} best clips for ${style} content.

TRANSCRIPT WITH TIMESTAMPS:
${segments.map(s => `[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s]: ${s.text}`).join('\n')}

Return a JSON array with the best ${numClips} clips. Each clip should have:
- start: start time in seconds
- end: end time in seconds  
- text: the text content of the clip
- reason: brief explanation why this is a good clip

Focus on:
- Emotional moments
- Key insights or tips
- Funny/engaging moments
- Strong opening hooks

Return ONLY valid JSON array, no other text.`;

        const response = await this.generateWithSystemPrompt(
            'You are a video editor expert at identifying viral-worthy clips. Return only valid JSON.',
            prompt,
            { temperature: 0.3 }
        );

        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('No JSON array found in response');
            }
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Failed to parse LLM clips response:', error);
            // Fallback: return first N segments
            return segments.slice(0, numClips).map(s => ({
                start: s.start,
                end: s.end,
                text: s.text,
                reason: 'Auto-selected segment'
            }));
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

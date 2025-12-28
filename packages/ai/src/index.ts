import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Model Types
export type AIProvider = 'gemini' | 'openai' | 'anthropic';

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  temperature?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Provider Clients
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiApiKey);

const openaiApiKey = process.env.OPENAI_API_KEY || "";
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const anthropicApiKey = process.env.ANTHROPIC_API_KEY || "";
const anthropic = anthropicApiKey ? new Anthropic({ apiKey: anthropicApiKey }) : null;

// Available Models
export const AVAILABLE_MODELS: Record<AIProvider, { id: string; name: string; description: string }[]> = {
  gemini: [
    { id: 'gemini-3.0-pro', name: 'Gemini 3.0 Pro', description: 'Next generation reasoning and capability' },
    { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash', description: 'Next generation speed and efficiency' },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', description: 'Fastest and most capable preview model' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Advanced reasoning and long context' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient for high-volume tasks' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable OpenAI model' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High performance' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Best balance of speed and capability' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful Claude model' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest Claude model' },
  ]
};

// Default Models
export const aiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function generateEmbedding(text: string) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

// Unified Chat Function
export async function chat(
  messages: ChatMessage[],
  config: AIModelConfig = { provider: 'gemini', model: 'gemini-2.0-flash' }
): Promise<string> {
  const { provider, model, temperature = 0.7 } = config;

  switch (provider) {
    case 'gemini': {
      const geminiModel = genAI.getGenerativeModel({ model });
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';
      const chatHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: m.content }]
        }));
      
      // For single prompt, use generateContent
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      const fullPrompt = systemMessage ? `${systemMessage}\n\n${lastUserMessage}` : lastUserMessage;
      
      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature }
      });
      return result.response.text();
    }

    case 'openai': {
      if (!openai) throw new Error('OpenAI API key not configured');
      
      const response = await openai.chat.completions.create({
        model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature
      });
      return response.choices[0]?.message?.content || '';
    }

    case 'anthropic': {
      if (!anthropic) throw new Error('Anthropic API key not configured');
      
      const systemMessage = messages.find(m => m.role === 'system')?.content;
      const chatMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));
      
      const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system: systemMessage,
        messages: chatMessages
      });
      
      const textBlock = response.content.find(block => block.type === 'text');
      return textBlock && 'text' in textBlock ? textBlock.text : '';
    }

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Check which providers are available
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = ['gemini']; // Gemini is always available with key
  if (openai) providers.push('openai');
  if (anthropic) providers.push('anthropic');
  return providers;
}

export { genAI };

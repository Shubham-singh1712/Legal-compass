export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  jsonSchema?: Record<string, any>;
}

export interface LLMProvider {
  name: string;
  isAvailable(): boolean;
  generateText(messages: LLMMessage[], options?: LLMOptions): Promise<string>;
  generateStructured<T>(messages: LLMMessage[], schemaDescription: string): Promise<T>;
}

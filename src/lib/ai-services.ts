//src/lib/ai-services.ts
// AI Services Configuration and Management

export interface AIServiceConfig {
  provider: "openai" | "google" | "anthropic" | "azure";
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export class AIServiceManager {
  private configs: Map<string, AIServiceConfig> = new Map();

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    // OpenAI Configuration
    if (process.env.OPENAI_API_KEY) {
      this.configs.set("openai", {
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4",
        baseUrl: "https://api.openai.com/v1",
      });
    }

    // Google Gemini Configuration
    if (process.env.GOOGLE_AI_API_KEY) {
      this.configs.set("google", {
        provider: "google",
        apiKey: process.env.GOOGLE_AI_API_KEY,
        model: "gemini-2.0-flash",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      });
    }

    // Note: Anthropic removed since you don't have API key
    // Azure OpenAI Configuration
    if (process.env.AZURE_OPENAI_API_KEY) {
      this.configs.set("azure", {
        provider: "azure",
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        model: "gpt-4",
        baseUrl: process.env.AZURE_OPENAI_ENDPOINT,
      });
    }
  }

  async generateChatResponse(
    message: string,
    context: any,
    provider: string = "google" // Default to Google since it's free
  ): Promise<string> {
    const config = this.configs.get(provider);
    if (!config) {
      // Fallback to any available provider
      const availableProvider = this.getAvailableProviders()[0];
      if (!availableProvider) {
        throw new Error("No AI provider configured");
      }
      return this.generateChatResponse(message, context, availableProvider);
    }

    switch (config.provider) {
      case "openai":
        return this.generateOpenAIResponse(message, context, config);
      case "google":
        return this.generateGoogleResponse(message, context, config);
      case "azure":
        return this.generateAzureResponse(message, context, config);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  private async generateOpenAIResponse(
    message: string,
    context: any,
    config: AIServiceConfig
  ): Promise<string> {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(context),
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async generateGoogleResponse(
    message: string,
    context: any,
    config: AIServiceConfig
  ): Promise<string> {
    const response = await fetch(
      `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${this.getSystemPrompt(context)}\n\nUser: ${message}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async generateAzureResponse(
    message: string,
    context: any,
    config: AIServiceConfig
  ): Promise<string> {
    const response = await fetch(
      `${config.baseUrl}/openai/deployments/${config.model}/chat/completions?api-version=2023-12-01-preview`,
      {
        method: "POST",
        headers: {
          "api-key": config.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: this.getSystemPrompt(context),
            },
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private getSystemPrompt(context: any): string {
    return `You are an AI assistant for the UDSM Hub Management System, a university platform for student collaboration and learning.
  
  Context:
  - User Role: ${context?.userRole || "Student"}
  - Platform: University of Dar es Salaam Hub Management System
  - Purpose: Help users navigate the platform, understand features, and get support
  
  Your capabilities:
  - Answer questions about platform features (hubs, events, projects, programmes)
  - Guide users through common tasks
  - Provide information about policies and procedures
  - Offer technical support for basic issues
  - Escalate complex issues to human support
  
  Guidelines:
  - Be helpful, friendly, and professional
  - Provide accurate information about the UDSM HMS platform
  - Use clear, concise language appropriate for university students
  - When you don't know something, admit it and suggest contacting support
  - Focus on actionable advice and step-by-step guidance
  - Maintain user privacy and don't ask for sensitive information
  
  Remember: You're representing the University of Dar es Salaam and should maintain high standards of professionalism while being approachable and helpful.`;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.configs.keys());
  }

  isProviderAvailable(provider: string): boolean {
    return this.configs.has(provider);
  }
}

export const aiServiceManager = new AIServiceManager();

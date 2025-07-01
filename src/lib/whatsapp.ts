// WhatsApp Business API integration
interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
}

export class WhatsAppService {
  private baseUrl: string;
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.baseUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  async sendMessage(message: WhatsAppMessage): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        }
      );

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WhatsApp send error:', error);
      throw error;
    }
  }

  async sendEventUpdate(
    phoneNumber: string,
    eventTitle: string,
    updateMessage: string
  ): Promise<any> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: 'text',
      text: {
        body: `🎓 UDSM Event Update\n\n📅 ${eventTitle}\n\n${updateMessage}\n\nFor more details, visit the UDSM Hub Management System.`,
      },
    };

    return this.sendMessage(message);
  }

  async sendCriticalNotification(
    phoneNumber: string,
    title: string,
    message: string
  ): Promise<any> {
    const whatsappMessage: WhatsAppMessage = {
      to: phoneNumber,
      type: 'text',
      text: {
        body: `🚨 URGENT: ${title}\n\n${message}\n\nUDSM Hub Management System`,
      },
    };

    return this.sendMessage(whatsappMessage);
  }
}

export const whatsappService = new WhatsAppService();
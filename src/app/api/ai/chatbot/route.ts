import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// AI Knowledge Base for UDSM Hub Management System
const knowledgeBase = {
  // Event-related FAQs
  event_registration: {
    keywords: ['event', 'register', 'registration', 'attend', 'participate'],
    response: `To register for events:

1. **Browse Events**: Go to the Events page or your hub dashboard
2. **Find Event**: Use search or filters to find events you're interested in
3. **Check Eligibility**: Events may be PUBLIC, for authenticated users, or hub members only
4. **Click Register**: Click the "Register" button on the event page
5. **Wait for Approval**: Some events require approval from organizers
6. **Get Confirmation**: You'll receive a notification when approved

**Note**: Some events have capacity limits and may fill up quickly!`,
    suggestions: ['How to find upcoming events?', 'What if an event is full?', 'How to cancel registration?'],
  },

  project_joining: {
    keywords: ['project', 'join', 'collaborate', 'team', 'participate'],
    response: `To join projects:

1. **Hub Membership Required**: You must be a member of the hub that owns the project
2. **Browse Projects**: Visit your hub's projects section
3. **Review Details**: Check project objectives, required skills, and timeline
4. **Submit Request**: Click "Join Project" and submit your request
5. **Wait for Approval**: Project leaders will review your application
6. **Start Contributing**: Once approved, you can access project resources and tasks

**For Non-Hub Members**: You need to join the hub first before participating in projects.`,
    suggestions: ['How to join a hub?', 'What skills are needed for projects?', 'How to propose a new project?'],
  },

  programme_enrollment: {
    keywords: ['programme', 'program', 'enroll', 'course', 'learning', 'education'],
    response: `To enroll in programmes:

1. **Browse Programmes**: Visit the Programmes page to see all available options
2. **Check Requirements**: Review prerequisites and programme details
3. **Apply**: Click "Join Programme" - programmes are open to all students
4. **Complete Application**: Fill in any required information
5. **Track Progress**: Monitor your progress through the programme dashboard
6. **Earn Certificate**: Complete all modules to receive your certificate

**Available Programmes**:
• Full-Stack Web Development Bootcamp
• Entrepreneurship Accelerator Program
• And more!`,
    suggestions: ['What programmes are available?', 'How long do programmes take?', 'Are programmes free?'],
  },

  hub_joining: {
    keywords: ['hub', 'join', 'community', 'member', 'membership'],
    response: `To join a hub:

1. **Explore Hubs**: Browse available hubs on the Hubs page
2. **Find Your Interest**: Look for hubs that match your interests and skills
3. **Submit Request**: Click "Join Hub" and submit a membership request
4. **Include Message**: Explain why you want to join and what you can contribute
5. **Wait for Approval**: Hub leaders will review your request
6. **Get Notified**: You'll receive a notification when approved

**Current Hubs**:
• Innovation Technology Hub
• Business Entrepreneurship Hub  
• Creative Arts Hub`,
    suggestions: ['What hubs are available?', 'How to create a new hub?', 'What are hub member benefits?'],
  },

  navigation: {
    keywords: ['navigate', 'find', 'where', 'how to use', 'dashboard', 'menu'],
    response: `Platform Navigation Guide:

**Main Sections**:
• **Dashboard**: Your personalized overview and activities
• **Hubs**: Browse and join communities
• **Events**: Discover and register for events
• **Projects**: Collaborate on innovative projects
• **Programmes**: Enroll in learning opportunities
• **News**: Stay updated with latest announcements

**User-Specific Areas**:
• **Students**: Access dashboard, browse content, join programmes
• **Hub Members**: Additional access to hub-specific content and projects
• **Hub Leaders**: Manage hubs, create events/projects
• **Admins**: Full system management capabilities`,
    suggestions: ['How to update my profile?', 'Where to find my registrations?', 'How to contact support?'],
  },

  technical_support: {
    keywords: ['help', 'support', 'problem', 'issue', 'error', 'bug', 'technical'],
    response: `Technical Support:

**Common Issues**:
• **Login Problems**: Try clearing browser cache or reset password
• **File Upload Issues**: Check file size (max 10MB) and format
• **Page Not Loading**: Refresh page or try different browser
• **Notification Issues**: Check browser notification permissions

**Get Help**:
• **Email Support**: support@udsm.ac.tz
• **System Status**: Check if there are known issues
• **User Guide**: Available in the Help section

**For Urgent Issues**: Contact your hub leader or system administrator.`,
    suggestions: ['How to reset password?', 'File upload not working', 'Contact system admin'],
  },

  policies: {
    keywords: ['policy', 'rules', 'guidelines', 'terms', 'conditions'],
    response: `Platform Policies:

**User Guidelines**:
• Respect all community members
• Use appropriate language in all communications
• Share accurate information only
• Respect intellectual property rights

**Content Policies**:
• No spam or irrelevant content
• No offensive or discriminatory material
• Proper attribution for shared resources
• Follow academic integrity standards

**Privacy & Data**:
• Your data is protected according to university policies
• Profile information visibility can be controlled
• Communication within hubs is moderated

For detailed policies, contact administration at admin@udsm.ac.tz`,
    suggestions: ['How to report inappropriate content?', 'Privacy settings', 'Academic integrity guidelines'],
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { message, context } = await request.json();

    // Analyze the message to determine intent
    const intent = analyzeIntent(message.toLowerCase());
    
    // Get appropriate response
    const response = generateResponse(intent, message, context);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { 
        response: "I'm sorry, I'm experiencing technical difficulties. Please try again or contact support@udsm.ac.tz for assistance.",
        type: 'escalation'
      },
      { status: 500 }
    );
  }
}

function analyzeIntent(message: string): string {
  // Simple keyword-based intent recognition
  // In production, this would use more sophisticated NLP
  
  for (const [intent, data] of Object.entries(knowledgeBase)) {
    if (data.keywords.some(keyword => message.includes(keyword))) {
      return intent;
    }
  }

  // Check for greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(message)) {
    return 'greeting';
  }

  // Check for thanks
  if (/thank|thanks|appreciate/.test(message)) {
    return 'thanks';
  }

  // Default to general help
  return 'general';
}

function generateResponse(intent: string, message: string, context: any) {
  const userRole = context?.userRole || 'STUDENT';
  const userName = context?.userId ? 'there' : 'there';

  switch (intent) {
    case 'greeting':
      return {
        response: `Hello! 👋 I'm here to help you navigate the UDSM Hub Management System. What would you like to know about?`,
        type: 'text',
        suggestions: ['How to join a hub?', 'How to register for events?', 'How to enroll in programmes?'],
      };

    case 'thanks':
      return {
        response: `You're welcome! 😊 Is there anything else I can help you with regarding the UDSM Hub Management System?`,
        type: 'text',
        suggestions: ['Browse available hubs', 'Find upcoming events', 'Explore programmes'],
      };

    case 'general':
      return {
        response: `I can help you with various aspects of the UDSM Hub Management System:

🏢 **Hubs**: Join communities and collaborate
📅 **Events**: Register for workshops and seminars  
🚀 **Projects**: Participate in innovative projects
🎓 **Programmes**: Enroll in learning opportunities
📰 **News**: Stay updated with announcements

What specific area would you like help with?`,
        type: 'text',
        suggestions: ['Join a hub', 'Register for events', 'Find projects', 'Enroll in programmes'],
      };

    default:
      const knowledgeItem = knowledgeBase[intent as keyof typeof knowledgeBase];
      if (knowledgeItem) {
        return {
          response: knowledgeItem.response,
          type: 'text',
          suggestions: knowledgeItem.suggestions,
        };
      }

      // Fallback for unrecognized queries
      return {
        response: `I understand you're asking about "${message}", but I don't have specific information on that topic. 

Here's what I can help you with:
• Hub membership and activities
• Event registration and participation
• Project collaboration
• Programme enrollment
• Platform navigation
• Technical support

For specific questions not covered here, please contact:
📧 **General Support**: support@udsm.ac.tz
👨‍💼 **Academic Queries**: academic@udsm.ac.tz
🔧 **Technical Issues**: tech@udsm.ac.tz

Would you like help with any of these topics?`,
        type: 'escalation',
        suggestions: ['Contact support', 'Browse help topics', 'Return to main menu'],
      };
  }
}
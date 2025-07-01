# 🚀 UDSM Hub Management System - Complete Setup, Testing & Deployment Guide

## 📋 **Prerequisites**

Before starting, ensure you have:
- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **PostgreSQL database** (local or cloud)
- **Git** for version control
- **Vercel account** for deployment ([Sign up here](https://vercel.com))
- **Code editor** (VS Code recommended)

## 🛠️ **Local Development Setup**

### **Step 1: Clone and Install**

```bash
# Clone the repository
git clone <your-repo-url>
cd udsm-hub-management-system

# Install dependencies
npm install
```

### **Step 2: Environment Configuration**

Create a `.env.local` file in your project root with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/udsm_hms"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-make-it-long-and-random"

# Google OAuth (Optional but Recommended)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary (File Uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Firebase (Real-time Features)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-service-account-email"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----"

# AI Services (Optional but Recommended for full features)
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_AI_API_KEY="your-google-ai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"

# WhatsApp Business API (Optional)
WHATSAPP_API_URL="https://graph.facebook.com/v17.0"
WHATSAPP_ACCESS_TOKEN="your-whatsapp-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
```

### **Step 3: Database Setup**

1. **Create PostgreSQL Database:**
```bash
# If using local PostgreSQL
createdb udsm_hms

# Or use a cloud provider like Supabase, Railway, or Neon
```

2. **Generate Prisma Client and Push Schema:**
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

3. **Verify Database Connection:**
```bash
# Open Prisma Studio to verify
npm run db:studio
```

### **Step 4: Start Development Server**

```bash
# Start the development server
npm run dev
```

Your application will be available at `http://localhost:3000`

## 🧪 **Comprehensive Testing Guide**

### **Step 1: Initialize Test Environment**

1. **Access Test Setup Page:**
   - Navigate to: `http://localhost:3000/testing/setup`
   - You'll need to create an admin account first or use the seeded data

2. **Seed Test Data:**
   - Click "Seed Test Data" button
   - This creates comprehensive test data including users, hubs, projects, events, and programmes
   - Copy the provided test credentials

### **Step 2: Test User Accounts**

After seeding, you'll have these test accounts (all use password: `TestPassword123!`):

#### **Admin Account**
- **Email:** `admin@udsm.ac.tz`
- **Password:** `TestPassword123!`
- **Capabilities:** Full system access, all CRUD operations, system analytics

#### **Hub Supervisor**
- **Email:** `supervisor1@udsm.ac.tz`
- **Password:** `TestPassword123!`
- **Hub:** Innovation Technology Hub
- **Capabilities:** Strategic oversight, analytics, partnership management

#### **Hub Leaders**
- **Email:** `leader1@udsm.ac.tz` (Tech Hub)
- **Email:** `leader2@udsm.ac.tz` (Business Hub)
- **Password:** `TestPassword123!`
- **Capabilities:** Hub management, event/project creation, member management

#### **Hub Members**
- **Email:** `member1@udsm.ac.tz` (Tech & Business Hubs)
- **Email:** `member2@udsm.ac.tz` (Tech Hub)
- **Password:** `TestPassword123!`
- **Capabilities:** Project participation, event registration, hub activities

#### **Regular Students**
- **Email:** `student1@udsm.ac.tz`
- **Email:** `student2@udsm.ac.tz`
- **Password:** `TestPassword123!`
- **Capabilities:** Programme enrollment, public content access, limited hub interaction

### **Step 3: Automated Testing Dashboard**

1. **Access Testing Dashboard:**
   - Navigate to: `http://localhost:3000/testing`
   - Sign in with admin credentials
   - Run automated test suites:
     - CRUD Operations Testing
     - RBAC Verification
     - Real-time Features Testing
     - File Management Testing
     - UI/UX Responsiveness
     - Security Testing
     - Performance Testing

### **Step 4: Manual Testing Scenarios**

#### **RBAC (Role-Based Access Control) Testing:**

1. **Admin Access Test:**
   - Sign in as `admin@udsm.ac.tz`
   - Verify access to `/admin/dashboard`, `/admin/users`, `/admin/hubs`
   - Test user management and system-wide controls

2. **Hub Leader Test:**
   - Sign in as `leader1@udsm.ac.tz`
   - Create events, projects, manage hub members
   - Verify cannot access other hubs' data

3. **Cross-Hub Access Control:**
   - Test that Hub Leader A cannot modify Hub B's content
   - Verify hub member isolation

#### **Feature Testing:**

1. **Event Lifecycle:**
   - Create event as hub leader
   - Register as hub member
   - Test approval workflow
   - Mark attendance and award badges

2. **Project Collaboration:**
   - Propose project as hub member
   - Approve as hub leader
   - Add team members and tasks
   - Upload project files

3. **Programme Enrollment:**
   - Browse programmes as student
   - Enroll in programme
   - Track progress

### **Step 5: AI Features Testing**

1. **AI Chatbot:**
   - Test the floating chat button (bottom right)
   - Ask questions about platform features
   - Verify contextual responses

2. **Intelligent Analytics:**
   - Access admin dashboard
   - View AI-generated insights
   - Test recommendation engine

## 🔧 **Service Setup Instructions**

### **Google OAuth Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)

### **Cloudinary Setup**

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from dashboard
3. Create upload presets for different file types

### **Firebase Setup**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Cloud Messaging (FCM)
5. Generate service account key for admin SDK
6. Get web app configuration

### **AI Services Setup (Optional)**

#### **OpenAI:**
1. Sign up at [OpenAI](https://platform.openai.com/)
2. Generate API key
3. Add billing information for usage

#### **Google AI (Gemini):**
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Generate API key
3. Enable Generative AI API

## 🚀 **Deployment to Vercel**

### **Step 1: Prepare for Deployment**

1. **Update Environment Variables:**
   - Update `NEXTAUTH_URL` to your production domain
   - Ensure all API keys are production-ready
   - Set up production database

2. **Build Test:**
```bash
# Test the build locally
npm run build
npm start
```

### **Step 2: Deploy to Vercel**

#### **Option A: Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### **Option B: GitHub Integration**

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

### **Step 3: Configure Production Environment**

1. **Environment Variables in Vercel:**
   - Go to your project settings in Vercel
   - Add all environment variables from `.env.local`
   - Update `NEXTAUTH_URL` to your production domain

2. **Database Configuration:**
   - Ensure your production database is accessible
   - Update `DATABASE_URL` with production credentials
   - Run migrations: `npm run db:push`

3. **Domain Configuration:**
   - Add your custom domain in Vercel settings
   - Update DNS records as instructed

## 📊 **Post-Deployment Testing**

### **Step 1: Production Smoke Tests**

1. **Basic Functionality:**
   - User registration and login
   - Hub browsing and joining
   - Event registration
   - File uploads

2. **Performance Testing:**
   - Page load times < 2 seconds
   - File upload performance
   - Database query optimization

3. **Security Testing:**
   - HTTPS enforcement
   - Authentication flows
   - Authorization checks
   - Input validation

### **Step 2: Load Testing**

1. **Concurrent Users:**
   - Test with 50+ simultaneous users
   - Monitor response times
   - Check database performance

2. **File Upload Stress Test:**
   - Multiple large file uploads
   - Cloudinary integration stability
   - Error handling

## 🔍 **Monitoring & Maintenance**

### **Essential Monitoring:**

1. **Application Monitoring:**
   - Vercel Analytics for performance
   - Error tracking with Sentry (optional)
   - Database monitoring

2. **User Analytics:**
   - User engagement metrics
   - Feature usage statistics
   - Performance bottlenecks

### **Regular Maintenance:**

1. **Weekly Tasks:**
   - Review error logs
   - Monitor performance metrics
   - Check database health

2. **Monthly Tasks:**
   - Update dependencies
   - Review security settings
   - Backup database

## 🆘 **Troubleshooting Common Issues**

### **Database Connection Issues:**
```bash
# Check connection
npm run db:generate
npm run db:push

# If issues persist, check DATABASE_URL format
```

### **Environment Variable Issues:**
- Verify all required variables are set
- Check for typos in variable names
- Ensure proper escaping of special characters
- Restart development server after changes

### **Build Failures:**
```bash
# Clear build cache
rm -rf .next
rm -rf node_modules
npm install

# Check TypeScript errors
npm run type-check
```

### **Authentication Issues:**
- Clear browser cookies/localStorage
- Check NEXTAUTH_SECRET is set
- Verify Google OAuth credentials
- Check redirect URLs

### **File Upload Issues:**
- Check Cloudinary credentials
- Verify file size limits
- Check network connectivity
- Test with different file types

## 🎯 **Success Criteria**

Your deployment is successful when:

- ✅ All pages load within 2 seconds
- ✅ User registration and authentication work flawlessly
- ✅ File uploads complete successfully
- ✅ Real-time features respond within 500ms
- ✅ AI chatbot provides helpful responses
- ✅ All RBAC scenarios function correctly
- ✅ Mobile responsiveness is perfect
- ✅ Error handling is graceful
- ✅ Security measures are effective

## 📞 **Getting Help**

### **Documentation:**
- **Testing Guide:** `TESTING_INSTRUCTIONS.md`
- **API Documentation:** Auto-generated from code
- **Component Documentation:** In-code comments

### **Support Resources:**
- **GitHub Issues:** For bug reports and feature requests
- **Development Logs:** Check browser console and server logs
- **Database Issues:** Use Prisma Studio for debugging

### **Quick Commands Reference:**

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:studio       # Open Prisma Studio
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database with test data

# Testing
npm run lint            # Run ESLint
npm run type-check      # Check TypeScript types

# Deployment
vercel                  # Deploy to Vercel
vercel --prod          # Deploy to production
```

## 🌟 **Advanced Features**

### **AI-Powered Features:**
- **Intelligent Chatbot:** Provides instant support and guidance
- **Analytics Insights:** AI-generated recommendations from data
- **Smart Recommendations:** Personalized content suggestions
- **Predictive Analytics:** Forecast trends and user behavior

### **Real-time Features:**
- **Live Notifications:** Instant updates via Firebase FCM
- **Real-time Comments:** Live discussion updates
- **Activity Feeds:** Real-time user activity tracking
- **Collaborative Features:** Live project collaboration

### **Advanced Security:**
- **Role-Based Access Control:** Granular permission system
- **Data Encryption:** Secure data storage and transmission
- **Input Validation:** Comprehensive data validation
- **Audit Logging:** Track all user actions

This comprehensive guide ensures your UDSM Hub Management System is properly set up, thoroughly tested, and successfully deployed with all AI-powered features functioning optimally!

---

**Need Help?** If you encounter any issues during setup or deployment, check the troubleshooting section above or create an issue in the project repository.
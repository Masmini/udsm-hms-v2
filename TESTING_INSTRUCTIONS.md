# 🧪 UDSM Hub Management System - Complete Testing Instructions

## 🚀 **Getting Started**

### **Step 1: Initialize Test Environment**
1. Navigate to: `/testing/setup`
2. Click "Seed Test Data" to create comprehensive test data
3. Copy the provided test credentials (all use password: `TestPassword123!`)

### **Step 2: Access Testing Dashboard**
1. Navigate to: `/testing`
2. Use the admin credentials to access the testing dashboard
3. Run automated test suites or individual tests

## 👥 **Test User Accounts**

### **Admin Account**
- **Email:** `admin@udsm.ac.tz`
- **Password:** `TestPassword123!`
- **Capabilities:** Full system access, all CRUD operations, system analytics

### **Hub Supervisor**
- **Email:** `supervisor1@udsm.ac.tz`
- **Password:** `TestPassword123!`
- **Hub:** Innovation Technology Hub
- **Capabilities:** Strategic oversight, analytics, partnership management

### **Hub Leaders**
- **Email:** `leader1@udsm.ac.tz` (Tech Hub)
- **Email:** `leader2@udsm.ac.tz` (Business Hub)
- **Password:** `TestPassword123!`
- **Capabilities:** Hub management, event/project creation, member management

### **Hub Members**
- **Email:** `member1@udsm.ac.tz` (Tech & Business Hubs)
- **Email:** `member2@udsm.ac.tz` (Tech Hub)
- **Password:** `TestPassword123!`
- **Capabilities:** Project participation, event registration, hub activities

### **Regular Students**
- **Email:** `student1@udsm.ac.tz`
- **Email:** `student2@udsm.ac.tz`
- **Password:** `TestPassword123!`
- **Capabilities:** Programme enrollment, public content access, limited hub interaction

## 🔍 **Comprehensive Testing Scenarios**

### **1. RBAC Verification Tests**

#### **Admin Permissions Test**
1. Sign in as `admin@udsm.ac.tz`
2. Navigate to `/admin/dashboard`
3. Verify access to:
   - User management (`/admin/users`)
   - Hub management (`/admin/hubs`)
   - System analytics
   - All content regardless of visibility

#### **Hub Supervisor Test**
1. Sign in as `supervisor1@udsm.ac.tz`
2. Navigate to hub dashboard
3. Verify access to:
   - Strategic analytics
   - Partnership management
   - Executive reporting
4. Verify CANNOT:
   - Directly edit events/projects
   - Access other hubs' data

#### **Hub Leader Test**
1. Sign in as `leader1@udsm.ac.tz`
2. Navigate to Tech Hub
3. Verify CAN:
   - Create/edit events and projects
   - Manage hub members
   - Approve join requests
4. Verify CANNOT:
   - Access Business Hub data
   - Manage other hubs

#### **Cross-Hub Access Control Test**
1. Sign in as `leader1@udsm.ac.tz` (Tech Hub Leader)
2. Try to access Business Hub content
3. Verify access is denied
4. Sign in as `member1@udsm.ac.tz` (member of both hubs)
5. Verify can access both hubs' content

#### **Student Limitations Test**
1. Sign in as `student1@udsm.ac.tz`
2. Verify CAN:
   - Browse public events/projects
   - Register for programmes
   - View public news
3. Verify CANNOT:
   - Propose or join projects (not a hub member)
   - Access hub-member-only content
   - Create events or programmes

### **2. CRUD Operations Testing**

#### **Event Lifecycle Test**
1. Sign in as `leader1@udsm.ac.tz`
2. Create new event:
   - Navigate to hub dashboard
   - Click "Create Event"
   - Fill all details, upload cover image
   - Set visibility to "HUB_MEMBERS"
   - Publish event
3. Test event registration:
   - Sign in as `member1@udsm.ac.tz`
   - Register for the event
   - Verify registration appears in dashboard
4. Test event management:
   - Sign back in as hub leader
   - Approve registration
   - Mark attendance
   - Award badges

#### **Project Collaboration Test**
1. Sign in as `member1@udsm.ac.tz`
2. Propose new project:
   - Navigate to Tech Hub
   - Click "Propose Project"
   - Fill project details
   - Submit for approval
3. Sign in as `leader1@udsm.ac.tz`
4. Approve project proposal
5. Add project members
6. Create project tasks
7. Test project file uploads
8. Test progress reporting

#### **Programme Enrollment Test**
1. Sign in as `student1@udsm.ac.tz`
2. Browse available programmes
3. Register for "Full-Stack Web Development Bootcamp"
4. Verify enrollment in dashboard
5. Sign in as programme supervisor
6. Manage programme members
7. Track progress

### **3. File Management Testing**

#### **Image Upload Test**
1. Test event cover image upload
2. Test hub logo upload
3. Test user profile picture upload
4. Verify images display correctly
5. Test file access permissions

#### **Document Upload Test**
1. Sign in as project member
2. Upload project files (PDF, documents)
3. Verify files are accessible to project members
4. Verify files are NOT accessible to non-members
5. Test file download functionality

### **4. Real-time Features Testing**

#### **Notification Test**
1. Sign in as hub leader
2. Create new event
3. Sign in as hub member (different browser/tab)
4. Register for event
5. Verify hub leader receives real-time notification

#### **Discussion Test**
1. Open news article in multiple browser tabs
2. Sign in as different users
3. Add comments from different accounts
4. Verify real-time comment updates
5. Test like/unlike functionality

### **5. UI/UX Responsiveness Testing**

#### **Multi-Device Test**
1. Test on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)
4. Verify:
   - Navigation works on all devices
   - Forms are usable
   - Content is readable
   - Touch interactions work on mobile

#### **Cross-Browser Test**
1. Test on Chrome
2. Test on Firefox
3. Test on Safari (if available)
4. Test on Edge
5. Verify consistent behavior

### **6. Performance Testing**

#### **Load Time Test**
1. Measure dashboard load times
2. Test event/project detail page loads
3. Test search functionality speed
4. Test file upload performance

#### **Concurrent User Test**
1. Open multiple browser sessions
2. Sign in as different users
3. Perform simultaneous actions
4. Verify system stability

### **7. Security Testing**

#### **Authentication Test**
1. Test password requirements
2. Test session timeout
3. Test Google OAuth integration
4. Test unauthorized access attempts

#### **Authorization Test**
1. Try accessing admin pages as student
2. Try editing other users' content
3. Try accessing private hub content
4. Verify proper error messages

## 📊 **Expected Test Results**

### **RBAC Verification**
- ✅ Admin can access all content
- ✅ Hub Supervisor can view analytics but not edit content
- ✅ Hub Leader can manage their hub only
- ✅ Hub Member can participate in hub activities
- ✅ Student has limited access
- ❌ Cross-hub access is properly restricted

### **CRUD Operations**
- ✅ All entities can be created, read, updated, deleted
- ✅ Soft delete works for hub leaders
- ✅ Hard delete works for admins
- ✅ Data integrity maintained

### **Real-time Features**
- ✅ Notifications delivered instantly
- ✅ Comments update in real-time
- ✅ Likes/unlikes sync across sessions

### **File Management**
- ✅ Files upload successfully to Cloudinary
- ✅ Access permissions enforced
- ✅ File validation works

### **Performance**
- ✅ Pages load within 2 seconds
- ✅ Search results appear within 1 second
- ✅ Real-time updates within 500ms

## 🐛 **Common Issues & Troubleshooting**

### **Database Connection Issues**
- Ensure PostgreSQL is running
- Check DATABASE_URL environment variable
- Run `npm run db:generate` if needed

### **Authentication Issues**
- Clear browser cookies/localStorage
- Check NEXTAUTH_SECRET is set
- Verify user exists in database

### **File Upload Issues**
- Check Cloudinary credentials
- Verify file size limits
- Check network connectivity

### **Real-time Issues**
- Verify Firebase configuration
- Check FCM tokens
- Test network connectivity

## 🔄 **Continuous Testing**

### **Automated Testing**
1. Use the `/testing` dashboard for automated tests
2. Run tests after any code changes
3. Monitor test results and fix failures

### **Manual Testing**
1. Test new features with different user roles
2. Verify edge cases and error handling
3. Test on different devices and browsers

### **Performance Monitoring**
1. Monitor page load times
2. Check database query performance
3. Monitor real-time feature responsiveness

## 📈 **Future Enhancements Testing**

When implementing new features, ensure to test:
1. **AI Features:** Recommendation accuracy, response times
2. **Advanced Search:** Filter combinations, search relevance
3. **Calendar Integration:** Sync accuracy, conflict handling
4. **Messaging System:** Real-time delivery, message persistence
5. **Resource Booking:** Availability accuracy, conflict prevention

## 🎯 **Success Criteria**

The system passes comprehensive testing when:
- ✅ All RBAC scenarios work correctly
- ✅ All CRUD operations function properly
- ✅ Real-time features respond within 500ms
- ✅ File uploads complete successfully
- ✅ UI is responsive on all devices
- ✅ Security measures prevent unauthorized access
- ✅ Performance meets benchmarks
- ✅ Error handling is graceful
- ✅ Data integrity is maintained

This comprehensive testing ensures the UDSM Hub Management System is production-ready and meets all requirements for a robust, secure, and user-friendly platform.
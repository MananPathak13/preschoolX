Below is a context file that you can feed to Cursor AI (Claude Sonnet) to help it understand the project requirements, tech stack, and design guidelines. This file will act as a reference for the AI to generate code and build the preschool management app step-by-step.

# Context File for Preschool Management App

## 1. Project Overview

### App Name: PreschoolPro

### Purpose:
A preschool management app to help preschools manage students, staff, parents, and daily operations.

### Target Users:
- Preschool administrators
- Teachers
- Staff
- Parents

### MVP Features:
1. User Management
   - Role-based access (admin, teacher, staff, parent)
   - User registration and authentication
   - Profile management

2. Student Management
   - Add/remove students
   - Track attendance
   - View profiles
   - Parent/guardian information

3. Program Management
   - Create and manage programs
   - Set age groups and capacity
   - Assign teachers
   - Filter by status (active/inactive)
   - Filter by age range
   - Search functionality

4. Class Management
   - Create and manage classes
   - Set age groups and capacity
   - Assign teachers
   - Filter by status (active/inactive)
   - Filter by age group
   - Search functionality

5. Staff Management
   - Staff profiles and schedules
   - Role assignments
   - Qualifications tracking

6. Attendance Tracking
   - Daily attendance records
   - Sign-in/sign-out times
   - Absence tracking

## 2. Tech Stack

### Frontend:
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- UI Library: Shadcn/UI
- Animation: Framer Motion

### Backend:
- Database: Firebase Firestore
- Authentication: Firebase Auth
- Storage: Firebase Storage
  - Document storage for student records
  - Organization-specific storage configuration
  - Secure file access control
  - Automatic file cleanup

### Additional Tools:
- React Hook Form (forms)
- Zod (validation)
- Date-fns (date handling)

## 3. Design Guidelines

### Color Palette:
- Primary: #443627 (dark brown)
- Secondary: #D98324 (orange)
- Background: #EFDCAB (light beige)
- Accent: #F2F6D0 (light yellow)

### Font:
- Inter (clean, modern)

### Components:
Use Shadcn/UI's pre-built components for consistency

## 4. Database Structure

### Organizations Collection:
- Basic organization info
- Settings and preferences
- Onboarding status
- Storage configuration
  - Storage provider type
  - Bucket configuration
  - Access credentials
  - File retention policies

### Users Collection:
- Single collection for all user types
- Role-based permissions
- Profile information
- Status tracking

### Students Collection:
- Student information
- Multiple guardians (minimum 2 required)
- Program enrollment
- Medical info
- Waitlist status

### Programs Collection:
- Program details
- Capacity and schedules
- Teacher assignments

### Attendance Collection:
- Daily attendance records
- Sign-in/out times
- Absence tracking

### Guardians Collection:
- Guardian information
- Relationship to students
- Contact details
- Professional information
- Organization reference

## 5. Onboarding Flow

### Step 1: Organization Details
- Organization name
- Contact information
- Basic settings
- Storage configuration setup
  - Configure document storage
  - Set up access credentials
  - Define retention policies

### Step 2: Guardian Setup
- Minimum 2 guardians required
- Basic contact information
- Professional information (optional)
- Relationship to student
- Stored separately for reuse

### Step 3: Staff Setup
- Add staff members
- Set roles and permissions
- Generate temporary passwords
- Option for sample data

### Step 4: Programs Setup
- Create programs
- Set age groups
- Define capacity
- Option for sample data

### Step 5: Student Setup
- Add students
- Exactly two guardians required (no more, no less)
- Multiple emergency contacts supported
- Set program enrollment
- Document upload requirements
- Progressive form saving
- Step-by-step validation

### Step 6: Student Registration Flow
1. Student Information
   - Basic details
   - Required: name, date of birth, gender
   - Optional: nationality, languages, previous school

2. Guardian Information
   - Exactly two guardians required
   - Each guardian requires:
     - Full name
     - Relationship
     - Contact details
     - Address
     - Optional professional information

3. Emergency Contacts
   - Minimum one required
   - Additional contacts can be added
   - Each contact requires:
     - Full name
     - Relationship
     - Phone number

4. Program Selection
   - Choose from active programs only
   - Program details displayed
   - Capacity information shown

5. Medical Information
   - Allergies and conditions
   - Doctor information
   - Special care instructions
   - Required medical documents

6. Terms & Conditions
   - Tuition agreement
   - Attendance policy
   - Behavior policy
   - Photo release consent

7. Additional Information
   - Optional details
   - Siblings information
   - Referral source

8. Emergency Authorization
   - Medical care consent
   - Liability waiver

9. Document Upload
   - Required documents list
   - Upload interface
   - Document type categorization
   - Storage configuration check
   - File type validation
   - Size limits enforcement
   - Progress tracking
   - Upload status feedback

### Registration Features:
- Progressive form saving
- Step-by-step validation
- Automatic draft saving
- Document upload management
  - File type restrictions
  - Size limits
  - Automatic file organization
  - Secure access control
- Status tracking
- Review and edit capability

### Step 6: Terms & Conditions
- Review terms
- Accept conditions
- Complete setup
- Welcome animation

## 6. Sample Data

### Staff:
- Lead Teacher
  - Sarah Johnson
  - Early education specialist
- Assistant Teacher
  - Michael Chen
  - Supporting educator

### Programs:
- Toddler Program
  - Ages 18-36 months
  - Capacity: 12
  - Status: active
- Preschool Program
  - Ages 3-5 years
  - Capacity: 15
  - Status: active
- Summer Camp
  - Ages 3-6 years
  - Capacity: 20
  - Status: inactive

### Classes:
- Toddler Room A
  - Ages 18-24 months
  - Capacity: 8
  - Status: active
- Toddler Room B
  - Ages 24-36 months
  - Capacity: 8
  - Status: active
- Preschool Room A
  - Ages 3-4 years
  - Capacity: 12
  - Status: active
- Preschool Room B
  - Ages 4-5 years
  - Capacity: 12
  - Status: inactive

### Students:
- Emma Smith
  - Age: 2
  - Guardian: John Smith
- Lucas Garcia
  - Age: 3.5
  - Guardian: Maria Garcia
  - Allergies: Peanuts

## 7. Implementation Notes

### Forms:
- Use React Hook Form for form handling
- Implement Zod validation schemas
- Show loading states during submission
- Provide clear error messages

### Navigation:
- Step-by-step onboarding flow
- Progress indicators
- Clear next/back actions
- Skip options with sample data

### Security:
- Role-based access control
- Secure password generation
- Data validation
- Firebase security rules

### Performance:
- Optimize database queries
- Implement pagination
- Use client-side caching
- Lazy load components

## 8. Future Enhancements

### Planned Features:
1. Billing & Payments
2. Curriculum Planning
3. Progress Reports
4. Parent Communication
5. Event Calendar
6. Resource Management

### Technical Improvements:
1. Advanced Analytics
2. Offline Support
3. Mobile App
4. API Integration
5. Automated Backups
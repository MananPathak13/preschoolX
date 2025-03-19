# PreschoolPro Firebase Database Design

This document outlines the Firebase database structure for the PreschoolPro application, explaining collections, document schemas, relationships, and implementation details.

## Overview

PreschoolPro requires a database that supports:
- Multiple preschools/organizations
- Different user roles (admin, teacher, staff, parent)
- Granular permission management
- Student and staff management (with active/inactive status)
- Curriculum planning
- Attendance tracking

## Database Collections

### Organizations
Stores information about each preschool organization.

```
organizations/{organizationId}
```

**Fields:**
- `name`: String - Name of the preschool
- `address`: Object
  - `street`: String
  - `city`: String
  - `state`: String
  - `zip`: String
  - `country`: String
- `phone`: String
- `email`: String
- `website`: String
- `logo`: String (URL to storage)
- `settings`: Object
  - `operatingHours`: Object
    - `monday`: Object { `open`: String, `close`: String }
    - `tuesday`: Object { `open`: String, `close`: String }
    - ... (other days)
  - `ageGroups`: Array - List of age groups this preschool serves
  - `academicYearStart`: Timestamp
  - `academicYearEnd`: Timestamp
- `createdAt`: Timestamp
- `updatedAt`: Timestamp
- `active`: Boolean

### Users
Stores user accounts and their base information.

```
users/{userId}
```

**Fields:**
- `email`: String
- `displayName`: String
- `photoURL`: String (URL to storage)
- `phoneNumber`: String
- `organizations`: Array - List of organization IDs the user belongs to
- `defaultOrganization`: String - Default organization ID
- `createdAt`: Timestamp
- `lastLoginAt`: Timestamp
- `metadata`: Object - Additional user metadata

### Organization Members
Stores the relationship between users and organizations, including role information.

```
organizations/{organizationId}/members/{userId}
```

**Fields:**
- `userId`: String - Reference to the user document
- `role`: String - "admin", "teacher", "staff", or "parent"
- `department`: String - Department or section within the organization
- `title`: String - Job title (for staff/teachers)
- `joinDate`: Timestamp
- `status`: String - "active", "inactive", "suspended", "pending"
- `permissions`: Object - Custom permissions overrides
  - `students`: Object { `view`: Boolean, `create`: Boolean, `edit`: Boolean, `delete`: Boolean }
  - `staff`: Object { ... similar structure }
  - ... (other modules)
- `lastAccess`: Timestamp

### Students
Stores information about students.

```
organizations/{organizationId}/students/{studentId}
```

**Fields:**
- `firstName`: String
- `lastName`: String
- `fullName`: String (computed)
- `dateOfBirth`: Timestamp
- `gender`: String
- `nationality`: String (optional)
- `languagesSpoken`: Array of Strings (optional)
- `previousSchool`: String (optional)
- `address`: Object - Same structure as organization address
- `photo`: String (URL to storage)
- `enrollmentDate`: Timestamp
- `exitDate`: Timestamp - When the student left (null if still active)
- `status`: String - "active", "waitlist", "inactive", "graduated", "withdrawn"
- `ageGroup`: String - Age group or class
- `guardians`: Array of Objects (exactly 2 required)
  - `guardianId`: String - Reference to guardian document
  - `isPrimary`: Boolean
  - `relationship`: String
  - `firstName`: String
  - `lastName`: String
  - `email`: String
  - `phone`: String
  - `address`: String
  - `occupation`: String (optional)
  - `businessName`: String (optional)
  - `businessAddress`: String (optional)
- `emergencyContacts`: Array of Objects (minimum 1 required)
  - `firstName`: String
  - `lastName`: String
  - `relationship`: String
  - `phone`: String
- `program`: Object
  - `primaryProgram`: String - Reference to program document
  - `startDate`: Timestamp - Set by organization after approval
  - `approvedProgram`: String - Set by organization after approval
- `medicalInfo`: Object
  - `allergies`: Array of Strings
  - `allergySymptoms`: String
  - `specialCareInstructions`: String
  - `conditions`: String
  - `medications`: String
  - `doctorName`: String
  - `doctorPhone`: String
  - `immunizationRecords`: Array of Strings
- `terms`: Object
  - `tuitionPayment`: Boolean
  - `attendancePolicy`: Boolean
  - `behaviorPolicy`: Boolean
  - `photoRelease`: Boolean
- `additionalInfo`: Object
  - `siblings`: Array of Strings
  - `whyMontessori`: String
  - `referralSource`: String
- `emergencyAuthorization`: Object
  - `medicalCare`: Boolean
  - `liabilityWaiver`: Boolean
- `documents`: Array of Objects
  - `type`: String - "medical", "enrollment", "academic", "other"
  - `name`: String
  - `url`: String (URL to storage)
  - `uploadedAt`: Timestamp
  - `uploadedBy`: String (User ID)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp
- `registrationType`: String - "direct", "parent_registration"
- `registrationStatus`: String - "pending", "approved", "rejected"
- `registrationDate`: Timestamp
- `reviewedBy`: String - User ID of staff who reviewed the registration
- `reviewDate`: Timestamp
- `reviewNotes`: String
- `registrationStep`: Number - Current step in registration process (1-9)
- `registrationCompleted`: Boolean - Whether all steps are completed

### Student Parents
Maps students to their parents/guardians.

```
organizations/{organizationId}/students/{studentId}/guardians/{userId}
```

**Fields:**
- `userId`: String - Reference to parent user
- `relationship`: String - "mother", "father", "guardian", etc.
- `isPrimary`: Boolean - Primary contact for this student
- `pickupAuthorized`: Boolean
- `emergencyContact`: Boolean
- `contactPriority`: Number - Order to contact in emergency

### Staff
Stores detailed information about staff members, extending their basic member profile.

```
organizations/{organizationId}/staff/{userId}
```

**Fields:**
- `userId`: String - Reference to the user document
- `firstName`: String
- `lastName`: String
- `hireDate`: Timestamp
- `position`: String
- `qualifications`: Array of Objects
  - `degree`: String
  - `institution`: String
  - `year`: Number
- `certifications`: Array of Objects
  - `name`: String
  - `issuedBy`: String
  - `issuedDate`: Timestamp
  - `expiryDate`: Timestamp
- `specialties`: Array of Strings
- `bio`: String
- `status`: String - "active", "inactive", "onLeave", "terminated"
- `contractType`: String - "fullTime", "partTime", "temporary", "contract"
- `schedule`: Object
  - `monday`: Object { `start`: String, `end`: String }
  - ... (other days)
- `documents`: Array of Objects - Staff documents like contracts, IDs
  - `name`: String
  - `type`: String
  - `url`: String (URL to storage)
  - `uploadedAt`: Timestamp
- `emergencyContact`: Object
  - `name`: String
  - `relationship`: String
  - `phone`: String
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Programs and Classes
Stores information about programs and classes/sections.

```
organizations/{organizationId}/programs/{programId}
organizations/{organizationId}/classes/{classId}
```

**Program Fields:**
- `name`: String - Program name
- `description`: String
- `start_date`: Timestamp
- `end_date`: Timestamp
- `capacity`: Number - Maximum number of students
- `age_range`: String - Target age range
- `schedule`: String - Program schedule
- `status`: String - "active", "inactive", "completed"
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Class Fields:**
- `name`: String - Class name
- `description`: String
- `capacity`: Number - Maximum number of students
- `age_group`: String - Target age group
- `room_number`: String - Physical room or location
- `status`: String - "active", "inactive", "completed"
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Common Features:**
- Status filtering (active/inactive)
- Age group/range filtering
- Search by name
- Sort by name, date, or status
- Pagination support

### Class Enrollments
Maps students to classes.

```
organizations/{organizationId}/classes/{classId}/enrollments/{studentId}
```

**Fields:**
- `studentId`: String - Reference to student
- `enrollmentDate`: Timestamp
- `status`: String - "active", "withdrawn", "graduated"
- `notes`: String

### Curriculum
Stores curriculum plans and lesson information.

```
organizations/{organizationId}/curriculum/{curriculumId}
```

**Fields:**
- `title`: String
- `description`: String
- `ageGroup`: String - Target age group
- `subject`: String - Subject area
- `duration`: Number - Duration in minutes
- `objectives`: Array of Strings
- `materials`: Array of Strings
- `activities`: Array of Objects
  - `name`: String
  - `description`: String
  - `duration`: Number
  - `instructions`: String
- `assessments`: Array of Objects
  - `name`: String
  - `criteria`: String
- `documents`: Array of Objects - Attached resources
  - `name`: String
  - `type`: String
  - `url`: String (URL to storage)
- `createdBy`: String - User ID
- `targetDate`: Timestamp - When this should be taught
- `status`: String - "draft", "approved", "completed"
- `tags`: Array of Strings
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Attendance
Records daily attendance for students.

```
organizations/{organizationId}/attendance/{date}/classes/{classId}
```

**Fields:**
- `date`: Timestamp
- `classId`: String - Reference to class
- `students`: Object - Map of student IDs to attendance status
  - `[studentId]`: Object
    - `status`: String - "present", "absent", "tardy", "excused"
    - `signInTime`: String - Time when student arrived (e.g., "08:30")
    - `signOutTime`: String - Time when student left (e.g., "15:45")
    - `notes`: String - Additional information or absence reason
    - `recordedBy`: String - User ID who recorded attendance
    - `timestamp`: Timestamp - When the record was created/updated
- `recordedBy`: String - User ID who recorded attendance
- `updatedBy`: String - User ID who last updated record
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Guardians
Stores information about student guardians.

```
organizations/{organizationId}/guardians/{guardianId}
```

**Fields:**
- `firstName`: String
- `lastName`: String
- `relationship`: String
- `address`: String
- `phone`: String
- `email`: String
- `occupation`: String (optional)
- `businessName`: String (optional)
- `businessAddress`: String (optional)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp
- `organizationId`: String - Reference to organization
- `students`: Array of Strings - Student IDs this guardian is associated with

## Implementing in Firebase

### Step 1: Set Up Firebase Project

1. Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Set up Authentication with email/password method
4. Set up Firebase Storage for file uploads
5. Configure security rules

### Step 2: Security Rules

Here are sample Firestore security rules to implement proper access control:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin(orgId) {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isMember(orgId) {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
    }
    
    function hasPermission(orgId, module, action) {
      let memberData = get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data;
      return memberData.permissions[module][action] == true;
    }
    
    // Base user profiles are readable by themselves, writable by admins
    match /users/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId || resource.data.organizations.hasAny(request.resource.data.organizations));
      allow write: if isSignedIn() && request.auth.uid == userId;
    }
    
    // Organization rules
    match /organizations/{orgId} {
      allow read: if isMember(orgId);
      allow create: if isSignedIn();
      allow update, delete: if isAdmin(orgId);
      
      // Members subcollection
      match /members/{userId} {
        allow read: if isMember(orgId);
        allow write: if isAdmin(orgId);
      }
      
      // Students subcollection
      match /students/{studentId} {
        allow read: if isMember(orgId) && hasPermission(orgId, 'students', 'view');
        allow create: if isMember(orgId) && hasPermission(orgId, 'students', 'create');
        allow update: if isMember(orgId) && hasPermission(orgId, 'students', 'edit');
        allow delete: if isMember(orgId) && hasPermission(orgId, 'students', 'delete');
        
        // Student guardians
        match /guardians/{guardianId} {
          allow read: if isMember(orgId) && hasPermission(orgId, 'students', 'view');
          allow write: if isMember(orgId) && hasPermission(orgId, 'students', 'edit');
        }
      }
      
      // Staff subcollection
      match /staff/{staffId} {
        allow read: if isMember(orgId) && hasPermission(orgId, 'staff', 'view');
        allow create: if isMember(orgId) && hasPermission(orgId, 'staff', 'create');
        allow update: if isMember(orgId) && hasPermission(orgId, 'staff', 'edit');
        allow delete: if isMember(orgId) && hasPermission(orgId, 'staff', 'delete');
      }
      
      // Classes subcollection
      match /classes/{classId} {
        allow read: if isMember(orgId);
        allow write: if isMember(orgId) && (hasPermission(orgId, 'curriculum', 'edit') || isAdmin(orgId));
        
        // Class enrollments
        match /enrollments/{enrollmentId} {
          allow read: if isMember(orgId);
          allow write: if isMember(orgId) && (hasPermission(orgId, 'students', 'edit') || isAdmin(orgId));
        }
      }
      
      // Curriculum subcollection
      match /curriculum/{curriculumId} {
        allow read: if isMember(orgId) && hasPermission(orgId, 'curriculum', 'view');
        allow create: if isMember(orgId) && hasPermission(orgId, 'curriculum', 'create');
        allow update: if isMember(orgId) && hasPermission(orgId, 'curriculum', 'edit');
        allow delete: if isMember(orgId) && hasPermission(orgId, 'curriculum', 'delete');
      }
      
      // Attendance subcollection
      match /attendance/{date}/classes/{classId} {
        allow read: if isMember(orgId) && hasPermission(orgId, 'attendance', 'view');
        allow create, update: if isMember(orgId) && hasPermission(orgId, 'attendance', 'edit');
        allow delete: if isMember(orgId) && hasPermission(orgId, 'attendance', 'delete');
      }
    }
  }
}
```

### Step 3: Initial Data Setup

1. Create an organization document
2. Create an admin user
3. Create a membership record linking the admin to the organization
4. Set up default permission templates

```javascript
// Example initialization code
const adminUser = {
  email: "admin@preschoolpro.com",
  displayName: "Admin User",
  organizations: ["org123"],
  defaultOrganization: "org123",
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
};

const organization = {
  name: "ABC Preschool",
  address: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "90210",
    country: "USA"
  },
  active: true,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
};

const membership = {
  userId: "admin123",
  role: "admin",
  department: "Administration",
  title: "Director",
  joinDate: firebase.firestore.FieldValue.serverTimestamp(),
  status: "active",
  permissions: {
    // Full permissions for all modules
    students: { view: true, create: true, edit: true, delete: true },
    staff: { view: true, create: true, edit: true, delete: true },
    curriculum: { view: true, create: true, edit: true, delete: true },
    attendance: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
    permissions: { view: true, create: true, edit: true, delete: true }
  }
};
```

## Indexes

Firebase requires composite indexes for complex queries. Here are the required indexes:

1. Programs Collection:
```
Collection ID: programs
Fields indexed:
- status (Ascending)
- name (Ascending)
- __name__ (Ascending)
```

2. Classes Collection:
```
Collection ID: classes
Fields indexed:
- status (Ascending)
- name (Ascending)
- __name__ (Ascending)
```

3. Students Collection:
```
Collection ID: students
Fields indexed:
- status (Ascending)
- fullName (Ascending)
- registrationDate (Descending)
```

To create these indexes:
1. Go to the Firebase Console
2. Navigate to Firestore Database
3. Click on the "Indexes" tab
4. Click "Add Index"
5. Select the collection
6. Add the fields with specified order
7. Click "Create Index"

Note: When you see the error message with a direct link to create an index, you can click that link to automatically create the required index.

## Data Modeling Considerations

### Denormalization Strategy

Firebase is a NoSQL database, so some denormalization is recommended:

1. Store user role and permissions both in the users collection and in organization memberships
2. Duplicate student names and IDs in attendance records
3. Store class and teacher names in attendance records
4. Cache counts (number of students, staff, etc.) in organization documents

### Data Validation

Implement validation in the application and through Firebase Functions:

1. Validate email formats and required fields when creating users
2. Ensure date ranges make sense (e.g., birth date can't be in the future)
3. Validate role assignments to ensure proper permissions
4. Check capacity limits when enrolling students in classes

## Data Migration and Backup

1. Implement scheduled backups using Firebase Functions
2. Create data export functionality for reporting
3. Plan for possible data migrations as the application evolves

## Scaling Considerations

1. Limit the size of documents to avoid hitting Firebase's 1MB document size limit
2. For large collections, implement pagination in queries
3. Use Firebase Functions for heavy operations like bulk updates
4. Consider sharding for organizations with very large datasets

## Attendance Tracking System

The attendance tracking system is designed to provide comprehensive monitoring of student attendance with detailed information about sign-in and sign-out times.

### Data Structure

The attendance data is stored in a nested structure:
- At the top level, attendance is organized by date
- Within each date, attendance is further organized by class
- Within each class, a map of student IDs to attendance records is maintained

This structure allows for efficient querying of:
- All attendance for a specific date
- All attendance for a specific class on a specific date
- Attendance history for a specific student across dates

### Attendance Record Fields

Each attendance record contains:
- `status`: The attendance status (present, absent, tardy, excused)
- `signInTime`: When the student arrived (if present)
- `signOutTime`: When the student left (if they've departed)
- `notes`: Additional information, such as reason for absence or tardiness
- `recordedBy`: The user who recorded the attendance
- `timestamp`: When the record was created or last updated

### Attendance Reports

The system supports two types of attendance reports:

1. **Daily Reports**: Detailed attendance records for each student on specific dates, including:
   - Attendance status
   - Sign-in and sign-out times
   - Notes and comments
   - Who recorded the attendance

2. **Summary Reports**: Aggregated attendance data over a date range, including:
   - Total days present/absent/tardy/excused
   - Attendance rate percentage
   - Average sign-in and sign-out times
   - Patterns and trends in attendance

### Implementation Considerations

1. **Performance**: For large preschools with many students, consider:
   - Paginating attendance records when displaying in the UI
   - Using batch operations when saving multiple attendance records
   - Implementing caching for frequently accessed attendance data

2. **Data Integrity**: Implement validation to ensure:
   - Sign-out time is after sign-in time
   - Attendance status is consistent with time records (e.g., a student marked present should have a sign-in time)
   - Only authorized users can modify attendance records

3. **Reporting**: For efficient report generation:
   - Consider creating aggregated data collections for summary statistics
   - Implement background functions to pre-calculate attendance summaries
   - Use client-side caching for report data to improve UI responsiveness

## Student Registration Flow Updates

1. Parent Registration:
   - Parent fills out student information
   - Must provide at least 2 guardians during registration
   - Guardians are stored in the guardians collection
   - Student document references guardian IDs
   - Student is created with waitlist status

2. Guardian Requirements:
   - Minimum 2 guardians required for registration
   - Each guardian must provide basic contact information
   - Guardians are stored separately for reuse with multiple students
   - Guardian-student relationships are maintained in both collections

## Security Rules

Add these rules to the existing security rules:

```javascript
match /organizations/{orgId}/students/{studentId} {
  // Public registration is allowed without authentication
  allow create: if 
    // No auth required for parent registration
    (request.resource.data.registrationType == "parent_registration" &&
     request.resource.data.status == "waitlist") ||
    // Staff registration requires proper permissions
    (request.auth != null && 
     hasPermission(orgId, 'students', 'create'));
    
  // Reading student data requires authentication and proper permissions
  allow read: if request.auth != null && 
    (hasPermission(orgId, 'students', 'view') ||
     // Parents can view their own children
     request.resource.data.guardianEmail == request.auth.token.email);
    
  // Updating student data requires proper permissions
  allow update: if request.auth != null && 
    (hasPermission(orgId, 'students', 'edit') ||
     // Parents can update certain fields for their children
     (request.resource.data.guardianEmail == request.auth.token.email &&
      onlyAllowedFieldsChanged(['medicalInfo', 'emergencyContact'])));
      
  // Deleting students requires proper permissions
  allow delete: if request.auth != null && 
    hasPermission(orgId, 'students', 'delete');
}

// Helper function to check if only allowed fields were changed
function onlyAllowedFieldsChanged(allowedFields) {
  let changedFields = request.resource.data.diff(resource.data);
  return changedFields.affectedKeys().hasOnly(allowedFields);
}
```

## Conclusion

This database design provides a solid foundation for the PreschoolPro application, supporting multiple preschools, role-based access control, and all core features. The structure allows for flexible permission management while maintaining data integrity and security.

As the application evolves, additional collections may be needed for messaging, billing, analytics, and reports. The design can be extended to accommodate these features while maintaining the same organization-centric architecture.

## Storage Implementation

The application uses Firebase Storage with Google Cloud Storage integration for managing student documents and other files. This section outlines the storage structure and configuration.

### Storage Configuration

Each organization can configure their own storage settings. The configuration is stored in Firebase Storage:

```
organizations/{orgId}/config/storage.json
```

**Configuration Fields:**
- `type`: String - Storage provider type ('google' or 'firebase')
- `bucket`: String - Google Cloud Storage bucket name
- `credentials`: Object - Google Cloud credentials
  - `projectId`: String - Google Cloud project ID
  - `clientEmail`: String - Service account email
  - `privateKey`: String - Service account private key

### Student Documents Structure

Student documents are organized in a hierarchical structure:

```
organizations/{orgId}/students/{studentId}/documents/{fileName}
```

**File Naming Convention:**
- Format: `{documentType}_{timestamp}_{originalFileName}`
- Example: `medical_1234567890_vaccination_record.pdf`

**Document Types:**
- medical: Medical records, vaccination history
- enrollment: Enrollment forms, agreements
- academic: Progress reports, assessments
- other: Miscellaneous documents

### Storage Rules

The following security rules are implemented in Firebase Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isMember(orgId) {
      return isSignedIn() && 
        firestore.exists(/databases/(default)/documents/organizations/$(orgId)/members/$(request.auth.uid));
    }
    
    function hasPermission(orgId, module, action) {
      let memberData = firestore.get(/databases/(default)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data;
      return memberData.permissions[module][action] == true;
    }
    
    // Organization storage configuration
    match /organizations/{orgId}/config/storage.json {
      allow read: if isMember(orgId);
      allow write: if isMember(orgId) && hasPermission(orgId, 'settings', 'edit');
    }
    
    // Student documents
    match /organizations/{orgId}/students/{studentId}/documents/{fileName} {
      allow read: if isMember(orgId) && hasPermission(orgId, 'students', 'view');
      allow write: if isMember(orgId) && hasPermission(orgId, 'students', 'edit');
      allow delete: if isMember(orgId) && hasPermission(orgId, 'students', 'delete');
    }
  }
}
```

### Storage Services

The application provides a `StorageServices` class that handles all storage operations:

1. **Configuration Management**
   - `configureStorage(orgId, config)`: Set up storage for an organization
   - `isStorageConfigured(orgId)`: Check if storage is configured

2. **Document Operations**
   - `uploadStudentDocument(orgId, studentId, file, documentType)`: Upload a document
   - `getStudentDocuments(orgId, studentId)`: List all documents for a student
   - `deleteStudentDocument(orgId, path)`: Delete a document

### Components

1. **StorageConfig Component**
   - Handles organization storage configuration
   - Manages Google Cloud Storage credentials
   - Provides feedback on configuration status

2. **StudentDocuments Component**
   - Displays student documents
   - Handles document uploads
   - Manages document deletion
   - Shows storage configuration status

### Implementation Notes

1. **Security Considerations**
   - Credentials are stored securely in Firebase Storage
   - Access is controlled through Firebase Storage rules
   - File types and sizes are validated

2. **Performance**
   - Documents are organized by student for efficient access
   - File names include timestamps to prevent conflicts
   - Document types are encoded in filenames for easy filtering

3. **Extensibility**
   - Storage configuration supports multiple providers
   - Document structure can be extended for additional types
   - Components can be reused for other document types

4. **Error Handling**
   - Storage configuration errors are caught and reported
   - Upload/download failures are handled gracefully
   - User feedback is provided through toast notifications

### Future Enhancements

1. **Additional Storage Providers**
   - Support for AWS S3
   - Support for Azure Blob Storage
   - Local storage for development

2. **Document Management**
   - Document versioning
   - Document sharing
   - Document preview
   - Batch upload/download

3. **Organization Storage**
   - Organization-wide document storage
   - Shared resources
   - Template management

4. **Analytics**
   - Storage usage tracking
   - Document access logs
   - Storage cost monitoring

### Student Documents
Stores student-related documents in Firebase Storage.

```
organizations/{organizationId}/students/{studentId}/documents/{documentId}
```

**Document Types:**
- `medical`: Medical records, vaccination history, health forms
- `enrollment`: Enrollment forms, agreements, contracts
- `academic`: Progress reports, assessments, evaluations
- `other`: Miscellaneous documents

**Document Metadata:**
- `type`: String - Document type
- `name`: String - Original filename
- `size`: Number - File size in bytes
- `contentType`: String - MIME type
- `uploadedAt`: Timestamp
- `uploadedBy`: String - User ID
- `description`: String (optional)

## Storage Rules

Add these rules to the existing storage rules:

```javascript
match /organizations/{orgId}/students/{studentId}/documents/{documentId} {
  allow read: if isMember(orgId) && hasPermission(orgId, 'students', 'view');
  allow create: if isMember(orgId) && hasPermission(orgId, 'students', 'edit');
  allow delete: if isMember(orgId) && hasPermission(orgId, 'students', 'delete');
  
  // Validate file type and size
  allow create: if request.resource.size < 5 * 1024 * 1024 && // 5MB max
    request.resource.contentType.matches('application/pdf|image/.*|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document');
} 
# PreschoolPro Firebase Implementation Guide

This guide provides step-by-step instructions for implementing the PreschoolPro database design in Firebase.

## Prerequisites

Before you begin, make sure you have:

1. A Firebase account
2. Node.js and npm installed
3. Basic knowledge of Firebase services

## Setup Process

### Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Give your project a name (e.g., "PreschoolPro")
4. Configure Google Analytics if desired
5. Click "Create project"

### Step 2: Enable Firebase Services

Once your project is created, you need to enable the required services:

1. **Firestore Database**:
   - In the Firebase Console, navigate to "Firestore Database"
   - Click "Create database"
   - Choose "Start in production mode" for secure rules
   - Select a location for your database

2. **Authentication**:
   - Navigate to "Authentication" in the Firebase Console
   - Click "Get started"
   - Enable "Email/Password" provider
   - (Optional) Enable other authentication methods as needed

3. **Storage**:
   - Navigate to "Storage" in the Firebase Console
   - Click "Get started"
   - Choose "Start in production mode"
   - Select a location for your bucket

### Step 3: Configure Your Web Application

1. In the Firebase Console, add a web app to your project:
   - Click the gear icon (Project settings)
   - Scroll down to "Your apps" and click the web icon (</>) 
   - Register your app with a nickname
   - Copy the Firebase configuration object

2. Create a `.env.local` file in your project with the Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Step 4: Deploy Security Rules

1. **Firestore Rules**:
   - Copy the contents of `firestore.rules` to your clipboard
   - In the Firebase Console, navigate to Firestore → Rules
   - Replace the default rules with our custom rules
   - Click "Publish"

2. **Storage Rules**:
   - Copy the contents of `storage.rules` to your clipboard
   - In the Firebase Console, navigate to Storage → Rules
   - Replace the default rules with our custom rules
   - Click "Publish"

### Step 5: Initialize the Database

1. Run the initialization script to set up the database structure:
   ```bash
   node scripts/init-firebase-database.js
   ```

   This script will:
   - Create an organization document
   - Create an admin user
   - Set up the admin's permissions
   - Add sample class and curriculum data

2. If you encounter any errors:
   - Make sure all Firebase services are properly enabled
   - Check that your Firebase configuration in `.env.local` is correct
   - Ensure you have the necessary npm packages installed

### Step 6: Create Indexes

For complex queries to work efficiently, create the following indexes in Firestore:

1. In the Firebase Console, navigate to Firestore → Indexes → Composite
2. Click "Add index" and create each of these indexes:

| Collection Path | Field 1 | Order 1 | Field 2 | Order 2 |
|-----------------|---------|---------|---------|---------|
| organizations/{orgId}/students | status | Ascending | fullName | Ascending |
| organizations/{orgId}/students | ageGroup | Ascending | fullName | Ascending |
| organizations/{orgId}/staff | status | Ascending | lastName | Ascending |
| organizations/{orgId}/curriculum | ageGroup | Ascending | subject | Ascending |
| organizations/{orgId}/curriculum | status | Ascending | createdAt | Descending |
| organizations/{orgId}/attendance/{date}/classes | classId | Ascending | date | Descending |

### Step 7: Test Your Setup

1. Use the admin credentials (created during initialization) to log in:
   - Email: admin@example.com
   - Password: Admin123!

2. Verify that you can:
   - View the organization details
   - See the sample class and curriculum data
   - Create, update, and delete records

## Database Structure

The database is organized around organizations, with subcollections for various entity types:

- `/organizations/{organizationId}` - Organization details
- `/organizations/{organizationId}/members/{userId}` - Organization members with roles and permissions
- `/organizations/{organizationId}/students/{studentId}` - Student records
- `/organizations/{organizationId}/staff/{userId}` - Staff details
- `/organizations/{organizationId}/classes/{classId}` - Class/section information
- `/organizations/{organizationId}/curriculum/{curriculumId}` - Curriculum plans
- `/organizations/{organizationId}/attendance/{date}/classes/{classId}` - Attendance records

Additionally, there is a top-level collection for user accounts:
- `/users/{userId}` - User account information

## File Organization

For proper integration with Firebase, make sure you maintain these files:

- `firestore.rules` - Security rules for Firestore
- `storage.rules` - Security rules for Firebase Storage
- `.env.local` - Environment variables with Firebase configuration
- `scripts/init-firebase-database.js` - Database initialization script

## Best Practices

1. **Security**: Never expose Firebase credentials in client-side code without restricting them with proper security rules.

2. **Batched Writes**: For operations that update multiple documents, use batched writes or transactions to ensure atomicity.

3. **Data Structure**: Keep documents small and avoid deeply nested data to optimize read/write operations.

4. **Query Performance**: Create indexes for all complex queries to ensure fast performance.

5. **Offline Support**: Configure your application to use Firebase's offline capabilities for better user experience.

## Troubleshooting

### Common Issues

1. **"Permission Denied" errors**: 
   - Check that your security rules are correctly implemented
   - Verify that the user has the required role and permissions

2. **"Missing Index" errors**:
   - Follow the link in the error message to create the required index
   - Wait for the index to be built before retrying

3. **Authentication Issues**:
   - Ensure the Authentication service is enabled
   - Check that the user's email and password are correct

4. **Firestore Not Available**:
   - Make sure Firestore is enabled in your Firebase project
   - Some regions may have restrictions or delays in service availability

## Next Steps

After setting up the basic structure, consider implementing these advanced features:

1. **Cloud Functions**: For server-side logic like sending notifications or processing data
2. **Data Backups**: Schedule regular exports of your Firestore data
3. **Analytics Integration**: Track user behavior to improve your application
4. **Multi-Region Deployment**: For better performance and reliability

## Support

If you encounter issues with your Firebase implementation:

1. Check the [Firebase documentation](https://firebase.google.com/docs)
2. Visit the [Firebase Community](https://firebase.google.com/community)
3. Consult Stack Overflow with the [firebase](https://stackoverflow.com/questions/tagged/firebase) tag 
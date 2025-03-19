# User Management in PreschoolPro

This document explains how user management works in the PreschoolPro application, including the database structure, authentication flow, and role-based access control.

## Database Structure

The application uses two main collections in Firebase:

1. **users**: Stores user information and references to organizations they belong to
2. **organizations**: Stores organization information and contains subcollections for members, students, etc.

### Users Collection

Each document in the `users` collection represents a user and has the following structure:

```
users/{userId}
{
  email: string,
  displayName: string,
  organizations: string[] // Array of organization IDs the user belongs to
}
```

### Organizations Collection

Each document in the `organizations` collection represents an organization:

```
organizations/{orgId}
{
  name: string,
  createdAt: timestamp,
  createdBy: string // User ID who created the organization
}
```

### Organization Members Subcollection

Each organization has a `members` subcollection that defines user roles and permissions:

```
organizations/{orgId}/members/{userId}
{
  email: string,
  role: "admin" | "teacher" | "staff" | "parent",
  permissions: {
    [module]: {
      view: boolean,
      create: boolean,
      edit: boolean,
      delete: boolean
    }
  },
  addedAt: timestamp
}
```

## Authentication Flow

1. Users sign up or log in using Firebase Authentication
2. Upon successful authentication, the app fetches the user's organizations from the `users` collection
3. The app then fetches the user's membership details from the first organization's `members` subcollection
4. The user's role and permissions are determined based on their membership

## Role-Based Access Control

The application supports the following roles:

1. **Admin**: Full access to all features
2. **Teacher**: Access to students, guardians, classes, attendance, and calendar
3. **Staff**: Limited access to view students and guardians
4. **Parent**: Access to their children's information only

### Special Admin Access

For administrative users (emails containing "admin@" or specifically "admin@preschoolpro.com" or "admin2@preschoolpro.com"), the application provides special handling:

1. These users are automatically granted admin privileges regardless of their database role
2. If they don't have a membership record in an organization, one is automatically created with admin role

## Adding New Users

To add a new user to the system:

1. **Create Firebase Auth Account**: The user must be registered in Firebase Authentication
2. **Create User Document**: Add a document in the `users` collection with their user ID
3. **Add Organization Membership**: Add a document in the organization's `members` subcollection with their role and permissions
4. **Update User's Organizations**: Add the organization ID to the user's `organizations` array

You can use the `scripts/ensure-admin-access.js` script as a reference for how to programmatically add users.

## Troubleshooting Access Issues

If a user is having access issues:

1. Check if the user exists in Firebase Authentication
2. Verify the user has a document in the `users` collection
3. Confirm the user's `organizations` array contains the organization ID
4. Check if the user has a document in the organization's `members` subcollection
5. Verify the user's role and permissions in their membership document

For admin users, you can run the `scripts/ensure-admin-access.js` script to automatically fix access issues.

## Best Practices

1. Always assign the most restrictive role necessary for a user
2. Use the Permissions page to manage detailed permissions for each user
3. Regularly audit user access to ensure security
4. When adding staff or teachers, create both a Firebase Auth account and the necessary database entries 
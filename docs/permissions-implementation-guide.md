# Permissions Implementation Guide for PreschoolPro

This guide explains how to implement role-based access control (RBAC) in the PreschoolPro application.

## Overview

The permissions system is built around:

1. **User Roles**: Admin, Teacher, Staff, Parent
2. **Modules**: Different sections of the application (students, staff, curriculum, etc.)
3. **Actions**: View, Create, Edit, Delete

## Key Components

### 1. Permissions Context

The `PermissionsContext` provides access to user permissions throughout the application:

```tsx
// lib/permissions-context.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase-config";
```

This context:
- Loads user permissions from Firebase
- Provides default permissions based on user role
- Offers a `hasPermission(module, action)` function to check permissions

### 2. Protected Page Component

The `ProtectedPage` component wraps content that requires specific permissions:

```tsx
// components/protected-page.tsx
import { usePermissions, PermissionAction } from "@/lib/permissions-context";
```

Use this component to protect entire pages or sections within pages.

### 3. Permission-Aware Sidebar

The sidebar filters navigation items based on user permissions:

```tsx
// components/dashboard/sidebar-with-permissions.tsx
import { usePermissions } from "@/lib/permissions-context";
```

## How to Implement Permissions

### Step 1: Wrap Your Application

The `PermissionsProvider` should wrap your application in `app/layout.tsx`:

```tsx
<AuthProvider>
  <PermissionsProvider>
    {children}
  </PermissionsProvider>
</AuthProvider>
```

### Step 2: Protect Pages

Wrap each page or component that requires specific permissions:

```tsx
// Protecting an entire page
export default function StudentsPageWrapper() {
  return (
    <ProtectedPage module="students" action="view">
      <StudentsPage />
    </ProtectedPage>
  );
}

// Protecting a section within a page
{hasPermission("students", "create") && (
  <Button>Add Student</Button>
)}
```

### Step 3: Conditional UI Elements

Use the `hasPermission` function to conditionally render UI elements:

```tsx
const { hasPermission } = usePermissions();

// Only show if user can create students
{hasPermission("students", "create") && (
  <Button>
    <Plus className="h-4 w-4 mr-2" />
    Add Student
  </Button>
)}
```

### Step 4: Protect Actions

Check permissions before performing actions:

```tsx
const handleDeleteStudent = (id: string) => {
  if (hasPermission("students", "delete")) {
    // Perform delete operation
    setStudents(students.filter((student) => student.id !== id));
  }
};
```

## Permission Structure

Permissions are structured as follows:

```typescript
type UserPermissions = {
  students?: {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
  staff?: {
    // Similar structure
  };
  // Other modules...
};
```

## Default Role Permissions

The system includes default permissions for each role:

- **Admin**: Full access to everything
- **Teacher**: Can view and edit students, manage curriculum, etc.
- **Staff**: Limited access to view information and perform basic tasks
- **Parent**: Can only view their children's information and communicate

## Managing Permissions

Administrators can manage permissions through the Permissions page:

1. Select a staff member
2. Apply a permission template or customize individual permissions
3. Save the changes

## Firebase Integration

Permissions are stored in Firestore:

```
users/{userId}/permissions/{module}/{action} = boolean
```

When a user logs in, their permissions are loaded from Firestore and merged with the default permissions for their role.

## Best Practices

1. **Always check permissions** before performing sensitive operations
2. **Use the ProtectedPage component** for entire pages
3. **Use conditional rendering** for UI elements
4. **Keep permission checks close to the action** they protect
5. **Test with different user roles** to ensure proper access control

## Example Implementation

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProtectedPage } from "@/components/protected-page";
import { usePermissions } from "@/lib/permissions-context";

export default function StudentsPageWrapper() {
  return (
    <ProtectedPage module="students" action="view">
      <StudentsPage />
    </ProtectedPage>
  );
}

function StudentsPage() {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      <h1>Students</h1>
      
      {/* Conditional UI based on permissions */}
      {hasPermission("students", "create") && (
        <Button>Add Student</Button>
      )}
      
      {/* Content visible to anyone with "view" permission */}
      <StudentsList />
    </div>
  );
}
``` 
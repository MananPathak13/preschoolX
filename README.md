# PreschoolPro - Preschool Management System

PreschoolPro is a comprehensive management system for preschools, designed to help administrators, teachers, and parents manage students, staff, curriculum, and daily operations.

## Features

- **Student Management**: Add/remove students, track attendance, view profiles
- **Staff Management**: Manage staff profiles, schedules, and tasks
- **Curriculum Planning**: Create and organize lesson plans and activities
- **Communication**: In-app messaging between staff and parents
- **Attendance Tracking**: Mark and monitor student attendance
- **Reporting**: Generate various reports for administration
- **Analytics**: Visualize data for better decision making
- **Permissions System**: Role-based access control for different user types

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Additional Tools**: React Hook Form, Zod, Date-fns

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/preschoolpro.git
   cd preschoolpro
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Initialize default users (optional):
   ```bash
   node scripts/init-default-users.js
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Roles and Permissions

PreschoolPro implements a comprehensive role-based access control system with the following roles:

### Default Roles

1. **Administrator**
   - Full access to all features
   - Can manage users and their permissions
   - Can access all settings and configuration

2. **Teacher**
   - Can view and edit student information
   - Can create and manage curriculum
   - Can take attendance and generate reports
   - Limited access to staff management and settings

3. **Staff**
   - Can view student information
   - Can take attendance
   - Limited access to other features

4. **Parent**
   - Can view their children's information
   - Can communicate with teachers and staff
   - Can view curriculum and attendance for their children

### Permissions System

The permissions system is module-based, with each module having four possible actions:

- **View**: Ability to see information
- **Create**: Ability to add new records
- **Edit**: Ability to modify existing records
- **Delete**: Ability to remove records

Administrators can customize permissions for each user through the Permissions page.

### Default Users

When you run the initialization script, the following default users are created:

1. **Admin User**
   - Email: admin@preschoolpro.com
   - Password: Admin123!

2. **Teacher User**
   - Email: teacher@preschoolpro.com
   - Password: Teacher123!

3. **Staff User**
   - Email: staff@preschoolpro.com
   - Password: Staff123!

4. **Parent User**
   - Email: parent@preschoolpro.com
   - Password: Parent123!

## Development Guide

### Implementing Permissions in New Pages

When creating new pages or components, use the `ProtectedPage` component to enforce permissions:

```tsx
import { ProtectedPage } from "@/components/protected-page";

export default function MyPageWrapper() {
  return (
    <ProtectedPage module="myModule" action="view">
      <MyPage />
    </ProtectedPage>
  );
}

function MyPage() {
  // Page content here
}
```

For conditional rendering within a page, use the `hasPermission` function:

```tsx
import { usePermissions } from "@/lib/permissions-context";

function MyComponent() {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      {/* Content visible to everyone with view permission */}
      
      {/* Conditional content based on permissions */}
      {hasPermission("myModule", "create") && (
        <Button>Add New Item</Button>
      )}
    </div>
  );
}
```

For more detailed information, see the [Permissions Implementation Guide](docs/permissions-implementation-guide.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Firebase](https://firebase.google.com/)
- [Lucide Icons](https://lucide.dev/) 
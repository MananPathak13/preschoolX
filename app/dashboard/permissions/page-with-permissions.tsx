"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Check } from "lucide-react";
import { ProtectedPage } from "@/components/protected-page";
import { usePermissions, UserPermissions, ModulePermission, PermissionAction } from "@/lib/permissions-context";

// Mock staff data
const mockStaff = [
    {
        id: "1",
        name: "John Smith",
        email: "john.smith@preschoolpro.com",
        role: "teacher",
        department: "Pre-K",
        joinDate: "2022-08-15",
    },
    {
        id: "2",
        name: "Emily Johnson",
        email: "emily.johnson@preschoolpro.com",
        role: "teacher",
        department: "Toddlers",
        joinDate: "2021-06-10",
    },
    {
        id: "3",
        name: "Michael Brown",
        email: "michael.brown@preschoolpro.com",
        role: "staff",
        department: "Administration",
        joinDate: "2023-01-05",
    },
    {
        id: "4",
        name: "Sarah Davis",
        email: "sarah.davis@preschoolpro.com",
        role: "teacher",
        department: "Kindergarten",
        joinDate: "2022-03-22",
    },
    {
        id: "5",
        name: "Robert Wilson",
        email: "robert.wilson@preschoolpro.com",
        role: "staff",
        department: "Maintenance",
        joinDate: "2021-11-30",
    },
];

// Permission templates for different roles
const permissionTemplates = {
    administrator: {
        students: { view: true, create: true, edit: true, delete: true },
        staff: { view: true, create: true, edit: true, delete: true },
        curriculum: { view: true, create: true, edit: true, delete: true },
        messages: { view: true, create: true, edit: true, delete: true },
        attendance: { view: true, create: true, edit: true, delete: true },
        reports: { view: true, create: true, edit: true, delete: true },
        analytics: { view: true, create: true, edit: true, delete: true },
        billing: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true },
        permissions: { view: true, create: true, edit: true, delete: true },
        help: { view: true, create: true, edit: true, delete: true },
    },
    teacher: {
        students: { view: true, create: false, edit: true, delete: false },
        staff: { view: true, create: false, edit: false, delete: false },
        curriculum: { view: true, create: true, edit: true, delete: false },
        messages: { view: true, create: true, edit: true, delete: true },
        attendance: { view: true, create: true, edit: true, delete: false },
        reports: { view: true, create: true, edit: false, delete: false },
        analytics: { view: true, create: false, edit: false, delete: false },
        billing: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false },
        help: { view: true, create: false, edit: false, delete: false },
    },
    assistant: {
        students: { view: true, create: false, edit: false, delete: false },
        staff: { view: true, create: false, edit: false, delete: false },
        curriculum: { view: true, create: false, edit: false, delete: false },
        messages: { view: true, create: true, edit: true, delete: true },
        attendance: { view: true, create: true, edit: false, delete: false },
        reports: { view: true, create: false, edit: false, delete: false },
        analytics: { view: false, create: false, edit: false, delete: false },
        billing: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false },
        help: { view: true, create: false, edit: false, delete: false },
    },
    readonly: {
        students: { view: true, create: false, edit: false, delete: false },
        staff: { view: true, create: false, edit: false, delete: false },
        curriculum: { view: true, create: false, edit: false, delete: false },
        messages: { view: true, create: false, edit: false, delete: false },
        attendance: { view: true, create: false, edit: false, delete: false },
        reports: { view: true, create: false, edit: false, delete: false },
        analytics: { view: true, create: false, edit: false, delete: false },
        billing: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false },
        help: { view: true, create: false, edit: false, delete: false },
    },
};

// List of all modules in the application
const modules = [
    "students",
    "staff",
    "curriculum",
    "messages",
    "attendance",
    "reports",
    "analytics",
    "billing",
    "settings",
    "permissions",
    "help",
];

// List of all permission actions
const actions: PermissionAction[] = ["view", "create", "edit", "delete"];

export default function PermissionsPageWrapper() {
    // Wrap the actual page with permission check
    return (
        <ProtectedPage module="permissions" action="view">
            <PermissionsPage />
        </ProtectedPage>
    );
}

function PermissionsPage() {
    const [staff, setStaff] = useState(mockStaff);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStaff, setSelectedStaff] = useState<typeof mockStaff[0] | null>(null);
    const [editedPermissions, setEditedPermissions] = useState<UserPermissions>({});
    const [saveSuccess, setSaveSuccess] = useState(false);
    const { isAdmin } = usePermissions();

    // Filter staff based on search query
    const filteredStaff = staff.filter(
        (member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle staff selection
    const handleSelectStaff = (staffMember: typeof mockStaff[0]) => {
        setSelectedStaff(staffMember);
        // Initialize with default permissions based on role
        setEditedPermissions(permissionTemplates[staffMember.role as keyof typeof permissionTemplates] || {});
        setSaveSuccess(false);
    };

    // Handle permission change
    const handlePermissionChange = (
        module: string,
        action: string,
        value: boolean
    ) => {
        setEditedPermissions((prev) => {
            const modulePermissions = { ...(prev[module as keyof UserPermissions] || {}) };
            modulePermissions[action as keyof ModulePermission] = value;

            return {
                ...prev,
                [module]: modulePermissions,
            };
        });
        setSaveSuccess(false);
    };

    // Apply a permission template
    const applyTemplate = (templateName: string) => {
        if (templateName in permissionTemplates) {
            setEditedPermissions(
                permissionTemplates[templateName as keyof typeof permissionTemplates]
            );
            setSaveSuccess(false);
        }
    };

    // Save permissions
    const savePermissions = () => {
        // In a real application, this would save to the database
        console.log("Saving permissions for:", selectedStaff?.name);
        console.log("Permissions:", editedPermissions);

        // Show success message
        setSaveSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
            setSaveSuccess(false);
        }, 3000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">User Permissions</h1>
                <p className="text-muted-foreground">
                    Manage access levels for staff members
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Staff List */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Staff Members</CardTitle>
                        <CardDescription>Select a staff member to manage permissions</CardDescription>
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search staff..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[400px] overflow-auto">
                            {filteredStaff.map((member) => (
                                <div
                                    key={member.id}
                                    className={`p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors ${selectedStaff?.id === member.id ? "bg-accent" : ""
                                        }`}
                                    onClick={() => handleSelectStaff(member)}
                                >
                                    <div className="font-medium">{member.name}</div>
                                    <div className="text-sm text-muted-foreground">{member.email}</div>
                                    <div className="text-xs text-muted-foreground mt-1 capitalize">
                                        {member.role} • {member.department}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions Editor */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>
                            {selectedStaff
                                ? `Edit Permissions: ${selectedStaff.name}`
                                : "Select a staff member"}
                        </CardTitle>
                        <CardDescription>
                            {selectedStaff
                                ? `Customize access levels for ${selectedStaff.name}`
                                : "Choose a staff member from the list to edit their permissions"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedStaff ? (
                            <div className="space-y-6">
                                {/* Permission Templates */}
                                <div className="space-y-2">
                                    <Label>Apply Permission Template</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => applyTemplate("administrator")}
                                        >
                                            Administrator
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => applyTemplate("teacher")}
                                        >
                                            Teacher
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => applyTemplate("assistant")}
                                        >
                                            Assistant
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => applyTemplate("readonly")}
                                        >
                                            Read Only
                                        </Button>
                                    </div>
                                </div>

                                {/* Permissions Table */}
                                <div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Module</TableHead>
                                                <TableHead>View</TableHead>
                                                <TableHead>Create</TableHead>
                                                <TableHead>Edit</TableHead>
                                                <TableHead>Delete</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {modules.map((module) => (
                                                <TableRow key={module}>
                                                    <TableCell className="font-medium capitalize">
                                                        {module}
                                                    </TableCell>
                                                    {actions.map((action) => (
                                                        <TableCell key={`${module}-${action}`}>
                                                            <Switch
                                                                checked={
                                                                    !!editedPermissions[module as keyof UserPermissions]?.[
                                                                    action
                                                                    ]
                                                                }
                                                                onCheckedChange={(checked) =>
                                                                    handlePermissionChange(module, action, checked)
                                                                }
                                                                disabled={!isAdmin}
                                                            />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    {saveSuccess && (
                                        <div className="flex items-center text-green-600 mr-4">
                                            <Check className="h-4 w-4 mr-1" />
                                            Permissions saved successfully
                                        </div>
                                    )}
                                    <Button onClick={savePermissions} disabled={!isAdmin}>
                                        Save Permissions
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Select a staff member to edit their permissions
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 
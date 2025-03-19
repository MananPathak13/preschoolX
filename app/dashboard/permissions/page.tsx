"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Loader2 } from "lucide-react";

// Define permission types
type PermissionAction = "view" | "create" | "edit" | "delete";

interface ModulePermissions {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

interface UserPermissions {
    [module: string]: ModulePermissions;
}

type UserRole = "admin" | "teacher" | "staff" | "parent";

interface StaffMember {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    permissions: UserPermissions;
}

export default function PermissionsPage() {
    const { user, organization } = useAuth();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    // Define available modules and their permissions
    const modules = [
        { id: "students", name: "Students" },
        { id: "staff", name: "Staff" },
        { id: "guardians", name: "Guardians" },
        { id: "classes", name: "Classes" },
        { id: "attendance", name: "Attendance" },
        { id: "calendar", name: "Calendar" },
        { id: "reports", name: "Reports" },
        { id: "settings", name: "Settings" }
    ];

    // Fetch staff members
    useEffect(() => {
        const fetchStaff = async () => {
            if (!organization) return;

            try {
                setLoading(true);
                const staffRef = collection(db, `organizations/${organization.id}/members`);
                const q = query(staffRef, where("role", "in", ["teacher", "staff", "admin"]));
                const querySnapshot = await getDocs(q);

                const staffData: StaffMember[] = [];
                querySnapshot.forEach((docSnapshot: any) => {
                    const data = docSnapshot.data();
                    staffData.push({
                        id: docSnapshot.id,
                        email: data.email || "",
                        fullName: data.fullName || data.email || "Unknown",
                        role: data.role || "staff",
                        permissions: data.permissions || {}
                    });
                });

                setStaff(staffData);
            } catch (error) {
                console.error("Error fetching staff:", error);
                setStatusMessage({
                    type: "error",
                    message: "Failed to load staff members"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, [organization]);

    // Filter staff based on search term
    const filteredStaff = staff.filter(member =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle permission change
    const handlePermissionChange = (module: string, action: PermissionAction, checked: boolean) => {
        if (!selectedStaff) return;

        setSelectedStaff(prev => {
            if (!prev) return null;

            const updatedPermissions = { ...prev.permissions };

            if (!updatedPermissions[module]) {
                updatedPermissions[module] = { view: false, create: false, edit: false, delete: false };
            }

            updatedPermissions[module] = {
                ...updatedPermissions[module],
                [action]: checked
            };

            return {
                ...prev,
                permissions: updatedPermissions
            };
        });
    };

    // Handle role change
    const handleRoleChange = (role: UserRole) => {
        if (!selectedStaff) return;

        setSelectedStaff(prev => {
            if (!prev) return null;

            return {
                ...prev,
                role
            };
        });
    };

    // Save permissions
    const savePermissions = async () => {
        if (!selectedStaff || !organization) return;

        try {
            setSaving(true);
            const memberRef = doc(db, `organizations/${organization.id}/members`, selectedStaff.id);

            await updateDoc(memberRef, {
                role: selectedStaff.role,
                permissions: selectedStaff.permissions
            });

            // Update local state
            setStaff(prev =>
                prev.map(member =>
                    member.id === selectedStaff.id ? selectedStaff : member
                )
            );

            setStatusMessage({
                type: "success",
                message: "Permissions updated successfully"
            });
        } catch (error) {
            console.error("Error updating permissions:", error);
            setStatusMessage({
                type: "error",
                message: "Failed to update permissions"
            });
        } finally {
            setSaving(false);
        }
    };

    // Set default permissions based on role
    const setDefaultPermissions = (role: UserRole) => {
        if (!selectedStaff) return;

        const defaultPerms: UserPermissions = {};

        modules.forEach(module => {
            if (role === "admin") {
                defaultPerms[module.id] = { view: true, create: true, edit: true, delete: true };
            } else if (role === "teacher") {
                defaultPerms[module.id] = {
                    view: ["students", "guardians", "classes", "attendance", "calendar"].includes(module.id),
                    create: ["attendance"].includes(module.id),
                    edit: ["attendance"].includes(module.id),
                    delete: false
                };
            } else if (role === "staff") {
                defaultPerms[module.id] = {
                    view: ["students", "guardians", "calendar"].includes(module.id),
                    create: false,
                    edit: false,
                    delete: false
                };
            }
        });

        setSelectedStaff(prev => {
            if (!prev) return null;

            return {
                ...prev,
                permissions: defaultPerms,
                role
            };
        });
    };

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">User Permissions</h1>

            {statusMessage && (
                <div className={`mb-4 p-4 rounded-md ${statusMessage.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}>
                    {statusMessage.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Staff Members</CardTitle>
                        <CardDescription>Manage permissions for staff and teachers</CardDescription>
                        <Input
                            placeholder="Search staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mt-2"
                        />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {filteredStaff.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No staff members found</p>
                                ) : (
                                    filteredStaff.map(member => (
                                        <div
                                            key={member.id}
                                            className={`p-3 rounded-md cursor-pointer hover:bg-muted ${selectedStaff?.id === member.id ? 'bg-muted' : ''}`}
                                            onClick={() => setSelectedStaff(member)}
                                        >
                                            <div className="font-medium">{member.fullName}</div>
                                            <div className="text-sm text-muted-foreground">{member.email}</div>
                                            <div className="text-xs mt-1 inline-block px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {selectedStaff ? (
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>{selectedStaff.fullName}</CardTitle>
                            <CardDescription>{selectedStaff.email}</CardDescription>

                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={selectedStaff.role}
                                        onValueChange={(value) => handleRoleChange(value as UserRole)}
                                    >
                                        <SelectTrigger id="role">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="teacher">Teacher</SelectItem>
                                            <SelectItem value="staff">Staff</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setDefaultPermissions(selectedStaff.role)}
                                >
                                    Set Default Permissions
                                </Button>

                                <Button
                                    onClick={savePermissions}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="permissions">
                                <TabsList>
                                    <TabsTrigger value="permissions">Module Permissions</TabsTrigger>
                                </TabsList>
                                <TabsContent value="permissions" className="space-y-4">
                                    <div className="border rounded-md">
                                        <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                                            <div>Module</div>
                                            <div>View</div>
                                            <div>Create</div>
                                            <div>Edit</div>
                                            <div>Delete</div>
                                        </div>

                                        {modules.map(module => {
                                            const modulePerms = selectedStaff.permissions[module.id] || {
                                                view: false,
                                                create: false,
                                                edit: false,
                                                delete: false
                                            };

                                            return (
                                                <div key={module.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0">
                                                    <div className="font-medium">{module.name}</div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`${module.id}-view`}
                                                            checked={modulePerms.view}
                                                            onCheckedChange={(checked) =>
                                                                handlePermissionChange(module.id, "view", checked === true)
                                                            }
                                                        />
                                                        <Label htmlFor={`${module.id}-view`}>View</Label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`${module.id}-create`}
                                                            checked={modulePerms.create}
                                                            onCheckedChange={(checked) =>
                                                                handlePermissionChange(module.id, "create", checked === true)
                                                            }
                                                        />
                                                        <Label htmlFor={`${module.id}-create`}>Create</Label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`${module.id}-edit`}
                                                            checked={modulePerms.edit}
                                                            onCheckedChange={(checked) =>
                                                                handlePermissionChange(module.id, "edit", checked === true)
                                                            }
                                                        />
                                                        <Label htmlFor={`${module.id}-edit`}>Edit</Label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`${module.id}-delete`}
                                                            checked={modulePerms.delete}
                                                            onCheckedChange={(checked) =>
                                                                handlePermissionChange(module.id, "delete", checked === true)
                                                            }
                                                        />
                                                        <Label htmlFor={`${module.id}-delete`}>Delete</Label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="md:col-span-2">
                        <CardContent className="flex items-center justify-center h-full min-h-[300px] text-muted-foreground">
                            Select a staff member to manage their permissions
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 
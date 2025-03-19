"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search, Edit, Trash, Mail, Phone, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import firebaseServices from "@/lib/firebase-services";
import { ProtectedPage } from "@/components/protected-page";
import { useAuth } from "@/lib/auth-context";

// Staff roles
const staffRoles = [
    "Lead Teacher",
    "Assistant Teacher",
    "Administrator",
    "Special Education Teacher",
    "Nurse",
    "Counselor",
];

// Weekdays
const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
];

export default function StaffPageWrapper() {
    return (
        <ProtectedPage module="staff" action="view">
            <StaffPage />
        </ProtectedPage>
    );
}

function StaffPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { user, organization } = useAuth();
    const [newStaff, setNewStaff] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        schedule: [] as string[],
        status: "active",
    });

    useEffect(() => {
        if (organization) {
            fetchStaff(organization.id);
        }
    }, [organization]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredStaff(staff);
        } else {
            const filtered = staff.filter(
                member =>
                    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    member.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    member.department?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredStaff(filtered);
        }
    }, [searchTerm, staff]);

    const fetchStaff = async (orgId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const staffData = await firebaseServices.getStaff(orgId, {});
            setStaff(staffData);
            setFilteredStaff(staffData);
        } catch (error) {
            console.error("Error fetching staff:", error);
            setError("Failed to load staff. Please try again.");
            toast({
                title: "Error",
                description: "Failed to load staff. Please try again.",
                variant: "destructive",
            });
            setStaff([]);
            setFilteredStaff([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewStaff({ ...newStaff, [name]: value });
    };

    // Handle role selection
    const handleRoleChange = (value: string) => {
        setNewStaff({ ...newStaff, position: value });
    };

    // Handle department selection
    const handleDepartmentChange = (value: string) => {
        setNewStaff({ ...newStaff, department: value });
    };

    // Handle schedule selection
    const handleScheduleChange = (day: string) => {
        const updatedSchedule = newStaff.schedule.includes(day)
            ? newStaff.schedule.filter((d) => d !== day)
            : [...newStaff.schedule, day];

        setNewStaff({ ...newStaff, schedule: updatedSchedule });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!organization) return;

        try {
            setIsLoading(true);

            await firebaseServices.createStaffMember(organization.id, newStaff);

            toast({
                title: "Success",
                description: "Staff member has been added successfully.",
            });

            // Reset form
            setNewStaff({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                position: "",
                department: "",
                schedule: [],
                status: "active",
            });

            // Close dialog
            setIsDialogOpen(false);

            // Refresh staff list
            fetchStaff(organization.id);
        } catch (error) {
            console.error("Error adding staff member:", error);
            toast({
                title: "Error",
                description: "Failed to add staff member. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteStaff = async (staffId: string) => {
        if (!organization) return;

        try {
            setIsLoading(true);

            await firebaseServices.deleteStaffMember(organization.id, staffId);

            toast({
                title: "Success",
                description: "Staff member has been deleted successfully.",
            });

            // Refresh staff list
            fetchStaff(organization.id);
        } catch (error) {
            console.error("Error deleting staff member:", error);
            toast({
                title: "Error",
                description: "Failed to delete staff member. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
                <div className="text-red-500 mb-4">
                    <AlertCircle className="h-16 w-16 mx-auto mb-2" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Error Loading Staff</h2>
                <p className="text-muted-foreground mb-6 text-center">{error}</p>
                <Button onClick={() => organization && fetchStaff(organization.id)}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
                    <p className="text-muted-foreground">
                        Manage staff members and their roles
                    </p>
                </div>
                <ProtectedPage module="staff" action="create" fallback={
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Staff Member
                    </Button>
                }>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Staff Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                            <DialogHeader>
                                <DialogTitle>Add New Staff Member</DialogTitle>
                                <DialogDescription>
                                    Enter the details of the new staff member below.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                value={newStaff.firstName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                value={newStaff.lastName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={newStaff.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={newStaff.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="position">Position</Label>
                                        <Select
                                            value={newStaff.position}
                                            onValueChange={handleRoleChange}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a position" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {staffRoles.map((role) => (
                                                    <SelectItem key={role} value={role}>
                                                        {role}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Select
                                            value={newStaff.department}
                                            onValueChange={handleDepartmentChange}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Administration">Administration</SelectItem>
                                                <SelectItem value="Teaching">Teaching</SelectItem>
                                                <SelectItem value="Support">Support</SelectItem>
                                                <SelectItem value="Special Education">Special Education</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Work Schedule</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {weekdays.map((day) => (
                                                <Button
                                                    key={day}
                                                    type="button"
                                                    variant={newStaff.schedule.includes(day) ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleScheduleChange(day)}
                                                >
                                                    {day}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Adding..." : "Add Staff Member"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </ProtectedPage>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Staff Management</CardTitle>
                    <CardDescription>
                        View and manage all staff members in your preschool
                    </CardDescription>
                    <div className="mt-4 relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search staff..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredStaff.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <AlertCircle className="h-8 w-8 mb-2" />
                                                <p>No staff members found</p>
                                                {searchTerm && (
                                                    <p className="text-sm">Try adjusting your search criteria</p>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStaff.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div className="font-medium">{member.firstName} {member.lastName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {Array.isArray(member.schedule)
                                                        ? member.schedule.join(", ")
                                                        : typeof member.schedule === 'object'
                                                            ? Object.keys(member.schedule || {}).filter(day => member.schedule[day]).join(", ")
                                                            : "No schedule set"}
                                                </div>
                                            </TableCell>
                                            <TableCell>{member.position}</TableCell>
                                            <TableCell>{member.department}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center text-sm">
                                                        <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                                        {member.email}
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <Phone className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                                        {member.phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <ProtectedPage module="staff" action="edit" fallback={
                                                        <Button variant="ghost" size="icon" disabled>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    }>
                                                        <Button variant="ghost" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </ProtectedPage>
                                                    <ProtectedPage module="staff" action="delete" fallback={
                                                        <Button variant="ghost" size="icon" disabled>
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    }>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete {member.firstName} {member.lastName}? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteStaff(member.id)}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </ProtectedPage>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 
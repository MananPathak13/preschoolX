"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { ProtectedPage } from "@/components/protected-page";
import { usePermissions } from "@/lib/permissions-context";

// Mock data for students
const mockStudents = [
    {
        id: "1",
        name: "Emma Johnson",
        age: 4,
        parentName: "Sarah Johnson",
        parentEmail: "sarah.johnson@example.com",
        allergies: "Peanuts",
        enrollmentDate: "2023-01-15",
    },
    {
        id: "2",
        name: "Noah Williams",
        age: 3,
        parentName: "Michael Williams",
        parentEmail: "michael.williams@example.com",
        allergies: "None",
        enrollmentDate: "2023-02-10",
    },
    {
        id: "3",
        name: "Olivia Brown",
        age: 5,
        parentName: "Jessica Brown",
        parentEmail: "jessica.brown@example.com",
        allergies: "Dairy",
        enrollmentDate: "2022-09-05",
    },
    {
        id: "4",
        name: "Liam Davis",
        age: 4,
        parentName: "David Davis",
        parentEmail: "david.davis@example.com",
        allergies: "None",
        enrollmentDate: "2023-03-20",
    },
    {
        id: "5",
        name: "Ava Miller",
        age: 3,
        parentName: "Jennifer Miller",
        parentEmail: "jennifer.miller@example.com",
        allergies: "Eggs",
        enrollmentDate: "2023-01-05",
    },
];

export default function StudentsPage() {
    const [students, setStudents] = useState(mockStudents);
    const [searchTerm, setSearchTerm] = useState("");
    const { hasPermission } = usePermissions();

    // Filter students based on search term
    const filteredStudents = students.filter(
        (student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.parentEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Function to add a new student
    const handleAddStudent = (newStudent: any) => {
        setStudents([
            ...students,
            { ...newStudent, id: (students.length + 1).toString() },
        ]);
    };

    // Function to delete a student
    const handleDeleteStudent = (id: string) => {
        setStudents(students.filter((student) => student.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Students</h1>
                    <p className="text-muted-foreground">
                        Manage student information and enrollment
                    </p>
                </div>

                {/* Only show Add Student button if user has create permission */}
                <ProtectedPage module="students" action="create" fallback={null}>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Student</DialogTitle>
                            </DialogHeader>
                            <AddStudentForm onAddStudent={handleAddStudent} />
                        </DialogContent>
                    </Dialog>
                </ProtectedPage>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search students..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Parent</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Allergies</TableHead>
                            <TableHead>Enrollment Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell>{student.age}</TableCell>
                                <TableCell>{student.parentName}</TableCell>
                                <TableCell>{student.parentEmail}</TableCell>
                                <TableCell>{student.allergies}</TableCell>
                                <TableCell>{student.enrollmentDate}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* Only show Edit button if user has edit permission */}
                                        {hasPermission("students", "edit") && (
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}

                                        {/* Only show Delete button if user has delete permission */}
                                        {hasPermission("students", "delete") && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteStudent(student.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

// Form component for adding a new student
function AddStudentForm({ onAddStudent }: { onAddStudent: (student: any) => void }) {
    const [newStudent, setNewStudent] = useState({
        name: "",
        age: "",
        parentName: "",
        parentEmail: "",
        allergies: "",
        enrollmentDate: new Date().toISOString().split("T")[0],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewStudent({ ...newStudent, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddStudent({
            ...newStudent,
            age: parseInt(newStudent.age),
        });
        // Reset form
        setNewStudent({
            name: "",
            age: "",
            parentName: "",
            parentEmail: "",
            allergies: "",
            enrollmentDate: new Date().toISOString().split("T")[0],
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Student Name</Label>
                    <Input
                        id="name"
                        name="name"
                        value={newStudent.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                        id="age"
                        name="age"
                        type="number"
                        min="1"
                        max="6"
                        value={newStudent.age}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="parentName">Parent Name</Label>
                    <Input
                        id="parentName"
                        name="parentName"
                        value={newStudent.parentName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="parentEmail">Parent Email</Label>
                    <Input
                        id="parentEmail"
                        name="parentEmail"
                        type="email"
                        value={newStudent.parentEmail}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                        id="allergies"
                        name="allergies"
                        value={newStudent.allergies}
                        onChange={handleChange}
                        placeholder="List any allergies or type 'None'"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                    <Input
                        id="enrollmentDate"
                        name="enrollmentDate"
                        type="date"
                        value={newStudent.enrollmentDate}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Add Student</Button>
            </DialogFooter>
        </form>
    );
} 
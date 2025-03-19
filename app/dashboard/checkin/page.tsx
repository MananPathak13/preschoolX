"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Search, UserCheck, UserX, Info } from "lucide-react";
import { collection, query, where, getDocs, doc, updateDoc, addDoc, Timestamp, orderBy, limit, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import firebaseServices from "@/lib/firebase-services";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Student {
    id: string;
    fullName: string;
    status: string;
    ageGroup: string;
    checkedIn: boolean;
    lastCheckIn?: {
        date: {
            toDate: () => Date;
        };
        time: string;
        by?: string;
    };
    lastCheckOut?: {
        date: {
            toDate: () => Date;
        };
        time: string;
        by?: string;
    };
    attendanceId?: string;
    notes?: string;
}

export default function CheckInPage() {
    const { user, organization } = useAuth();
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [checkOutNotes, setCheckOutNotes] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isCheckOutDialogOpen, setIsCheckOutDialogOpen] = useState(false);

    useEffect(() => {
        if (!organization) return;

        const fetchStudents = async () => {
            try {
                setLoading(true);
                const studentsRef = collection(db, `organizations/${organization.id}/students`);
                const q = query(studentsRef, where("status", "==", "active"), orderBy("fullName"));
                const querySnapshot = await getDocs(q);

                const studentsData: Student[] = [];

                for (const docSnapshot of querySnapshot.docs) {
                    const studentData = docSnapshot.data();

                    // Get today's date in YYYY-MM-DD format for the attendance record
                    const today = new Date();
                    const dateString = format(today, "yyyy-MM-dd");

                    // Check if there's an attendance record for today
                    const attendanceDocRef = doc(db, `organizations/${organization.id}/students/${docSnapshot.id}/attendance/${dateString}`);
                    const attendanceDoc = await getDoc(attendanceDocRef);

                    let checkedIn = false;
                    let lastCheckIn = undefined;
                    let lastCheckOut = undefined;
                    let notes = "";

                    if (attendanceDoc.exists()) {
                        const attendanceData = attendanceDoc.data();
                        checkedIn = attendanceData.checkOut ? false : true;
                        notes = attendanceData.notes || "";

                        if (attendanceData.checkIn) {
                            lastCheckIn = {
                                date: attendanceData.date,
                                time: attendanceData.checkIn,
                                by: attendanceData.checkInBy || "Unknown"
                            };
                        }

                        if (attendanceData.checkOut) {
                            lastCheckOut = {
                                date: attendanceData.date,
                                time: attendanceData.checkOut,
                                by: attendanceData.checkOutBy || "Unknown"
                            };
                        }
                    }

                    studentsData.push({
                        id: docSnapshot.id,
                        fullName: studentData.fullName,
                        status: studentData.status,
                        ageGroup: studentData.ageGroup,
                        checkedIn,
                        lastCheckIn,
                        lastCheckOut,
                        attendanceId: dateString,
                        notes
                    });
                }

                setStudents(studentsData);
                setFilteredStudents(studentsData);
            } catch (error) {
                console.error("Error fetching students:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch students. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [organization, toast]);

    useEffect(() => {
        // Filter students based on search query and active tab
        let filtered = students;

        if (searchQuery) {
            filtered = filtered.filter(student =>
                student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (activeTab === "checked-in") {
            filtered = filtered.filter(student => student.checkedIn);
        } else if (activeTab === "checked-out") {
            filtered = filtered.filter(student => !student.checkedIn);
        }

        setFilteredStudents(filtered);
    }, [searchQuery, students, activeTab]);

    const handleCheckIn = async (studentId: string) => {
        if (!organization || !user) return;

        try {
            const now = new Date();
            const currentTime = format(now, "HH:mm");
            const userName = user.displayName || user.email || "Unknown";

            // Record attendance using the service
            await firebaseServices.recordAttendance(organization.id, studentId, {
                date: now,
                checkIn: currentTime,
                checkInBy: userName,
                checkOut: null,
                notes: ""
            });

            toast({
                title: "Success",
                description: "Student checked in successfully.",
            });

            // Update the student's checked-in status in the UI
            setStudents(prev =>
                prev.map(student =>
                    student.id === studentId
                        ? {
                            ...student,
                            checkedIn: true,
                            lastCheckIn: {
                                date: Timestamp.fromDate(now),
                                time: currentTime,
                                by: userName
                            }
                        }
                        : student
                )
            );
        } catch (error) {
            console.error("Error checking in student:", error);
            toast({
                title: "Error",
                description: "Failed to check in student. Please try again.",
                variant: "destructive",
            });
        }
    };

    const openCheckOutDialog = (student: Student) => {
        setSelectedStudent(student);
        setCheckOutNotes(student.notes || "");
        setIsCheckOutDialogOpen(true);
    };

    const handleCheckOut = async () => {
        if (!organization || !user || !selectedStudent) return;

        try {
            const now = new Date();
            const currentTime = format(now, "HH:mm");
            const userName = user.displayName || user.email || "Unknown";

            // Record attendance with checkout time
            await firebaseServices.recordAttendance(organization.id, selectedStudent.id, {
                date: now,
                checkIn: selectedStudent.lastCheckIn?.time || format(now, "HH:mm"),
                checkInBy: selectedStudent.lastCheckIn?.by || userName,
                checkOut: currentTime,
                checkOutBy: userName,
                notes: checkOutNotes
            });

            toast({
                title: "Success",
                description: "Student checked out successfully.",
            });

            // Update the student's checked-in status in the UI
            setStudents(prev =>
                prev.map(student =>
                    student.id === selectedStudent.id
                        ? {
                            ...student,
                            checkedIn: false,
                            notes: checkOutNotes,
                            lastCheckOut: {
                                date: Timestamp.fromDate(now),
                                time: currentTime,
                                by: userName
                            }
                        }
                        : student
                )
            );

            // Close the dialog
            setIsCheckOutDialogOpen(false);
            setSelectedStudent(null);
            setCheckOutNotes("");
        } catch (error) {
            console.error("Error checking out student:", error);
            toast({
                title: "Error",
                description: "Failed to check out student. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Student Check-in/Check-out</h1>

            <div className="mb-6">
                <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
            </div>

            <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All Students</TabsTrigger>
                    <TabsTrigger value="checked-in">Checked In</TabsTrigger>
                    <TabsTrigger value="checked-out">Checked Out</TabsTrigger>
                </TabsList>
            </Tabs>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : filteredStudents.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">No students found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => (
                        <Card key={student.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle>{student.fullName}</CardTitle>
                                    <Badge variant={student.checkedIn ? "default" : "outline"}>
                                        {student.checkedIn ? "Present" : "Absent"}
                                    </Badge>
                                </div>
                                <CardDescription>{student.ageGroup}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {student.lastCheckIn && (
                                        <div className="flex items-center text-sm">
                                            <Clock className="h-4 w-4 mr-2 text-green-500" />
                                            <span>
                                                Checked in: {format(student.lastCheckIn.date.toDate(), "MMM d")} at {student.lastCheckIn.time}
                                                {student.lastCheckIn.by && <span className="text-xs text-muted-foreground ml-1">by {student.lastCheckIn.by}</span>}
                                            </span>
                                        </div>
                                    )}
                                    {student.lastCheckOut && (
                                        <div className="flex items-center text-sm">
                                            <Clock className="h-4 w-4 mr-2 text-red-500" />
                                            <span>
                                                Checked out: {format(student.lastCheckOut.date.toDate(), "MMM d")} at {student.lastCheckOut.time}
                                                {student.lastCheckOut.by && <span className="text-xs text-muted-foreground ml-1">by {student.lastCheckOut.by}</span>}
                                            </span>
                                        </div>
                                    )}
                                    {student.notes && (
                                        <div className="flex items-start text-sm mt-2">
                                            <Info className="h-4 w-4 mr-2 text-blue-500 mt-0.5" />
                                            <span className="text-muted-foreground">{student.notes}</span>
                                        </div>
                                    )}
                                    <div className="pt-2">
                                        {student.checkedIn ? (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => openCheckOutDialog(student)}
                                            >
                                                <UserX className="h-4 w-4 mr-2" />
                                                Check Out
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleCheckIn(student.id)}
                                            >
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                Check In
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Check Out Dialog */}
            <Dialog open={isCheckOutDialogOpen} onOpenChange={setIsCheckOutDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Check Out Student</DialogTitle>
                        <DialogDescription>
                            Add any notes about the student's day before checking them out.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Student: {selectedStudent?.fullName}</h3>
                            <Textarea
                                placeholder="Add notes about the student's day (optional)"
                                value={checkOutNotes}
                                onChange={(e) => setCheckOutNotes(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCheckOutDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCheckOut}>
                            Check Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 
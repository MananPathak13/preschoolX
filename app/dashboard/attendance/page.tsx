"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ProtectedPage } from "@/components/protected-page";
import { useAuth } from "@/lib/auth-context";
import firebaseServices from "@/lib/firebase-services";
import { Search, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

// Main component wrapper with permission check
export default function AttendancePageWrapper() {
  return (
    <ProtectedPage module="attendance" action="view">
      <AttendancePage />
    </ProtectedPage>
  );
}

function AttendancePage() {
  const { toast } = useToast();
  const { user, organization } = useAuth();

  // State variables
  const [date, setDate] = useState<Date>(new Date());
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
  const [stats, setStats] = useState({
    presentCount: 0,
    absentCount: 0,
    tardyCount: 0,
    excusedCount: 0,
    attendanceRate: 0,
  });

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [attendanceTime, setAttendanceTime] = useState("");
  const [attendanceNotes, setAttendanceNotes] = useState("");
  const [dialogMode, setDialogMode] = useState<"signIn" | "signOut" | "absent">("signIn");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [absentReason, setAbsentReason] = useState("");

  const formattedDate = format(date, "yyyy-MM-dd");

  useEffect(() => {
    if (organization?.id) {
      fetchStudents();
      fetchAttendance();
    }
  }, [date, organization?.id, selectedClass, selectedAgeGroup]);

  useEffect(() => {
    if (students.length > 0) {
      const filtered = students.filter(
        (student) =>
          student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.ageGroup.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [students, searchTerm]);

  useEffect(() => {
    calculateStats();
  }, [attendance]);

  const fetchStudents = async () => {
    if (!organization?.id) return;

    setIsLoading(true);
    try {
      const filters: any = {};
      if (selectedClass !== "all") {
        filters.classId = selectedClass;
      }
      if (selectedAgeGroup !== "all") {
        filters.ageGroup = selectedAgeGroup;
      }

      const studentsData = await firebaseServices.getStudents(organization.id, filters);
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
      setIsLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (!organization?.id) return;

    setIsLoading(true);
    try {
      const attendanceData = await firebaseServices.getAttendance(
        organization.id,
        formattedDate,
        selectedClass
      );

      setAttendance(attendanceData?.students || {});
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const counts = {
      present: 0,
      absent: 0,
      tardy: 0,
      excused: 0,
    };

    Object.values(attendance).forEach((record: any) => {
      if (record.status) {
        counts[record.status as keyof typeof counts]++;
      }
    });

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const rate = total > 0 ? Math.round((counts.present / total) * 100) : 0;

    setStats({
      presentCount: counts.present,
      absentCount: counts.absent,
      tardyCount: counts.tardy,
      excusedCount: counts.excused,
      attendanceRate: rate,
    });
  };

  const openAttendanceDialog = (student: any, mode: "signIn" | "signOut" | "absent") => {
    setSelectedStudent(student);
    setDialogMode(mode);

    // Set default time to current time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setAttendanceTime(`${hours}:${minutes}`);

    // Get existing notes if any
    setAttendanceNotes(attendance[student.id]?.notes || "");

    // Reset absent reason
    setAbsentReason("");

    setIsDialogOpen(true);
  };

  const handleAttendanceSubmit = () => {
    if (!selectedStudent) return;

    const studentId = selectedStudent.id;
    const currentRecord = attendance[studentId] || {};

    const updatedRecord = {
      ...currentRecord,
      status: dialogMode === "signIn" ? "present" : dialogMode === "absent" ? "absent" : currentRecord.status,
      timestamp: new Date().toISOString(),
      recordedBy: user?.uid || "unknown",
    };

    // Add notes based on dialog mode
    if (dialogMode === "absent") {
      updatedRecord.notes = absentReason;
    } else {
      updatedRecord.notes = attendanceNotes;
    }

    // Add sign-in or sign-out time based on dialog mode
    if (dialogMode === "signIn") {
      updatedRecord.signInTime = attendanceTime;
    } else if (dialogMode === "signOut") {
      updatedRecord.signOutTime = attendanceTime;
    }

    setAttendance((prev) => ({
      ...prev,
      [studentId]: updatedRecord,
    }));

    setIsDialogOpen(false);

    toast({
      title: "Success",
      description: dialogMode === "signIn"
        ? "Student signed in successfully."
        : dialogMode === "signOut"
          ? "Student signed out successfully."
          : "Student marked as absent.",
    });
  };

  const saveAttendance = async () => {
    if (!organization?.id) return;

    setIsSaving(true);
    try {
      await firebaseServices.saveAttendance(
        organization.id,
        formattedDate,
        selectedClass,
        { students: attendance }
      );

      toast({
        title: "Success",
        description: "Attendance saved successfully.",
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getAttendanceStatusColor = (status: string | null) => {
    switch (status) {
      case 'present': return 'bg-green-50 border-green-500';
      case 'absent': return 'bg-red-50 border-red-500';
      case 'tardy': return 'bg-yellow-50 border-yellow-500';
      case 'excused': return 'bg-blue-50 border-blue-500';
      default: return 'bg-white border-gray-200';
    }
  };

  const getAttendanceStatusBadge = (status: string | null) => {
    switch (status) {
      case 'present': return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'absent': return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case 'tardy': return <Badge className="bg-yellow-100 text-yellow-800">Tardy</Badge>;
      case 'excused': return <Badge className="bg-blue-100 text-blue-800">Excused</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Take and manage daily attendance
          </p>
        </div>
        <Button onClick={saveAttendance} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Attendance"}
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Date Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Label>Select Date</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, "MMMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => {
                        if (date) {
                          setDate(date);
                          setIsCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="class1">Class A</SelectItem>
                    <SelectItem value="class2">Class B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Age Group</Label>
                <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="toddler">Toddler (2-3)</SelectItem>
                    <SelectItem value="preschool">Preschool (3-4)</SelectItem>
                    <SelectItem value="prek">Pre-K (4-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Present
                  </span>
                  <Badge variant="outline" className="bg-green-50">{stats.presentCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    Absent
                  </span>
                  <Badge variant="outline" className="bg-red-50">{stats.absentCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                    Tardy
                  </span>
                  <Badge variant="outline" className="bg-yellow-50">{stats.tardyCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />
                    Excused
                  </span>
                  <Badge variant="outline" className="bg-blue-50">{stats.excusedCount}</Badge>
                </div>

                <div className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Attendance Rate</span>
                    <span className="font-semibold">{stats.attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${stats.attendanceRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          <Card>
            <CardHeader>
              <CardTitle>Student Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No students found</p>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search criteria" : "No students available for the selected filters"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredStudents.map((student) => {
                    const currentRecord = attendance[student.id] || {};
                    const currentStatus = currentRecord.status || null;
                    const signInTime = currentRecord.signInTime;
                    const signOutTime = currentRecord.signOutTime;

                    return (
                      <Card
                        key={student.id}
                        className={`overflow-hidden border-l-4 ${getAttendanceStatusColor(currentStatus)}`}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium">{student.firstName} {student.lastName}</h3>
                              <p className="text-sm text-muted-foreground">{student.ageGroup}</p>
                            </div>
                            {getAttendanceStatusBadge(currentStatus)}
                          </div>

                          {/* Time information */}
                          {(signInTime || signOutTime) && (
                            <div className="mb-3 text-sm">
                              {signInTime && (
                                <div className="flex items-center text-green-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>Sign in: {signInTime}</span>
                                </div>
                              )}
                              {signOutTime && (
                                <div className="flex items-center text-red-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>Sign out: {signOutTime}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Notes */}
                          {currentRecord.notes && (
                            <div className="mb-3 text-sm">
                              <p className="text-muted-foreground italic">
                                "{currentRecord.notes}"
                              </p>
                            </div>
                          )}

                          {/* Simplified attendance buttons */}
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              variant="outline"
                              className={`${currentStatus === 'present' ? 'bg-green-100 border-green-500' : ''} hover:bg-green-50`}
                              onClick={() => openAttendanceDialog(student, "signIn")}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                              Sign In
                            </Button>

                            <Button
                              variant="outline"
                              className={`${currentStatus === 'absent' ? 'bg-red-100 border-red-500' : ''} hover:bg-red-50`}
                              onClick={() => openAttendanceDialog(student, "absent")}
                            >
                              <XCircle className="h-4 w-4 text-red-600 mr-1" />
                              Absent
                            </Button>

                            <Button
                              variant="outline"
                              className="hover:bg-blue-50"
                              onClick={() => openAttendanceDialog(student, "signOut")}
                              disabled={!signInTime || currentStatus === "absent"}
                            >
                              <Clock className="h-4 w-4 text-blue-600 mr-1" />
                              Sign Out
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attendance Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "signIn"
                ? "Sign In"
                : dialogMode === "signOut"
                  ? "Sign Out"
                  : "Mark Absent"}: {selectedStudent?.firstName} {selectedStudent?.lastName}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "signIn"
                ? "Record arrival time and any notes"
                : dialogMode === "signOut"
                  ? "Record departure time and any notes"
                  : "Record reason for absence"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {dialogMode !== "absent" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={attendanceTime}
                    onChange={(e) => setAttendanceTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Add any notes about the student"
                    value={attendanceNotes}
                    onChange={(e) => setAttendanceNotes(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="absentReason">Reason for Absence</Label>
                <Textarea
                  id="absentReason"
                  placeholder="Please provide a reason for the absence"
                  value={absentReason}
                  onChange={(e) => setAbsentReason(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAttendanceSubmit}>
              {dialogMode === "signIn"
                ? "Sign In"
                : dialogMode === "signOut"
                  ? "Sign Out"
                  : "Mark Absent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
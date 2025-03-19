"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format, subDays } from "date-fns";
import { ProtectedPage } from "@/components/protected-page";
import { useAuth } from "@/lib/auth-context";
import firebaseServices from "@/lib/firebase-services";
import { Calendar as CalendarIcon, Download, FileText, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

// Main component wrapper with permission check
export default function AttendanceReportsPageWrapper() {
    return (
        <ProtectedPage module="attendance" action="view">
            <AttendanceReportsPage />
        </ProtectedPage>
    );
}

function AttendanceReportsPage() {
    const { toast } = useToast();
    const { organization } = useAuth();

    // State variables
    const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [selectedClass, setSelectedClass] = useState("all");
    const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isStartDateOpen, setIsStartDateOpen] = useState(false);
    const [isEndDateOpen, setIsEndDateOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("daily");
    const [selectAll, setSelectAll] = useState(false);

    // Format dates for display and API calls
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");

    // Fetch students when component mounts or when organization ID changes
    useEffect(() => {
        if (organization?.id) {
            fetchStudents();
        }
    }, [organization?.id]);

    // Fetch students when filters change
    useEffect(() => {
        if (organization?.id && (selectedClass !== "all" || selectedAgeGroup !== "all")) {
            fetchStudents();
        }
    }, [selectedClass, selectedAgeGroup]);

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

            // Reset selected students when filters change
            setSelectedStudents([]);
            setSelectAll(false);
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

    const handleSelectAllChange = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedStudents(students.map(student => student.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleStudentSelection = (studentId: string, checked: boolean) => {
        if (checked) {
            setSelectedStudents(prev => [...prev, studentId]);
        } else {
            setSelectedStudents(prev => prev.filter(id => id !== studentId));
        }
    };

    const generateReport = async () => {
        if (!organization?.id) return;
        if (selectedStudents.length === 0) {
            toast({
                title: "No Students Selected",
                description: "Please select at least one student to generate a report.",
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);
        try {
            // Fetch attendance data for the date range
            const reportData: any[] = [];

            // For daily report, fetch each day's attendance
            if (activeTab === "daily") {
                // This is a simplified implementation - in a real app, you'd want to batch these requests
                // or create a specific API endpoint for reports
                const currentDate = new Date(startDate);
                const endDateObj = new Date(endDate);

                while (currentDate <= endDateObj) {
                    const dateStr = format(currentDate, "yyyy-MM-dd");
                    const attendanceData = await firebaseServices.getAttendance(
                        organization.id,
                        dateStr,
                        selectedClass
                    );

                    if (attendanceData?.students) {
                        // Filter for selected students only
                        const filteredData = Object.entries(attendanceData.students)
                            .filter(([studentId]) => selectedStudents.includes(studentId))
                            .map(([studentId, record]: [string, any]) => {
                                const student = students.find(s => s.id === studentId);
                                return {
                                    date: dateStr,
                                    studentId,
                                    studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown",
                                    status: record.status || "unknown",
                                    signInTime: record.signInTime || "",
                                    signOutTime: record.signOutTime || "",
                                    notes: record.notes || "",
                                    recordedBy: record.recordedBy || "",
                                };
                            });

                        reportData.push(...filteredData);
                    }

                    // Move to next day
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            } else if (activeTab === "summary") {
                // For summary report, aggregate data by student
                const studentSummaries: Record<string, any> = {};

                // Initialize summaries for each selected student
                selectedStudents.forEach(studentId => {
                    const student = students.find(s => s.id === studentId);
                    studentSummaries[studentId] = {
                        studentId,
                        studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown",
                        totalDays: 0,
                        presentDays: 0,
                        absentDays: 0,
                        tardyDays: 0,
                        excusedDays: 0,
                        attendanceRate: 0,
                        avgSignInTime: "",
                        avgSignOutTime: "",
                    };
                });

                // Fetch attendance for each day in the range
                const currentDate = new Date(startDate);
                const endDateObj = new Date(endDate);
                let totalDays = 0;

                while (currentDate <= endDateObj) {
                    totalDays++;
                    const dateStr = format(currentDate, "yyyy-MM-dd");
                    const attendanceData = await firebaseServices.getAttendance(
                        organization.id,
                        dateStr,
                        selectedClass
                    );

                    if (attendanceData?.students) {
                        // Process each selected student's attendance
                        selectedStudents.forEach(studentId => {
                            const record = attendanceData.students[studentId];
                            if (record) {
                                const summary = studentSummaries[studentId];

                                // Count status
                                if (record.status) {
                                    summary.totalDays++;
                                    if (record.status === "present") summary.presentDays++;
                                    else if (record.status === "absent") summary.absentDays++;
                                    else if (record.status === "tardy") summary.tardyDays++;
                                    else if (record.status === "excused") summary.excusedDays++;
                                }

                                // Track sign-in/out times for averaging later
                                if (record.signInTime) {
                                    if (!summary.signInTimes) summary.signInTimes = [];
                                    summary.signInTimes.push(record.signInTime);
                                }

                                if (record.signOutTime) {
                                    if (!summary.signOutTimes) summary.signOutTimes = [];
                                    summary.signOutTimes.push(record.signOutTime);
                                }
                            }
                        });
                    }

                    // Move to next day
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // Calculate final statistics for each student
                Object.values(studentSummaries).forEach((summary: any) => {
                    // Calculate attendance rate
                    summary.attendanceRate = summary.totalDays > 0
                        ? Math.round((summary.presentDays / summary.totalDays) * 100)
                        : 0;

                    // Calculate average times (simplified)
                    if (summary.signInTimes && summary.signInTimes.length > 0) {
                        // This is a simplified average - in reality you'd want to properly average the times
                        summary.avgSignInTime = summary.signInTimes[Math.floor(summary.signInTimes.length / 2)];
                    }

                    if (summary.signOutTimes && summary.signOutTimes.length > 0) {
                        summary.avgSignOutTime = summary.signOutTimes[Math.floor(summary.signOutTimes.length / 2)];
                    }

                    // Clean up temporary arrays
                    delete summary.signInTimes;
                    delete summary.signOutTimes;
                });

                reportData.push(...Object.values(studentSummaries));
            }

            setReportData(reportData);

            toast({
                title: "Report Generated",
                description: `Successfully generated ${activeTab} attendance report.`,
            });
        } catch (error) {
            console.error("Error generating report:", error);
            toast({
                title: "Error",
                description: "Failed to generate report. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadReport = () => {
        if (reportData.length === 0) {
            toast({
                title: "No Data",
                description: "Please generate a report first.",
                variant: "destructive",
            });
            return;
        }

        // Create CSV content
        let csvContent = "";

        if (activeTab === "daily") {
            // Headers for daily report
            csvContent = "Date,Student,Status,Sign In,Sign Out,Notes\n";

            // Add data rows
            reportData.forEach(record => {
                csvContent += `${record.date},${record.studentName},${record.status},${record.signInTime},${record.signOutTime},"${record.notes}"\n`;
            });
        } else {
            // Headers for summary report
            csvContent = "Student,Total Days,Present,Absent,Tardy,Excused,Attendance Rate,Avg Sign In,Avg Sign Out\n";

            // Add data rows
            reportData.forEach(record => {
                csvContent += `${record.studentName},${record.totalDays},${record.presentDays},${record.absentDays},${record.tardyDays},${record.excusedDays},${record.attendanceRate}%,${record.avgSignInTime},${record.avgSignOutTime}\n`;
            });
        }

        // Create download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `attendance_${activeTab}_report_${formattedStartDate}_to_${formattedEndDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
                    <p className="text-muted-foreground">
                        Generate and download attendance reports
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left Sidebar */}
                <div className="col-span-12 md:col-span-4 lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="daily">Daily</TabsTrigger>
                                    <TabsTrigger value="summary">Summary</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {format(startDate, "MMMM d, yyyy")}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setStartDate(date);
                                                    setIsStartDateOpen(false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {format(endDate, "MMMM d, yyyy")}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setEndDate(date);
                                                    setIsEndDateOpen(false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Select value={selectedClass} onValueChange={(value) => {
                                    setSelectedClass(value);
                                    fetchStudents();
                                }}>
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
                                <Select value={selectedAgeGroup} onValueChange={(value) => {
                                    setSelectedAgeGroup(value);
                                    fetchStudents();
                                }}>
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

                            <div className="pt-4 space-y-2">
                                <Button
                                    onClick={generateReport}
                                    disabled={isGenerating || selectedStudents.length === 0}
                                    className="w-full"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Generate Report
                                        </>
                                    )}
                                </Button>

                                {reportData.length > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={downloadReport}
                                        className="w-full"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download CSV
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="col-span-12 md:col-span-8 lg:col-span-9">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium">No students found</p>
                                    <p className="text-muted-foreground">
                                        Try adjusting your class or age group filters
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="selectAll"
                                            checked={selectAll}
                                            onCheckedChange={handleSelectAllChange}
                                        />
                                        <Label htmlFor="selectAll">Select All</Label>
                                    </div>

                                    <div className="border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12"></TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Age Group</TableHead>
                                                    <TableHead>Class</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {students.map((student) => (
                                                    <TableRow key={student.id}>
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedStudents.includes(student.id)}
                                                                onCheckedChange={(checked) =>
                                                                    handleStudentSelection(student.id, checked === true)
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                                                        <TableCell>{student.ageGroup}</TableCell>
                                                        <TableCell>{student.classId || "Not Assigned"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {reportData.length > 0 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>
                                    {activeTab === "daily" ? "Daily Attendance Report" : "Attendance Summary Report"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-md overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {activeTab === "daily" ? (
                                                    <>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Student</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Sign In</TableHead>
                                                        <TableHead>Sign Out</TableHead>
                                                        <TableHead>Notes</TableHead>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableHead>Student</TableHead>
                                                        <TableHead>Total Days</TableHead>
                                                        <TableHead>Present</TableHead>
                                                        <TableHead>Absent</TableHead>
                                                        <TableHead>Tardy</TableHead>
                                                        <TableHead>Excused</TableHead>
                                                        <TableHead>Rate</TableHead>
                                                        <TableHead>Avg Sign In</TableHead>
                                                        <TableHead>Avg Sign Out</TableHead>
                                                    </>
                                                )}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reportData.map((record, index) => (
                                                <TableRow key={index}>
                                                    {activeTab === "daily" ? (
                                                        <>
                                                            <TableCell>{record.date}</TableCell>
                                                            <TableCell>{record.studentName}</TableCell>
                                                            <TableCell>{record.status}</TableCell>
                                                            <TableCell>{record.signInTime}</TableCell>
                                                            <TableCell>{record.signOutTime}</TableCell>
                                                            <TableCell>{record.notes}</TableCell>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TableCell>{record.studentName}</TableCell>
                                                            <TableCell>{record.totalDays}</TableCell>
                                                            <TableCell>{record.presentDays}</TableCell>
                                                            <TableCell>{record.absentDays}</TableCell>
                                                            <TableCell>{record.tardyDays}</TableCell>
                                                            <TableCell>{record.excusedDays}</TableCell>
                                                            <TableCell>{record.attendanceRate}%</TableCell>
                                                            <TableCell>{record.avgSignInTime}</TableCell>
                                                            <TableCell>{record.avgSignOutTime}</TableCell>
                                                        </>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 
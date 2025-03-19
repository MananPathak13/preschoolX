"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
    FileText,
    Download,
    Users,
    CalendarCheck,
    DollarSign,
    BookOpen,
    ClipboardList,
    Printer,
    Mail
} from "lucide-react";

export default function ReportsPage() {
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [reportFormat, setReportFormat] = useState("pdf");

    const reportTypes = [
        {
            id: "attendance",
            title: "Attendance Report",
            description: "Daily, weekly, or monthly attendance records",
            icon: CalendarCheck,
            color: "text-blue-500 bg-blue-50",
        },
        {
            id: "student",
            title: "Student Report",
            description: "Enrollment, demographics, and student progress",
            icon: Users,
            color: "text-violet-500 bg-violet-50",
        },
        {
            id: "financial",
            title: "Financial Report",
            description: "Revenue, expenses, and payment history",
            icon: DollarSign,
            color: "text-green-500 bg-green-50",
        },
        {
            id: "staff",
            title: "Staff Report",
            description: "Staff schedules, performance, and certifications",
            icon: ClipboardList,
            color: "text-amber-500 bg-amber-50",
        },
        {
            id: "curriculum",
            title: "Curriculum Report",
            description: "Lesson plans, activities, and learning outcomes",
            icon: BookOpen,
            color: "text-pink-500 bg-pink-50",
        },
    ];

    const handleGenerateReport = (reportType: string) => {
        // This would connect to your backend to generate the report
        console.log(`Generating ${reportType} report from ${startDate} to ${endDate} in ${reportFormat} format`);
        // Show success message or download the report
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Reports</h1>
                <p className="text-muted-foreground">
                    Generate and download reports for your preschool
                </p>
            </div>

            <Tabs defaultValue="generate" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="generate">Generate Reports</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
                    <TabsTrigger value="saved">Saved Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report Parameters</CardTitle>
                            <CardDescription>
                                Select the date range and format for your report
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Date</label>
                                    <DatePicker date={startDate} setDate={setStartDate} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Date</label>
                                    <DatePicker date={endDate} setDate={setEndDate} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Format</label>
                                    <Select defaultValue={reportFormat} onValueChange={setReportFormat}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF Document</SelectItem>
                                            <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                                            <SelectItem value="csv">CSV File</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reportTypes.map((report) => (
                            <Card key={report.id} className="overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-md ${report.color}`}>
                                            <report.icon className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-lg">{report.title}</CardTitle>
                                    </div>
                                    <CardDescription>{report.description}</CardDescription>
                                </CardHeader>
                                <CardFooter className="pt-2 flex justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleGenerateReport(report.id)}
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Preview
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleGenerateReport(report.id)}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Generate
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="scheduled" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Scheduled Reports</CardTitle>
                            <CardDescription>
                                Set up automatic report generation and delivery
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-md border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="font-medium">Weekly Attendance Summary</h3>
                                    <p className="text-sm text-muted-foreground">Sent every Friday at 4:00 PM</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Mail className="h-4 w-4 mr-2" />
                                        Email
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </Button>
                                    <Button variant="destructive" size="sm">
                                        Cancel
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-md border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="font-medium">Monthly Financial Report</h3>
                                    <p className="text-sm text-muted-foreground">Sent on the 1st of every month</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Mail className="h-4 w-4 mr-2" />
                                        Email
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </Button>
                                    <Button variant="destructive" size="sm">
                                        Cancel
                                    </Button>
                                </div>
                            </div>

                            <Button className="w-full md:w-auto">
                                Schedule New Report
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="saved" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Saved Reports</CardTitle>
                            <CardDescription>
                                Access your previously generated reports
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-md border">
                                <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="font-medium">Attendance Report - October 2023</h3>
                                        <p className="text-sm text-muted-foreground">Generated on Oct 31, 2023</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            <FileText className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="font-medium">Student Enrollment - Fall 2023</h3>
                                        <p className="text-sm text-muted-foreground">Generated on Sep 15, 2023</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            <FileText className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="font-medium">Financial Summary - Q3 2023</h3>
                                        <p className="text-sm text-muted-foreground">Generated on Oct 5, 2023</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            <FileText className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
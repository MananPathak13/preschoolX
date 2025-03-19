"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    BarChart,
    LineChart,
    PieChart,
    TrendingUp,
    Users,
    CalendarCheck,
    DollarSign,
    Download,
    RefreshCw
} from "lucide-react";

// Simple Bar Chart Component
const BarChartComponent = ({ data }: { data: { name: string; value: number }[] }) => {
    const maxValue = Math.max(...data.map(item => item.value));

    return (
        <div className="w-full h-64 flex items-end justify-between gap-2 mt-6">
            {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                    <div
                        className="w-12 bg-primary rounded-t-md transition-all duration-300 hover:opacity-80"
                        style={{
                            height: `${(item.value / maxValue) * 100}%`,
                            backgroundColor: `hsl(215, ${50 + index * 10}%, ${40 + index * 5}%)`
                        }}
                    />
                    <div className="text-xs mt-2">{item.name}</div>
                    <div className="text-xs font-medium">{item.value}%</div>
                </div>
            ))}
        </div>
    );
};

// Simple Line Chart Component
const LineChartComponent = ({ data }: { data: { name: string; value: number }[] }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    const points = data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (item.value / maxValue) * 100;
        return { x, y, ...item };
    });

    // Create the SVG path
    const pathData = points.reduce((path, point, index) => {
        const command = index === 0 ? "M" : "L";
        return path + `${command} ${point.x} ${point.y} `;
    }, "");

    return (
        <div className="w-full h-64 mt-6">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Grid lines */}
                <line x1="0" y1="0" x2="0" y2="100" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />

                {/* Line path */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="hsl(215, 70%, 50%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points */}
                {points.map((point, index) => (
                    <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r="2"
                        fill="white"
                        stroke="hsl(215, 70%, 50%)"
                        strokeWidth="2"
                    />
                ))}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2">
                {data.map((item, index) => (
                    <div key={index} className="text-xs text-center">{item.name}</div>
                ))}
            </div>
        </div>
    );
};

// Simple Pie Chart Component
const PieChartComponent = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
        <div className="flex flex-col items-center justify-center mt-6">
            <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const startAngle = cumulativePercentage * 3.6; // 3.6 = 360 / 100
                        cumulativePercentage += percentage;
                        const endAngle = cumulativePercentage * 3.6;

                        const x1 = 50 + 50 * Math.cos((startAngle - 90) * (Math.PI / 180));
                        const y1 = 50 + 50 * Math.sin((startAngle - 90) * (Math.PI / 180));
                        const x2 = 50 + 50 * Math.cos((endAngle - 90) * (Math.PI / 180));
                        const y2 = 50 + 50 * Math.sin((endAngle - 90) * (Math.PI / 180));

                        const largeArcFlag = percentage > 50 ? 1 : 0;

                        const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                        return (
                            <path
                                key={index}
                                d={pathData}
                                fill={item.color}
                                stroke="#fff"
                                strokeWidth="0.5"
                                className="hover:opacity-80 transition-opacity duration-300"
                            />
                        );
                    })}
                </svg>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                        />
                        <div className="text-xs">
                            <div>{item.name}</div>
                            <div className="font-medium">{item.value}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState("week");

    // Mock data for charts
    const mockData = {
        attendanceData: [
            { name: "Mon", value: 85 },
            { name: "Tue", value: 90 },
            { name: "Wed", value: 88 },
            { name: "Thu", value: 92 },
            { name: "Fri", value: 78 },
        ],
        enrollmentData: [
            { name: "Toddlers", value: 15, color: "#4f46e5" },
            { name: "Pre-K", value: 25, color: "#0ea5e9" },
            { name: "Kindergarten", value: 20, color: "#10b981" },
        ],
        revenueData: [
            { name: "Jan", value: 12000 },
            { name: "Feb", value: 14000 },
            { name: "Mar", value: 13500 },
            { name: "Apr", value: 15000 },
            { name: "May", value: 16500 },
            { name: "Jun", value: 18000 },
        ],
        keyMetrics: {
            totalStudents: 60,
            averageAttendance: 88,
            staffUtilization: 92,
            revenue: 18000,
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">
                        Track key metrics and performance indicators
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-2">
                    <Select defaultValue={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-blue-500 absolute top-4 right-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{mockData.keyMetrics.totalStudents}</div>
                        <p className="text-xs text-blue-600">
                            +2.5% from last {timeRange}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-green-500 absolute top-4 right-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{mockData.keyMetrics.averageAttendance}%</div>
                        <p className="text-xs text-green-600">
                            +1.2% from last {timeRange}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Staff Utilization</CardTitle>
                        <Users className="h-4 w-4 text-purple-500 absolute top-4 right-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-700">{mockData.keyMetrics.staffUtilization}%</div>
                        <p className="text-xs text-purple-600">
                            +0.8% from last {timeRange}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-500 absolute top-4 right-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700">${mockData.keyMetrics.revenue}</div>
                        <p className="text-xs text-amber-600">
                            +5.3% from last {timeRange}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Weekly Attendance</CardTitle>
                                <CardDescription>
                                    Daily attendance rates for the current week
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <BarChartComponent data={mockData.attendanceData} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Enrollment by Class</CardTitle>
                                <CardDescription>
                                    Distribution of students across classes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PieChartComponent data={mockData.enrollmentData} />
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                            <CardDescription>
                                Monthly revenue for the current year
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LineChartComponent data={mockData.revenueData} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Analytics</CardTitle>
                            <CardDescription>
                                Detailed attendance metrics and trends
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center">
                            <div className="text-center">
                                <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Detailed attendance analytics coming soon
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="enrollment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollment Analytics</CardTitle>
                            <CardDescription>
                                Detailed enrollment metrics and trends
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center">
                            <div className="text-center">
                                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Detailed enrollment analytics coming soon
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Analytics</CardTitle>
                            <CardDescription>
                                Detailed financial metrics and trends
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center">
                            <div className="text-center">
                                <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Detailed financial analytics coming soon
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
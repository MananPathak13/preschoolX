"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  CalendarCheck,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Clock,
  Calendar as CalendarIcon,
  Bell,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  CalendarDays,
  GraduationCap,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePermissions } from "@/lib/permissions-context";
import firebaseServices from "@/lib/firebase-services";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";

// Add these interfaces at the top of the file, after the imports

interface TeacherData {
  myClasses: any[];
  todayAttendance: {
    present: number;
    absent: number;
    total: number;
  };
  upcomingLessons: any[];
}

interface ParentData {
  children: any[];
  attendance: any[];
  upcomingEvents: any[];
}

interface DashboardData {
  stats: {
    totalStudents: number;
    activeStudents: number;
    waitlistStudents: number;
    totalStaff: number;
    totalClasses: number;
    attendanceRate: number;
  };
  teacherData: TeacherData;
  parentData: ParentData;
}

// Simple Bar Chart Component
const BarChart = ({ data }: { data: { name: string; value: number }[] }) => {
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

// Simple Pie Chart Component
const PieChart = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
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

export default function DashboardPage() {
  const { user, organization } = useAuth();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    waitlistStudents: 0,
    totalStaff: 0,
    totalClasses: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    // Simulate loading stats
    const loadStats = async () => {
      if (!organization) return;

      try {
        // In a real app, you would fetch these from your Firebase services
        // For now, we'll just simulate some data
        setTimeout(() => {
          setStats({
            totalStudents: 45,
            activeStudents: 38,
            waitlistStudents: 7,
            totalStaff: 12,
            totalClasses: 6,
            attendanceRate: 92
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
        setLoading(false);
      }
    };

    loadStats();
  }, [organization]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Students Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {loading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <>
                      <span className="text-green-500 font-medium">{stats.activeStudents} active</span> · {stats.waitlistStudents} waitlisted
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Staff Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Staff Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{stats.totalStaff}</div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {loading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <>
                      Including teachers and administrative staff
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Classes Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="flex items-center">
                    <CalendarDays className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{stats.totalClasses}</div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {loading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <>
                      Across all age groups
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Attendance Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Attendance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="flex items-center">
                    <ClipboardList className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {loading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <>
                      Last 30 days average
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Frequently used pages</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Link
                  href="/dashboard/students"
                  className="flex items-center p-3 rounded-md hover:bg-muted transition-colors"
                >
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                  <span>Students</span>
                </Link>
                <Link
                  href="/dashboard/staff"
                  className="flex items-center p-3 rounded-md hover:bg-muted transition-colors"
                >
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <span>Staff</span>
                </Link>
                <Link
                  href="/dashboard/classes"
                  className="flex items-center p-3 rounded-md hover:bg-muted transition-colors"
                >
                  <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                  <span>Classes</span>
                </Link>
                <Link
                  href="/dashboard/attendance"
                  className="flex items-center p-3 rounded-md hover:bg-muted transition-colors"
                >
                  <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                  <span>Attendance</span>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates in your organization</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">New student enrolled:</span> Emma Johnson
                      </div>
                      <div className="text-muted-foreground">2 hours ago</div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">Attendance updated:</span> Toddlers Class
                      </div>
                      <div className="text-muted-foreground">Yesterday</div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">New staff member:</span> Michael Brown
                      </div>
                      <div className="text-muted-foreground">2 days ago</div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">Class schedule updated:</span> Preschool Class
                      </div>
                      <div className="text-muted-foreground">3 days ago</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Overview</CardTitle>
              <CardDescription>Detailed student statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Student details will be displayed here.</p>
              <div className="mt-4">
                <Link
                  href="/dashboard/students"
                  className="text-primary hover:underline"
                >
                  View all students →
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff Overview</CardTitle>
              <CardDescription>Detailed staff statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Staff details will be displayed here.</p>
              <div className="mt-4">
                <Link
                  href="/dashboard/staff"
                  className="text-primary hover:underline"
                >
                  View all staff →
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
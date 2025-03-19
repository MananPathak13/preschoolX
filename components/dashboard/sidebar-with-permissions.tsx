"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { usePermissions } from "@/lib/permissions-context";
import {
    LayoutDashboard,
    Users,
    UserRound,
    BookOpen,
    MessageSquare,
    CalendarCheck,
    BarChart3,
    FileText,
    CreditCard,
    Settings,
    ShieldCheck,
    HelpCircle,
    Menu,
    LogOut,
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { hasPermission } = usePermissions();

    // Define all possible routes
    const allRoutes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            module: "dashboard",
        },
        {
            label: "Students",
            icon: Users,
            href: "/dashboard/students",
            module: "students",
        },
        {
            label: "Staff",
            icon: UserRound,
            href: "/dashboard/staff",
            module: "staff",
        },
        {
            label: "Curriculum",
            icon: BookOpen,
            href: "/dashboard/curriculum",
            module: "curriculum",
        },
        {
            label: "Messages",
            icon: MessageSquare,
            href: "/dashboard/messages",
            module: "messages",
        },
        {
            label: "Attendance",
            icon: CalendarCheck,
            href: "/dashboard/attendance",
            module: "attendance",
        },
        {
            label: "Reports",
            icon: FileText,
            href: "/dashboard/reports",
            module: "reports",
        },
        {
            label: "Analytics",
            icon: BarChart3,
            href: "/dashboard/analytics",
            module: "analytics",
        },
        {
            label: "Billing",
            icon: CreditCard,
            href: "/dashboard/billing",
            module: "billing",
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/dashboard/settings",
            module: "settings",
        },
        {
            label: "Permissions",
            icon: ShieldCheck,
            href: "/dashboard/permissions",
            module: "permissions",
        },
        {
            label: "Help & Support",
            icon: HelpCircle,
            href: "/dashboard/help",
            module: "help",
        },
    ];

    // Filter routes based on user permissions
    const filteredRoutes = allRoutes.filter(route =>
        hasPermission(route.module, "view")
    );

    return (
        <div className={className}>
            {/* Mobile Sidebar */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold">PreschoolPro</h2>
                    </div>
                    <SidebarContent
                        routes={filteredRoutes}
                        pathname={pathname}
                        setOpen={setOpen}
                    />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-col md:h-screen border-r">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold">PreschoolPro</h2>
                </div>
                <SidebarContent
                    routes={filteredRoutes}
                    pathname={pathname}
                />
            </div>
        </div>
    );
}

interface SidebarContentProps {
    routes: {
        label: string;
        icon: any;
        href: string;
        module: string;
    }[];
    pathname: string;
    setOpen?: (open: boolean) => void;
}

function SidebarContent({ routes, pathname, setOpen }: SidebarContentProps) {
    const { user, signOut } = useAuth();
    const { userRole } = usePermissions();

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const getInitial = () => {
        if (!user?.email) return "U";
        return user.email.charAt(0).toUpperCase();
    };

    return (
        <ScrollArea className="flex-1">
            <div className="px-3 py-2">
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={() => setOpen?.(false)}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                pathname === route.href ? "bg-accent text-accent-foreground" : "transparent"
                            )}
                        >
                            <route.icon className="h-5 w-5" />
                            {route.label}
                        </Link>
                    ))}
                </div>
            </div>
            <div className="mt-auto p-4 border-t">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        {getInitial()}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{user?.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{userRole || "User"}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </ScrollArea>
    );
} 
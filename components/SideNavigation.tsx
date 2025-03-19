"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { usePermissions, PermissionAction } from "@/lib/permissions-context";
import { useState, useEffect } from "react";

// Icons
import {
    School,
    LayoutDashboard,
    Users,
    GraduationCap,
    CalendarDays,
    ClipboardList,
    Settings,
    Shield,
    UserPlus,
    Clock,
    Utensils,
    FileText,
    Menu,
    BookOpen,
    MessageSquare,
    BarChart,
    HelpCircle,
    LogOut,
    ShieldCheck,
    CreditCard,
    UserRound,
    CalendarCheck
} from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> { }

// Define navigation item type
interface NavigationItem {
    label: string;
    href: string;
    icon: React.ElementType;
    module: string;
    action: PermissionAction;
    color?: string;
}

// Define all navigation items
const allNavigationItems: NavigationItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        module: "dashboard",
        action: "view",
        color: "text-sky-500"
    },
    {
        label: "Students",
        href: "/dashboard/students",
        icon: GraduationCap,
        module: "students",
        action: "view",
        color: "text-violet-500"
    },
    {
        label: "Staff",
        href: "/dashboard/staff",
        icon: Users,
        module: "staff",
        action: "view",
        color: "text-orange-500"
    },
    {
        label: "Programs/Classes",
        href: "/dashboard/programs",
        icon: School,
        module: "classes",
        action: "view",
        color: "text-emerald-500"
    },
    {
        label: "Staff Schedule",
        href: "/dashboard/staff/schedule",
        icon: CalendarDays,
        module: "staff",
        action: "view",
        color: "text-blue-600"
    },
    {
        label: "Guardians",
        href: "/dashboard/guardians",
        icon: UserPlus,
        module: "guardians",
        action: "view",
        color: "text-indigo-500"
    },
    {
        label: "Curriculum",
        href: "/dashboard/curriculum",
        icon: BookOpen,
        module: "curriculum",
        action: "view",
        color: "text-emerald-500"
    },
    {
        label: "Messages",
        href: "/dashboard/messages",
        icon: MessageSquare,
        module: "messages",
        action: "view",
        color: "text-blue-500"
    },
    {
        label: "Attendance",
        href: "/dashboard/attendance",
        icon: CalendarCheck,
        module: "attendance",
        action: "view",
        color: "text-pink-500"
    },
    {
        label: "Reports",
        href: "/dashboard/reports",
        icon: FileText,
        module: "reports",
        action: "view",
        color: "text-amber-500"
    },
    {
        label: "Meal Tracking",
        href: "/dashboard/meals",
        icon: Utensils,
        module: "meals",
        action: "view",
        color: "text-green-600"
    },
    {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart,
        module: "analytics",
        action: "view",
        color: "text-green-500"
    },
    {
        label: "Billing",
        href: "/dashboard/billing",
        icon: CreditCard,
        module: "billing",
        action: "view",
        color: "text-purple-500"
    },
    {
        label: "Permissions",
        href: "/dashboard/permissions",
        icon: ShieldCheck,
        module: "permissions",
        action: "view",
        color: "text-red-500"
    },
    {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        module: "settings",
        action: "view",
        color: "text-gray-500"
    },
    {
        label: "Help & Support",
        href: "/dashboard/help",
        icon: HelpCircle,
        module: "help",
        action: "view",
        color: "text-indigo-500"
    }
];

export function SideNavigation({ className, ...props }: SidebarNavProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { user, organization } = useAuth();
    const { userRole, isAdmin, hasPermission, loading: permissionsLoading } = usePermissions();
    const [visibleItems, setVisibleItems] = useState<NavigationItem[]>([]);

    // Filter navigation items based on user permissions
    useEffect(() => {
        if (permissionsLoading) return;

        // If user is admin, show all items
        if (isAdmin) {
            setVisibleItems(allNavigationItems);
            return;
        }

        // Otherwise, filter based on permissions
        const filtered = allNavigationItems.filter(item => {
            // Dashboard is always visible
            if (item.module === "dashboard") return true;

            // Help is always visible
            if (item.module === "help") return true;

            // Check if user has permission for this item
            return hasPermission(item.module, item.action);
        });

        setVisibleItems(filtered);
    }, [isAdmin, hasPermission, permissionsLoading]);

    // Show loading state while permissions data is loading
    if (permissionsLoading || !user) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild className="md:hidden">
                    <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                    <SidebarContent routes={visibleItems} pathname={pathname} setOpen={setOpen} />
                </SheetContent>
            </Sheet>

            <aside className={cn("hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30", className)} {...props}>
                <SidebarContent routes={visibleItems} pathname={pathname} />
            </aside>
        </>
    );
}

interface SidebarContentProps {
    routes: NavigationItem[];
    pathname: string;
    setOpen?: (open: boolean) => void;
}

function SidebarContent({ routes, pathname, setOpen }: SidebarContentProps) {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { userRole, isAdmin } = usePermissions();

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Get first letter of name or email for avatar
    const getInitial = () => {
        if (user?.displayName) {
            return user.displayName.charAt(0).toUpperCase();
        } else if (user?.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return "U";
    };

    return (
        <div className="bg-card border-r border-border h-full flex flex-col">
            <div className="p-6 flex items-center">
                <School className="h-8 w-8 text-secondary mr-2" />
                <span className="text-xl font-bold">PreschoolPro</span>
            </div>
            <ScrollArea className="flex-1 px-3">
                <div className="space-y-1 py-2">
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
                            <route.icon className={cn("h-5 w-5", route.color)} />
                            {route.label}
                        </Link>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 rounded-md px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        {getInitial()}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{user?.displayName || user?.email || 'User'}</p>
                        <p className="text-xs text-muted-foreground">
                            {userRole && `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`}
                            {isAdmin && " - Admin"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full mt-2 text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center justify-start"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </Button>
            </div>
        </div>
    );
} 
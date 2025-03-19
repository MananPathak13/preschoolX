"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  School, 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  MessageSquare, 
  Settings, 
  Menu, 
  BookOpen,
  FileText,
  HelpCircle
} from "lucide-react";
import { useState } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ParentSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/parent-portal",
      color: "text-sky-500",
    },
    {
      label: "My Children",
      icon: Users,
      href: "/parent-portal/children",
      color: "text-violet-500",
    },
    {
      label: "Attendance",
      icon: CalendarCheck,
      href: "/parent-portal/attendance",
      color: "text-pink-500",
    },
    {
      label: "Curriculum",
      icon: BookOpen,
      href: "/parent-portal/curriculum",
      color: "text-emerald-500",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      href: "/parent-portal/messages",
      color: "text-blue-500",
    },
    {
      label: "Documents",
      icon: FileText,
      href: "/parent-portal/documents",
      color: "text-amber-500",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/parent-portal/settings",
      color: "text-gray-500",
    },
    {
      label: "Help & Support",
      icon: HelpCircle,
      href: "/parent-portal/help",
      color: "text-indigo-500",
    },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent routes={routes} pathname={pathname} setOpen={setOpen} />
        </SheetContent>
      </Sheet>

      <aside className={cn("hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30", className)}>
        <SidebarContent routes={routes} pathname={pathname} />
      </aside>
    </>
  );
}

interface SidebarContentProps {
  routes: {
    label: string;
    icon: any;
    href: string;
    color?: string;
  }[];
  pathname: string;
  setOpen?: (open: boolean) => void;
}

function SidebarContent({ routes, pathname, setOpen }: SidebarContentProps) {
  return (
    <div className="bg-card border-r border-border h-full flex flex-col">
      <div className="p-6 flex items-center">
        <School className="h-8 w-8 text-secondary mr-2" />
        <span className="text-xl font-bold">Parent Portal</span>
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
            P
          </div>
          <div>
            <p className="text-sm font-medium">Parent User</p>
            <p className="text-xs text-muted-foreground">parent@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
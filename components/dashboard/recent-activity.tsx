"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const activities = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
      role: "Teacher"
    },
    action: "marked attendance",
    target: "Toddlers class",
    time: "2 hours ago"
  },
  {
    id: 2,
    user: {
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
      role: "Admin"
    },
    action: "added a new student",
    target: "Emma Wilson",
    time: "3 hours ago"
  },
  {
    id: 3,
    user: {
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
      role: "Teacher"
    },
    action: "updated the curriculum for",
    target: "Pre-K class",
    time: "Yesterday"
  },
  {
    id: 4,
    user: {
      name: "David Kim",
      avatar: "",
      role: "Parent"
    },
    action: "submitted a leave request for",
    target: "Sophia Kim",
    time: "Yesterday"
  },
  {
    id: 5,
    user: {
      name: "Lisa Wang",
      avatar: "",
      role: "Admin"
    },
    action: "generated monthly report for",
    target: "May 2025",
    time: "2 days ago"
  }
];

export function RecentActivityList() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              <span className="text-muted-foreground">({activity.user.role})</span>{" "}
              {activity.action}{" "}
              <span className="font-medium">{activity.target}</span>
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
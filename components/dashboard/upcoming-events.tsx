"use client";

import { CalendarIcon, Users, BookOpen, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const events = [
  {
    id: 1,
    title: "Staff Meeting",
    date: "May 15, 2025",
    time: "10:00 AM",
    type: "meeting",
    icon: Users
  },
  {
    id: 2,
    title: "Parent-Teacher Conference",
    date: "May 20, 2025",
    time: "2:00 PM - 5:00 PM",
    type: "conference",
    icon: BookOpen
  },
  {
    id: 3,
    title: "End of Year Celebration",
    date: "June 10, 2025",
    time: "1:00 PM",
    type: "event",
    icon: Bell
  }
];

export function UpcomingEvents() {
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center">
              <div className={`p-3 ${getEventColor(event.type)}`}>
                <event.icon className="h-5 w-5 text-white" />
              </div>
              <div className="p-3 flex-1">
                <p className="font-medium text-sm">{event.title}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {event.date} • {event.time}
                </div>
              </div>
              <div className="pr-3">
                <Badge variant="outline" className={getEventBadgeColor(event.type)}>
                  {getEventTypeName(event.type)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getEventColor(type: string): string {
  switch (type) {
    case "meeting":
      return "bg-blue-500";
    case "conference":
      return "bg-purple-500";
    case "event":
      return "bg-pink-500";
    default:
      return "bg-gray-500";
  }
}

function getEventBadgeColor(type: string): string {
  switch (type) {
    case "meeting":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300";
    case "conference":
      return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300";
    case "event":
      return "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300";
    default:
      return "";
  }
}

function getEventTypeName(type: string): string {
  switch (type) {
    case "meeting":
      return "Meeting";
    case "conference":
      return "Conference";
    case "event":
      return "Event";
    default:
      return type;
  }
}
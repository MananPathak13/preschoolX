"use client";

import { CalendarIcon, Users, BookOpen, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const events = [
  {
    id: 1,
    title: "Parent-Teacher Conference",
    date: "May 20, 2025",
    time: "2:00 PM",
    type: "conference",
    icon: Users
  },
  {
    id: 2,
    title: "End of Year Celebration",
    date: "June 10, 2025",
    time: "1:00 PM",
    type: "event",
    icon: Bell
  },
  {
    id: 3,
    title: "Summer Program Registration",
    date: "June 15, 2025",
    time: "All Day",
    type: "deadline",
    icon: BookOpen
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
    case "conference":
      return "bg-purple-500";
    case "event":
      return "bg-pink-500";
    case "deadline":
      return "bg-amber-500";
    default:
      return "bg-gray-500";
  }
}

function getEventBadgeColor(type: string): string {
  switch (type) {
    case "conference":
      return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300";
    case "event":
      return "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300";
    case "deadline":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300";
    default:
      return "";
  }
}

function getEventTypeName(type: string): string {
  switch (type) {
    case "conference":
      return "Conference";
    case "event":
      return "Event";
    case "deadline":
      return "Deadline";
    default:
      return type;
  }
}
"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ChildProgressProps {
  childId: string;
}

export function ChildProgress({ childId }: ChildProgressProps) {
  // This would normally fetch data from Firebase based on the childId
  // For now, we'll use mock data
  const progressData = {
    academic: 75,
    social: 85,
    physical: 90,
    language: 80,
    skills: [
      { name: "Counting to 20", status: "mastered" },
      { name: "Recognizing Letters", status: "in-progress" },
      { name: "Basic Shapes", status: "mastered" },
      { name: "Sharing with Others", status: "in-progress" },
      { name: "Following Instructions", status: "needs-work" },
    ]
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Academic Development</span>
          <span className="text-sm font-medium">{progressData.academic}%</span>
        </div>
        <Progress value={progressData.academic} className="h-2" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Social Development</span>
          <span className="text-sm font-medium">{progressData.social}%</span>
        </div>
        <Progress value={progressData.social} className="h-2" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Physical Development</span>
          <span className="text-sm font-medium">{progressData.physical}%</span>
        </div>
        <Progress value={progressData.physical} className="h-2" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Language Development</span>
          <span className="text-sm font-medium">{progressData.language}%</span>
        </div>
        <Progress value={progressData.language} className="h-2" />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Key Skills</h3>
        <div className="space-y-2">
          {progressData.skills.map((skill, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{skill.name}</span>
              <Badge variant="outline" className={getSkillBadgeColor(skill.status)}>
                {getSkillStatusLabel(skill.status)}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getSkillBadgeColor(status: string): string {
  switch (status) {
    case "mastered":
      return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300";
    case "in-progress":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300";
    case "needs-work":
      return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300";
    default:
      return "";
  }
}

function getSkillStatusLabel(status: string): string {
  switch (status) {
    case "mastered":
      return "Mastered";
    case "in-progress":
      return "In Progress";
    case "needs-work":
      return "Needs Work";
    default:
      return status;
  }
}
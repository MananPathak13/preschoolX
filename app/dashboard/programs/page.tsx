"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddClassDialog } from "@/components/classes/add-class-dialog";
import { AddProgramDialog } from "@/components/programs/add-program-dialog";
import { ProgramsList } from "@/components/programs/programs-list";
import { ClassesList } from "@/components/classes/classes-list";
import { useAuth } from "@/lib/auth-context";
import { Loader2, School2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ProgramsPage() {
    const [activeTab, setActiveTab] = useState("programs");
    const [showInactive, setShowInactive] = useState(false);
    const { organization } = useAuth();

    if (!organization) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Programs & Classes</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your educational programs and class offerings
                    </p>
                </div>
                <div className="flex gap-2">
                    {activeTab === "classes" ? (
                        <AddClassDialog />
                    ) : (
                        <AddProgramDialog />
                    )}
                </div>
            </div>

            <Tabs defaultValue="programs" className="space-y-6" onValueChange={setActiveTab}>
                <div className="flex justify-between items-center">
                    <TabsList className="grid w-[400px] grid-cols-2">
                        <TabsTrigger value="programs" className="flex items-center gap-2">
                            <School2 className="h-4 w-4" />
                            Programs
                        </TabsTrigger>
                        <TabsTrigger value="classes" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Classes
                        </TabsTrigger>
                    </TabsList>
                    <Button
                        variant="outline"
                        onClick={() => setShowInactive(!showInactive)}
                        className="flex items-center gap-2"
                    >
                        {showInactive ? "Show Active Only" : "Show All"}
                        {!showInactive && (
                            <Badge variant="secondary" className="ml-2">
                                Active
                            </Badge>
                        )}
                    </Button>
                </div>

                <TabsContent value="programs" className="space-y-4">
                    <div className="grid grid-cols-1 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Educational Programs</CardTitle>
                                <CardDescription>
                                    View and manage your educational program offerings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProgramsList
                                    statusFilter={showInactive ? undefined : "active"}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="classes" className="space-y-4">
                    <div className="grid grid-cols-1 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Class Sections</CardTitle>
                                <CardDescription>
                                    View and manage your class sections and room assignments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ClassesList
                                    statusFilter={showInactive ? undefined : "active"}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
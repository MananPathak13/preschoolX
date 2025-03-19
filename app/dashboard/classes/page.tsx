"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePermissions } from "@/lib/permissions-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassList } from "@/components/classes/class-list";
import { AddClassDialog } from "@/components/classes/add-class-dialog";
import { useToast } from "@/components/ui/use-toast";

export default function ClassesPage() {
    const [isAddClassOpen, setIsAddClassOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("active");
    const { organization } = useAuth();
    const { hasPermission } = usePermissions();
    const { toast } = useToast();

    const canCreateClass = hasPermission("classes", "create");

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
                    <p className="text-muted-foreground">
                        Manage your organization's classes and student assignments
                    </p>
                </div>
                {canCreateClass && (
                    <Button onClick={() => setIsAddClassOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Class
                    </Button>
                )}
            </div>

            <Card className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="active">Active Classes</TabsTrigger>
                        <TabsTrigger value="inactive">Inactive Classes</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active" className="mt-4">
                        <ClassList status="active" />
                    </TabsContent>
                    <TabsContent value="inactive" className="mt-4">
                        <ClassList status="inactive" />
                    </TabsContent>
                </Tabs>
            </Card>

            <AddClassDialog
                open={isAddClassOpen}
                onOpenChange={setIsAddClassOpen}
                onSuccess={() => {
                    setIsAddClassOpen(false);
                    toast({
                        title: "Class created",
                        description: "The class has been created successfully.",
                    });
                }}
            />
        </div>
    );
} 
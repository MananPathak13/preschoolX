"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePermissions } from "@/lib/permissions-context";
import firebaseServices from "@/lib/firebase-services";
import Link from "next/link";

interface Class {
    id: string;
    name: string;
    description: string | null;
    capacity: number;
    age_group: string;
    organization_id: string;
    teacher_id: string | null;
    room_number: string | null;
    status: 'active' | 'inactive';
    students?: any[];
    teacher?: {
        id: string;
        first_name: string;
        last_name: string;
    };
}

interface ClassListProps {
    status: "active" | "inactive";
}

export function ClassList({ status }: ClassListProps) {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const { organization } = useAuth();
    const { hasPermission } = usePermissions();

    useEffect(() => {
        if (!organization?.id) return;

        const fetchClasses = async () => {
            try {
                const classesData = await firebaseServices.getClasses(organization.id, status);
                setClasses(classesData);
            } catch (error) {
                console.error("Error fetching classes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [organization?.id, status]);

    const handleStatusChange = async (classId: string, newStatus: "active" | "inactive") => {
        try {
            await firebaseServices.updateClassStatus(classId, newStatus);
            setClasses(classes.filter(c => c.id !== classId));
        } catch (error) {
            console.error("Error updating class status:", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {classes.map((classItem) => (
                    <TableRow key={classItem.id}>
                        <TableCell className="font-medium">
                            <Link
                                href={`/dashboard/classes/${classItem.id}`}
                                className="hover:underline"
                            >
                                {classItem.name}
                            </Link>
                        </TableCell>
                        <TableCell>{classItem.age_group}</TableCell>
                        <TableCell>{classItem.room_number || "N/A"}</TableCell>
                        <TableCell>
                            {classItem.teacher
                                ? `${classItem.teacher.first_name} ${classItem.teacher.last_name}`
                                : "Unassigned"}
                        </TableCell>
                        <TableCell>{classItem.capacity}</TableCell>
                        <TableCell>
                            <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                {classItem.students?.length || 0}
                            </div>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleStatusChange(
                                                classItem.id,
                                                status === "active" ? "inactive" : "active"
                                            )
                                        }
                                    >
                                        {status === "active"
                                            ? "Mark as Inactive"
                                            : "Mark as Active"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
} 
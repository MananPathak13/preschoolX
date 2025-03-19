'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { Loader2, Mail, Phone, Search, User } from 'lucide-react';
import Link from 'next/link';

interface Guardian {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    students: {
        id: string;
        name: string;
        status: string;
        relationship: string;
    }[];
    isActive: boolean;
}

export default function GuardiansPage() {
    const { organization } = useAuth();
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusMessage, setStatusMessage] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    useEffect(() => {
        const fetchGuardians = async () => {
            if (!organization) return;

            try {
                setLoading(true);

                // Get all members with role "parent"
                const membersRef = collection(db, `organizations/${organization.id}/members`);
                const q = query(membersRef, where('role', '==', 'parent'));
                const querySnapshot = await getDocs(q);

                const guardiansData: Guardian[] = [];
                const guardianPromises = querySnapshot.docs.map(async (docSnapshot) => {
                    const data = docSnapshot.data();

                    // Get students associated with this guardian
                    const studentsRef = collection(db, `organizations/${organization.id}/students`);
                    const studentsSnapshot = await getDocs(studentsRef);

                    const studentPromises = studentsSnapshot.docs.map(async (studentDoc) => {
                        const studentData = studentDoc.data();

                        // Check if this guardian is associated with this student
                        const guardiansRef = collection(db, `organizations/${organization.id}/students/${studentDoc.id}/guardians`);
                        const guardiansSnapshot = await getDocs(guardiansRef);

                        const guardianDocs = guardiansSnapshot.docs.filter(g => g.data().userId === docSnapshot.id);

                        if (guardianDocs.length > 0) {
                            return {
                                id: studentDoc.id,
                                name: studentData.fullName || 'Unknown',
                                status: studentData.status || 'unknown',
                                relationship: guardianDocs[0].data().relationship || 'Guardian'
                            };
                        }

                        return null;
                    });

                    const students = (await Promise.all(studentPromises)).filter(Boolean) as {
                        id: string;
                        name: string;
                        status: string;
                        relationship: string;
                    }[];

                    // A guardian is active if they have at least one active student
                    const isActive = students.some(student => student.status === 'active');

                    guardiansData.push({
                        id: docSnapshot.id,
                        email: data.email || '',
                        fullName: data.fullName || data.email || 'Unknown',
                        phone: data.phone || '',
                        students,
                        isActive
                    });
                });

                await Promise.all(guardianPromises);

                setGuardians(guardiansData);
            } catch (error) {
                console.error('Error fetching guardians:', error);
                setStatusMessage({
                    type: 'error',
                    message: 'Failed to load guardians'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchGuardians();
    }, [organization]);

    // Filter guardians based on search term
    const filteredGuardians = guardians.filter(guardian => {
        const matchesGuardian =
            guardian.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guardian.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guardian.phone?.toLowerCase().includes(searchTerm.toLowerCase());

        // Also check if any of their students match the search term
        const matchesStudent = guardian.students.some(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return matchesGuardian || matchesStudent;
    });

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Guardians</h1>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search guardians or students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-[300px]"
                        />
                    </div>
                </div>
            </div>

            {statusMessage && (
                <div className={`mb-4 p-4 rounded-md ${statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                    {statusMessage.message}
                </div>
            )}

            <Tabs defaultValue="all" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="all">All Guardians</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                    {renderGuardiansList(filteredGuardians, loading)}
                </TabsContent>

                <TabsContent value="active" className="space-y-6">
                    {renderGuardiansList(filteredGuardians.filter(g => g.isActive), loading)}
                </TabsContent>

                <TabsContent value="inactive" className="space-y-6">
                    {renderGuardiansList(filteredGuardians.filter(g => !g.isActive), loading)}
                </TabsContent>
            </Tabs>
        </div>
    );

    function renderGuardiansList(guardians: Guardian[], isLoading: boolean) {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (guardians.length === 0) {
            return (
                <div className="text-center py-12">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No guardians found</h3>
                    <p className="text-muted-foreground">
                        {searchTerm ? 'Try a different search term' : 'There are no guardians in this category'}
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guardians.map((guardian) => (
                    <Card key={guardian.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{guardian.fullName}</CardTitle>
                                    <CardDescription>{guardian.email}</CardDescription>
                                </div>
                                <Badge variant={guardian.isActive ? 'default' : 'secondary'}>
                                    {guardian.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {guardian.phone && (
                                    <div className="flex items-center text-sm">
                                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>{guardian.phone}</span>
                                    </div>
                                )}

                                <div className="flex items-center text-sm">
                                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>{guardian.email}</span>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Students:</h4>
                                    {guardian.students.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No students associated</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {guardian.students.map((student) => (
                                                <li key={student.id} className="flex justify-between items-center text-sm">
                                                    <div>
                                                        <Link
                                                            href={`/dashboard/students/${student.id}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {student.name}
                                                        </Link>
                                                        <div className="text-xs text-muted-foreground">
                                                            {student.relationship}
                                                        </div>
                                                    </div>
                                                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                                        {student.status}
                                                    </Badge>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <Button variant="outline" size="sm" asChild className="w-full">
                                        <Link href={`/dashboard/guardians/${guardian.id}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }
} 
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storageServices, type UploadedFile } from '@/lib/storage-services';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { FileIcon, TrashIcon, DownloadIcon } from 'lucide-react';

interface StudentDocumentsProps {
    orgId: string;
    studentId: string;
}

export function StudentDocuments({ orgId, studentId }: StudentDocumentsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [documents, setDocuments] = useState<UploadedFile[]>([]);
    const [isStorageConfigured, setIsStorageConfigured] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        checkStorageConfig();
    }, [orgId]);

    const checkStorageConfig = async () => {
        try {
            const configured = await storageServices.isStorageConfigured(orgId);
            setIsStorageConfigured(configured);
            if (configured) {
                loadDocuments();
            }
        } catch (error) {
            console.error('Error checking storage config:', error);
        }
    };

    const loadDocuments = async () => {
        try {
            const docs = await storageServices.getStudentDocuments(orgId, studentId);
            setDocuments(docs);
        } catch (error) {
            console.error('Error loading documents:', error);
            toast({
                title: 'Error loading documents',
                description: 'Failed to load student documents.',
                variant: 'destructive'
            });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const documentType = file.name.split('.').pop()?.toLowerCase() || 'document';
            const uploadedFile = await storageServices.uploadStudentDocument(
                orgId,
                studentId,
                file,
                documentType
            );

            setDocuments([...documents, uploadedFile]);
            toast({
                title: 'Document uploaded successfully',
                description: 'The document has been added to the student\'s records.'
            });
        } catch (error) {
            console.error('Error uploading document:', error);
            toast({
                title: 'Error uploading document',
                description: 'Failed to upload the document. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDocument = async (path: string) => {
        try {
            await storageServices.deleteStudentDocument(orgId, path);
            setDocuments(documents.filter(doc => doc.path !== path));
            toast({
                title: 'Document deleted successfully',
                description: 'The document has been removed from the student\'s records.'
            });
        } catch (error) {
            console.error('Error deleting document:', error);
            toast({
                title: 'Error deleting document',
                description: 'Failed to delete the document. Please try again.',
                variant: 'destructive'
            });
        }
    };

    if (!isStorageConfigured) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">
                    Storage is not configured for this organization. Please configure storage settings first.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Student Documents</h3>
                <div className="flex items-center space-x-2">
                    <Input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isLoading}
                    />
                    <Label
                        htmlFor="document-upload"
                        className="cursor-pointer"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isLoading}
                        >
                            Upload Document
                        </Button>
                    </Label>
                </div>
            </div>

            <div className="grid gap-4">
                {documents.map((doc) => (
                    <Card key={doc.path} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <FileIcon className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{doc.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {doc.type} • {new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(doc.url, '_blank')}
                                >
                                    <DownloadIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteDocument(doc.path)}
                                >
                                    <TrashIcon className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {documents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    No documents uploaded yet.
                </div>
            )}
        </div>
    );
} 
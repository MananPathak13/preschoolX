import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Upload, File, Trash2, Loader2 } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

interface StudentDocumentsProps {
    orgId: string;
    studentId: string;
}

const DOCUMENT_TYPES = [
    { value: "birth_certificate", label: "Birth Certificate" },
    { value: "immunization", label: "Immunization Records" },
    { value: "medical", label: "Medical Records" },
    { value: "other", label: "Other" },
];

export function StudentDocuments({ orgId, studentId }: StudentDocumentsProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [selectedType, setSelectedType] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadDocuments();
    }, [orgId, studentId]);

    const loadDocuments = async () => {
        try {
            const studentRef = doc(db, "organizations", orgId, "students", studentId);
            const studentDoc = await studentRef.get();
            if (studentDoc.exists()) {
                setDocuments(studentDoc.data()?.documents || []);
            }
        } catch (error) {
            console.error("Error loading documents:", error);
            toast({
                title: "Error",
                description: "Failed to load documents",
                variant: "destructive",
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !selectedType) {
            toast({
                title: "Error",
                description: "Please select a file type and choose a file",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        try {
            const fileExtension = file.name.split(".").pop();
            const fileName = `${studentId}/${selectedType}_${Date.now()}.${fileExtension}`;
            const storageRef = ref(storage, `organizations/${orgId}/students/${fileName}`);

            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            const documentData = {
                type: selectedType,
                name: file.name,
                url: downloadURL,
                uploadedAt: new Date(),
                uploadedBy: "system", // TODO: Get actual user ID
            };

            const studentRef = doc(db, "organizations", orgId, "students", studentId);
            await updateDoc(studentRef, {
                documents: arrayUnion(documentData),
            });

            setDocuments((prev) => [...prev, documentData]);
            setFile(null);
            setSelectedType("");
            toast({
                title: "Success",
                description: "Document uploaded successfully",
            });
        } catch (error) {
            console.error("Error uploading document:", error);
            toast({
                title: "Error",
                description: "Failed to upload document",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (document: any) => {
        try {
            // Extract file path from URL
            const filePath = document.url.split("/").slice(-2).join("/");
            const storageRef = ref(storage, `organizations/${orgId}/students/${filePath}`);

            // Delete from storage
            await deleteObject(storageRef);

            // Remove from Firestore
            const studentRef = doc(db, "organizations", orgId, "students", studentId);
            await updateDoc(studentRef, {
                documents: arrayRemove(document),
            });

            setDocuments((prev) => prev.filter((doc) => doc.url !== document.url));
            toast({
                title: "Success",
                description: "Document deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting document:", error);
            toast({
                title: "Error",
                description: "Failed to delete document",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Label htmlFor="documentType">Document Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                            {DOCUMENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1">
                    <Label htmlFor="file">File</Label>
                    <Input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                </div>
                <div className="flex items-end">
                    <Button
                        onClick={handleUpload}
                        disabled={isUploading || !file || !selectedType}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-medium">Uploaded Documents</h4>
                {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                ) : (
                    <div className="grid gap-2">
                        {documents.map((document, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 border rounded-md"
                            >
                                <div className="flex items-center space-x-2">
                                    <File className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{document.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-foreground">
                                        {DOCUMENT_TYPES.find((type) => type.value === document.type)?.label}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(document)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 
import { storage } from '@/lib/firebase-config';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import type { StorageReference } from 'firebase/storage';

export interface StorageConfig {
    type: 'google' | 'firebase';
    bucket?: string;
    credentials?: {
        projectId: string;
        clientEmail: string;
        privateKey: string;
    };
}

export interface UploadedFile {
    name: string;
    url: string;
    type: string;
    size: number;
    path: string;
}

class StorageServices {
    private storage;
    private config: StorageConfig | null = null;

    constructor() {
        this.storage = storage;
    }

    /**
     * Configure storage settings for the organization
     */
    async configureStorage(orgId: string, config: StorageConfig) {
        try {
            // Store configuration in Firestore
            const configRef = ref(this.storage, `organizations/${orgId}/config/storage.json`);
            await uploadBytes(configRef, JSON.stringify(config));

            this.config = config;
            return true;
        } catch (error) {
            console.error('Error configuring storage:', error);
            throw error;
        }
    }

    /**
     * Check if storage is configured for an organization
     */
    async isStorageConfigured(orgId: string): Promise<boolean> {
        try {
            const configRef = ref(this.storage, `organizations/${orgId}/config/storage.json`);
            const configUrl = await getDownloadURL(configRef);
            const response = await fetch(configUrl);
            const config = await response.json();
            this.config = config;
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Upload a student document
     */
    async uploadStudentDocument(
        orgId: string,
        studentId: string,
        file: File,
        documentType: string
    ): Promise<UploadedFile> {
        try {
            if (!await this.isStorageConfigured(orgId)) {
                throw new Error('Storage not configured for this organization');
            }

            // Create a unique filename
            const timestamp = Date.now();
            const fileName = `${documentType}_${timestamp}_${file.name}`;
            const path = `organizations/${orgId}/students/${studentId}/documents/${fileName}`;

            const storageRef = ref(this.storage, path);

            // Upload file
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            return {
                name: file.name,
                url,
                type: file.type,
                size: file.size,
                path
            };
        } catch (error) {
            console.error('Error uploading student document:', error);
            throw error;
        }
    }

    /**
     * Get all documents for a student
     */
    async getStudentDocuments(orgId: string, studentId: string): Promise<UploadedFile[]> {
        try {
            if (!await this.isStorageConfigured(orgId)) {
                throw new Error('Storage not configured for this organization');
            }

            const path = `organizations/${orgId}/students/${studentId}/documents`;
            const storageRef = ref(this.storage, path);

            const result = await listAll(storageRef);
            const files = await Promise.all(
                result.items.map(async (item) => {
                    const url = await getDownloadURL(item);
                    return {
                        name: item.name,
                        url,
                        type: item.name.split('_')[0], // First part of filename is document type
                        size: 0, // Size not available from listAll
                        path: item.fullPath
                    };
                })
            );

            return files;
        } catch (error) {
            console.error('Error getting student documents:', error);
            throw error;
        }
    }

    /**
     * Delete a student document
     */
    async deleteStudentDocument(orgId: string, path: string): Promise<void> {
        try {
            if (!await this.isStorageConfigured(orgId)) {
                throw new Error('Storage not configured for this organization');
            }

            const storageRef = ref(this.storage, path);
            await deleteObject(storageRef);
        } catch (error) {
            console.error('Error deleting student document:', error);
            throw error;
        }
    }
}

export const storageServices = new StorageServices(); 
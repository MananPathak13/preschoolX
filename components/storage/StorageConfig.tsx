'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storageServices, type StorageConfig } from '@/lib/storage-services';
import { useToast } from '@/components/ui/use-toast';

interface StorageConfigProps {
    orgId: string;
    onConfigured?: () => void;
}

export function StorageConfig({ orgId, onConfigured }: StorageConfigProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [config, setConfig] = useState<StorageConfig>({
        type: 'google',
        bucket: '',
        credentials: {
            projectId: '',
            clientEmail: '',
            privateKey: ''
        }
    });
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await storageServices.configureStorage(orgId, config);
            toast({
                title: 'Storage configured successfully',
                description: 'Your Google Cloud Storage has been connected.'
            });
            onConfigured?.();
        } catch (error) {
            console.error('Error configuring storage:', error);
            toast({
                title: 'Error configuring storage',
                description: 'Failed to connect to Google Cloud Storage. Please check your credentials.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="bucket">Storage Bucket</Label>
                <Input
                    id="bucket"
                    value={config.bucket}
                    onChange={(e) => setConfig({ ...config, bucket: e.target.value })}
                    placeholder="your-project-id.appspot.com"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                    id="projectId"
                    value={config.credentials?.projectId}
                    onChange={(e) => setConfig({
                        ...config,
                        credentials: { ...config.credentials!, projectId: e.target.value }
                    })}
                    placeholder="your-project-id"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                    id="clientEmail"
                    type="email"
                    value={config.credentials?.clientEmail}
                    onChange={(e) => setConfig({
                        ...config,
                        credentials: { ...config.credentials!, clientEmail: e.target.value }
                    })}
                    placeholder="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="privateKey">Private Key</Label>
                <Input
                    id="privateKey"
                    type="password"
                    value={config.credentials?.privateKey}
                    onChange={(e) => setConfig({
                        ...config,
                        credentials: { ...config.credentials!, privateKey: e.target.value }
                    })}
                    placeholder="-----BEGIN PRIVATE KEY-----\n..."
                    required
                />
            </div>

            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Configuring...' : 'Configure Storage'}
            </Button>
        </form>
    );
} 
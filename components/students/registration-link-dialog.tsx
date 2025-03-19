"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface RegistrationLinkDialogProps {
    organizationId: string;
    trigger?: React.ReactNode;
}

export function RegistrationLinkDialog({
    organizationId,
    trigger,
}: RegistrationLinkDialogProps) {
    const [open, setOpen] = useState(false);
    const registrationLink = `${window.location.origin}/register/student/${organizationId}`;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(registrationLink);
            toast({
                title: "Link copied",
                description: "The registration link has been copied to your clipboard.",
            });
        } catch (error) {
            console.error("Failed to copy link:", error);
            toast({
                title: "Failed to copy",
                description: "Please try copying the link manually.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Get Registration Link</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Student Registration Link</DialogTitle>
                    <DialogDescription>
                        Share this link with parents to allow them to register their children. They will be added to the waitlist for your review.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <Input
                        value={registrationLink}
                        readOnly
                        className="flex-1"
                    />
                    <Button size="icon" variant="outline" onClick={copyLink}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex justify-center py-4">
                    <QRCodeSVG
                        value={registrationLink}
                        size={200}
                        level="H"
                        includeMargin
                    />
                </div>
                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                    <Button variant="default" onClick={copyLink}>
                        Copy Link
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 
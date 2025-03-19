"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search, Send, User, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Mock data for messages
const mockMessages = [
    {
        id: "1",
        subject: "Upcoming Field Trip",
        content: "We're planning a field trip to the zoo next Friday. Please ensure your child brings a packed lunch and comfortable shoes.",
        sender: {
            id: "1",
            name: "Sarah Johnson",
            role: "Lead Teacher",
            avatar: "/avatars/sarah.jpg",
        },
        recipients: ["All Parents"],
        date: new Date(2023, 9, 15, 9, 30),
        read: true,
    },
    {
        id: "2",
        subject: "Parent-Teacher Conference",
        content: "I'd like to schedule a parent-teacher conference to discuss Emma's progress. Are you available next Tuesday at 4 PM?",
        sender: {
            id: "1",
            name: "Sarah Johnson",
            role: "Lead Teacher",
            avatar: "/avatars/sarah.jpg",
        },
        recipients: ["Emma's Parents"],
        date: new Date(2023, 9, 14, 15, 45),
        read: true,
    },
    {
        id: "3",
        subject: "Allergy Alert",
        content: "We have a new student with a severe peanut allergy. Please ensure your child's lunch and snacks are peanut-free.",
        sender: {
            id: "3",
            name: "Jessica Williams",
            role: "Administrator",
            avatar: "/avatars/jessica.jpg",
        },
        recipients: ["All Parents"],
        date: new Date(2023, 9, 12, 11, 15),
        read: false,
    },
    {
        id: "4",
        subject: "Noah's Progress Report",
        content: "I wanted to share that Noah has made excellent progress with his counting skills this week. He can now count to 20 confidently!",
        sender: {
            id: "2",
            name: "Michael Smith",
            role: "Assistant Teacher",
            avatar: "/avatars/michael.jpg",
        },
        recipients: ["Noah's Parents"],
        date: new Date(2023, 9, 10, 16, 20),
        read: false,
    },
    {
        id: "5",
        subject: "Holiday Schedule",
        content: "Please note that the preschool will be closed for the Thanksgiving holiday from November 23-24. We will resume normal hours on November 27.",
        sender: {
            id: "3",
            name: "Jessica Williams",
            role: "Administrator",
            avatar: "/avatars/jessica.jpg",
        },
        recipients: ["All Parents", "All Staff"],
        date: new Date(2023, 9, 8, 10, 0),
        read: true,
    },
];

// Mock data for recipients
const mockRecipients = [
    "All Parents",
    "All Staff",
    "Emma's Parents",
    "Noah's Parents",
    "Olivia's Parents",
    "Liam's Parents",
    "Ava's Parents",
];

export default function MessagesPage() {
    const [messages, setMessages] = useState(mockMessages);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<typeof mockMessages[0] | null>(null);
    const [newMessage, setNewMessage] = useState({
        subject: "",
        content: "",
        recipients: [] as string[],
    });

    // Filter messages based on search term
    const filteredMessages = messages.filter((message) =>
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.recipients.some(recipient =>
            recipient.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Handle form input changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setNewMessage({ ...newMessage, [name]: value });
    };

    // Handle recipient selection
    const handleRecipientChange = (value: string) => {
        if (newMessage.recipients.includes(value)) {
            setNewMessage({
                ...newMessage,
                recipients: newMessage.recipients.filter(r => r !== value),
            });
        } else {
            setNewMessage({
                ...newMessage,
                recipients: [...newMessage.recipients, value],
            });
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (newMessage.recipients.length === 0) {
            alert("Please select at least one recipient");
            return;
        }

        // Create new message object
        const message = {
            id: (messages.length + 1).toString(),
            subject: newMessage.subject,
            content: newMessage.content,
            sender: {
                id: "1", // Current user ID (hardcoded for demo)
                name: "Sarah Johnson", // Current user name (hardcoded for demo)
                role: "Lead Teacher", // Current user role (hardcoded for demo)
                avatar: "/avatars/sarah.jpg", // Current user avatar (hardcoded for demo)
            },
            recipients: newMessage.recipients,
            date: new Date(),
            read: true,
        };

        // Add new message to the list
        setMessages([message, ...messages]);

        // Reset form
        setNewMessage({
            subject: "",
            content: "",
            recipients: [],
        });

        // Close dialog
        setIsDialogOpen(false);
    };

    // Mark message as read
    const markAsRead = (id: string) => {
        setMessages(messages.map(message =>
            message.id === id ? { ...message, read: true } : message
        ));
    };

    // View message details
    const viewMessage = (message: typeof mockMessages[0]) => {
        setSelectedMessage(message);
        if (!message.read) {
            markAsRead(message.id);
        }
    };

    // Close message details
    const closeMessageDetails = () => {
        setSelectedMessage(null);
    };

    // Count unread messages
    const unreadCount = messages.filter(message => !message.read).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Messages</h1>
                    {unreadCount > 0 && (
                        <p className="text-muted-foreground">
                            You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Message
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Compose New Message</DialogTitle>
                            <DialogDescription>
                                Create a new message to send to parents or staff.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">To:</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {newMessage.recipients.map((recipient) => (
                                            <Badge key={recipient} variant="secondary" className="flex items-center gap-1">
                                                {recipient}
                                                <button
                                                    type="button"
                                                    className="ml-1 rounded-full outline-none focus:ring-2"
                                                    onClick={() => handleRecipientChange(recipient)}
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <Select onValueChange={handleRecipientChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select recipients" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockRecipients
                                                .filter(r => !newMessage.recipients.includes(r))
                                                .map((recipient) => (
                                                    <SelectItem key={recipient} value={recipient}>
                                                        {recipient}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="subject" className="text-sm font-medium">Subject:</label>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        value={newMessage.subject}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="content" className="text-sm font-medium">Message:</label>
                                    <Textarea
                                        id="content"
                                        name="content"
                                        rows={6}
                                        value={newMessage.content}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Message
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search messages..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold">Inbox</h2>
                    {filteredMessages.length > 0 ? (
                        filteredMessages.map((message) => (
                            <Card
                                key={message.id}
                                className={`cursor-pointer hover:bg-accent/50 transition-colors ${selectedMessage?.id === message.id ? 'border-primary' : ''
                                    } ${!message.read ? 'bg-accent/20' : ''}`}
                                onClick={() => viewMessage(message)}
                            >
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base">{message.subject}</CardTitle>
                                        {!message.read && (
                                            <Badge variant="default" className="ml-2">New</Badge>
                                        )}
                                    </div>
                                    <CardDescription className="line-clamp-1">
                                        {message.content}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="p-4 pt-2 flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                                            <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-muted-foreground">{message.sender.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {format(message.date, "MMM d")}
                                    </span>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                No messages found.
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="md:col-span-2">
                    {selectedMessage ? (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{selectedMessage.subject}</CardTitle>
                                        <CardDescription className="flex items-center mt-1">
                                            <span className="flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {format(selectedMessage.date, "MMMM d, yyyy 'at' h:mm a")}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={closeMessageDetails}>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
                                    <Avatar>
                                        <AvatarImage src={selectedMessage.sender.avatar} alt={selectedMessage.sender.name} />
                                        <AvatarFallback>{selectedMessage.sender.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{selectedMessage.sender.name}</div>
                                        <div className="text-sm text-muted-foreground">{selectedMessage.sender.role}</div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="text-sm font-medium mb-1">To:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedMessage.recipients.map((recipient) => (
                                            <Badge key={recipient} variant="secondary">
                                                {recipient}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="whitespace-pre-line">{selectedMessage.content}</div>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-2">
                                <Button variant="outline">
                                    <Send className="mr-2 h-4 w-4" />
                                    Reply
                                </Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <User className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground text-center">
                                    Select a message to view its contents.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 
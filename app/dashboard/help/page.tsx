"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    HelpCircle,
    Search,
    FileText,
    Mail,
    Phone,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    BookOpen,
    Video
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// FAQ Component
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border rounded-md overflow-hidden">
            <button
                className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium">{question}</span>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>
            {isOpen && (
                <div className="p-4 border-t bg-card/50">
                    <p className="text-muted-foreground">{answer}</p>
                </div>
            )}
        </div>
    );
};

// Documentation Card Component
const DocumentationCard = ({
    title,
    description,
    icon: Icon,
    link
}: {
    title: string;
    description: string;
    icon: any;
    link: string;
}) => {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Documentation
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const faqs = [
        {
            question: "How do I add a new student?",
            answer: "To add a new student, navigate to the Students page and click on the 'Add Student' button. Fill in the required information in the form and click 'Save'."
        },
        {
            question: "How do I take attendance?",
            answer: "Go to the Attendance page, select the date and class, then mark each student as present or absent. Click 'Save Attendance' when you're done."
        },
        {
            question: "How do I create a new lesson plan?",
            answer: "Navigate to the Curriculum page and click on 'Add Lesson Plan'. Fill in the details including title, description, objectives, and activities, then click 'Save'."
        },
        {
            question: "How do I send messages to parents?",
            answer: "Go to the Messages page, click 'Compose', select the recipients (individual parents or entire classes), write your message, and click 'Send'."
        },
        {
            question: "How do I generate reports?",
            answer: "Navigate to the Reports page, select the type of report you want to generate, specify the date range and format, then click 'Generate'."
        },
        {
            question: "How do I add a staff member?",
            answer: "Go to the Staff page and click 'Add Staff Member'. Fill in their details, set their role and permissions, then click 'Save'."
        },
        {
            question: "How do I change my password?",
            answer: "Go to Settings > Security, enter your current password and your new password, then click 'Update Password'."
        },
        {
            question: "How do I set up notifications?",
            answer: "Navigate to Settings > Notifications, choose which notifications you want to receive and how you want to receive them, then click 'Save Preferences'."
        },
    ];

    const filteredFAQs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const documentation = [
        {
            title: "User Guide",
            description: "Complete guide to using PreschoolPro",
            icon: BookOpen,
            link: "#user-guide",
        },
        {
            title: "Admin Manual",
            description: "Advanced settings and administration",
            icon: FileText,
            link: "#admin-manual",
        },
        {
            title: "Video Tutorials",
            description: "Step-by-step video guides",
            icon: Video,
            link: "#video-tutorials",
        },
        {
            title: "API Documentation",
            description: "For developers and integrations",
            icon: FileText,
            link: "#api-docs",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Help & Support</h1>
                <p className="text-muted-foreground">
                    Find answers to common questions and get support
                </p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search for help..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Tabs defaultValue="faq" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="documentation">Documentation</TabsTrigger>
                    <TabsTrigger value="contact">Contact Support</TabsTrigger>
                </TabsList>

                <TabsContent value="faq" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                            <CardDescription>
                                Find answers to common questions about using PreschoolPro
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {filteredFAQs.length === 0 ? (
                                <div className="text-center py-8">
                                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-1">No results found</h3>
                                    <p className="text-muted-foreground">
                                        Try searching for something else or contact our support team
                                    </p>
                                </div>
                            ) : (
                                filteredFAQs.map((faq, index) => (
                                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documentation" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentation</CardTitle>
                            <CardDescription>
                                Comprehensive guides and resources for using PreschoolPro
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {documentation.map((doc, index) => (
                                    <DocumentationCard
                                        key={index}
                                        title={doc.title}
                                        description={doc.description}
                                        icon={doc.icon}
                                        link={doc.link}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Getting Started</CardTitle>
                            <CardDescription>
                                Quick guides to help you get up and running
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Setting Up Your Account</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Learn how to set up your account, customize your profile, and configure basic settings.
                                        </p>
                                        <Button variant="link" className="p-0 h-auto" asChild>
                                            <a href="#setup-guide">Read Guide</a>
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Student Management</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Learn how to add, edit, and manage student records, including enrollment and attendance.
                                        </p>
                                        <Button variant="link" className="p-0 h-auto" asChild>
                                            <a href="#student-guide">Read Guide</a>
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Curriculum Planning</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Learn how to create, organize, and manage lesson plans and educational activities.
                                        </p>
                                        <Button variant="link" className="p-0 h-auto" asChild>
                                            <a href="#curriculum-guide">Read Guide</a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Support</CardTitle>
                            <CardDescription>
                                Get in touch with our support team for assistance
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center">
                                            <Mail className="h-5 w-5 mr-2 text-primary" />
                                            Email Support
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Send us an email and we'll respond within 24 hours
                                        </p>
                                        <p className="font-medium">support@preschoolpro.com</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center">
                                            <Phone className="h-5 w-5 mr-2 text-primary" />
                                            Phone Support
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Available Monday-Friday, 9am-5pm EST
                                        </p>
                                        <p className="font-medium">(555) 123-4567</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center">
                                            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                                            Live Chat
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Chat with our support team in real-time
                                        </p>
                                        <Button size="sm" className="w-full">Start Chat</Button>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Send a Support Request</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="Your name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Your email address" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="technical">Technical Issue</SelectItem>
                                            <SelectItem value="billing">Billing Question</SelectItem>
                                            <SelectItem value="feature">Feature Request</SelectItem>
                                            <SelectItem value="account">Account Help</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Describe your issue or question" rows={5} />
                                </div>
                                <Button className="w-full md:w-auto">
                                    Submit Request
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
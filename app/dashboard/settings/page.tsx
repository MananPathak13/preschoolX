"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Settings,
    User,
    Bell,
    Shield,
    Mail,
    Smartphone,
    Globe,
    CreditCard,
    Save,
    School
} from "lucide-react";

export default function SettingsPage() {
    const [generalSettings, setGeneralSettings] = useState({
        schoolName: "Sunshine Preschool",
        email: "admin@sunshinepreschool.com",
        phone: "(555) 123-4567",
        address: "123 Education Lane, Learning City, LC 12345",
        website: "www.sunshinepreschool.com",
        timezone: "America/New_York",
        language: "en-US",
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        attendanceAlerts: true,
        paymentReminders: true,
        systemUpdates: true,
        marketingEmails: false,
    });

    const handleGeneralSettingChange = (key: string, value: string) => {
        setGeneralSettings({
            ...generalSettings,
            [key]: value,
        });
    };

    const handleNotificationToggle = (key: string) => {
        setNotificationSettings({
            ...notificationSettings,
            [key]: !notificationSettings[key as keyof typeof notificationSettings],
        });
    };

    const handleSaveSettings = () => {
        // This would connect to your backend to save the settings
        console.log("Saving settings:", { generalSettings, notificationSettings });
        // Show success message
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your preschool settings and preferences
                </p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full md:w-auto">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>
                                Manage your preschool's basic information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="schoolName">School Name</Label>
                                <Input
                                    id="schoolName"
                                    value={generalSettings.schoolName}
                                    onChange={(e) => handleGeneralSettingChange("schoolName", e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={generalSettings.email}
                                        onChange={(e) => handleGeneralSettingChange("email", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={generalSettings.phone}
                                        onChange={(e) => handleGeneralSettingChange("phone", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={generalSettings.address}
                                    onChange={(e) => handleGeneralSettingChange("address", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={generalSettings.website}
                                    onChange={(e) => handleGeneralSettingChange("website", e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select
                                        defaultValue={generalSettings.timezone}
                                        onValueChange={(value) => handleGeneralSettingChange("timezone", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language">Language</Label>
                                    <Select
                                        defaultValue={generalSettings.language}
                                        onValueChange={(value) => handleGeneralSettingChange("language", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en-US">English (US)</SelectItem>
                                            <SelectItem value="es-ES">Spanish</SelectItem>
                                            <SelectItem value="fr-FR">French</SelectItem>
                                            <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveSettings}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>School Logo</CardTitle>
                            <CardDescription>
                                Upload your preschool's logo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-md">
                                <div className="flex flex-col items-center space-y-2">
                                    <School className="h-16 w-16 text-muted-foreground" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium">
                                            Drag and drop your logo here, or click to browse
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG or SVG, max 2MB
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Upload Logo
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Choose how you want to receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive notifications via email
                                    </p>
                                </div>
                                <Switch
                                    id="emailNotifications"
                                    checked={notificationSettings.emailNotifications}
                                    onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive notifications via text message
                                    </p>
                                </div>
                                <Switch
                                    id="smsNotifications"
                                    checked={notificationSettings.smsNotifications}
                                    onCheckedChange={() => handleNotificationToggle("smsNotifications")}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="attendanceAlerts">Attendance Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get notified about attendance changes
                                    </p>
                                </div>
                                <Switch
                                    id="attendanceAlerts"
                                    checked={notificationSettings.attendanceAlerts}
                                    onCheckedChange={() => handleNotificationToggle("attendanceAlerts")}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="paymentReminders">Payment Reminders</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get notified about upcoming and overdue payments
                                    </p>
                                </div>
                                <Switch
                                    id="paymentReminders"
                                    checked={notificationSettings.paymentReminders}
                                    onCheckedChange={() => handleNotificationToggle("paymentReminders")}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="systemUpdates">System Updates</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get notified about system updates and maintenance
                                    </p>
                                </div>
                                <Switch
                                    id="systemUpdates"
                                    checked={notificationSettings.systemUpdates}
                                    onCheckedChange={() => handleNotificationToggle("systemUpdates")}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive promotional emails and newsletters
                                    </p>
                                </div>
                                <Switch
                                    id="marketingEmails"
                                    checked={notificationSettings.marketingEmails}
                                    onCheckedChange={() => handleNotificationToggle("marketingEmails")}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveSettings}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Preferences
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>
                                Manage your account security and authentication
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input id="currentPassword" type="password" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input id="newPassword" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input id="confirmPassword" type="password" />
                                </div>
                            </div>
                            <div className="pt-4">
                                <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Add an extra layer of security to your account
                                </p>
                                <Button variant="outline">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Enable Two-Factor Authentication
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>
                                <Save className="h-4 w-4 mr-2" />
                                Update Password
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Session Management</CardTitle>
                            <CardDescription>
                                Manage your active sessions and devices
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-md">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <Smartphone className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Current Device</p>
                                            <p className="text-sm text-muted-foreground">Windows • Chrome • IP: 192.168.1.1</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" disabled>
                                        Active
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-md">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <Smartphone className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">iPhone 13</p>
                                            <p className="text-sm text-muted-foreground">iOS • Safari • Last active: 2 days ago</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">
                                Logout from All Devices
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="billing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Information</CardTitle>
                            <CardDescription>
                                Manage your subscription and payment methods
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-medium">Current Plan</h3>
                                        <p className="text-sm text-muted-foreground">Professional Plan</p>
                                    </div>
                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                        Active
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <p className="text-sm">Price</p>
                                        <p className="text-sm font-medium">$49.99/month</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-sm">Renewal Date</p>
                                        <p className="text-sm font-medium">November 15, 2023</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button variant="outline" size="sm">
                                        Change Plan
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        Cancel Subscription
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">Payment Methods</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-4 border rounded-md">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <CreditCard className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Visa ending in 4242</p>
                                                <p className="text-sm text-muted-foreground">Expires 12/24</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm">
                                                Edit
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="mt-2">
                                    Add Payment Method
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Billing History</CardTitle>
                            <CardDescription>
                                View your past invoices and payment history
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-4 border rounded-md">
                                    <div>
                                        <p className="font-medium">Invoice #12345</p>
                                        <p className="text-sm text-muted-foreground">October 15, 2023</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-medium">$49.99</p>
                                        <Button variant="outline" size="sm">
                                            Download
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-md">
                                    <div>
                                        <p className="font-medium">Invoice #12344</p>
                                        <p className="text-sm text-muted-foreground">September 15, 2023</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-medium">$49.99</p>
                                        <Button variant="outline" size="sm">
                                            Download
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-md">
                                    <div>
                                        <p className="font-medium">Invoice #12343</p>
                                        <p className="text-sm text-muted-foreground">August 15, 2023</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-medium">$49.99</p>
                                        <Button variant="outline" size="sm">
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance Settings</CardTitle>
                            <CardDescription>
                                Customize the look and feel of your dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Theme</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="border rounded-md p-2 w-full h-20 bg-white cursor-pointer hover:border-primary">
                                            <div className="w-full h-3 bg-gray-200 rounded mb-2"></div>
                                            <div className="w-3/4 h-2 bg-gray-200 rounded mb-2"></div>
                                            <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
                                        </div>
                                        <Label className="text-xs">Light</Label>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="border rounded-md p-2 w-full h-20 bg-gray-900 cursor-pointer hover:border-primary">
                                            <div className="w-full h-3 bg-gray-700 rounded mb-2"></div>
                                            <div className="w-3/4 h-2 bg-gray-700 rounded mb-2"></div>
                                            <div className="w-1/2 h-2 bg-gray-700 rounded"></div>
                                        </div>
                                        <Label className="text-xs">Dark</Label>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="border rounded-md p-2 w-full h-20 bg-white cursor-pointer hover:border-primary">
                                            <div className="w-full h-3 bg-blue-100 rounded mb-2"></div>
                                            <div className="w-3/4 h-2 bg-blue-100 rounded mb-2"></div>
                                            <div className="w-1/2 h-2 bg-blue-100 rounded"></div>
                                        </div>
                                        <Label className="text-xs">System</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Accent Color</Label>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-blue-500"></div>
                                    <div className="w-8 h-8 rounded-full bg-green-500 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-green-500"></div>
                                    <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-purple-500"></div>
                                    <div className="w-8 h-8 rounded-full bg-pink-500 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-pink-500"></div>
                                    <div className="w-8 h-8 rounded-full bg-amber-500 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-amber-500"></div>
                                    <div className="w-8 h-8 rounded-full bg-red-500 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-red-500"></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Font Size</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button variant="outline" className="text-xs">Small</Button>
                                    <Button variant="outline" className="text-sm">Medium</Button>
                                    <Button variant="outline" className="text-base">Large</Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="animations">Animations</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable animations and transitions
                                    </p>
                                </div>
                                <Switch id="animations" defaultChecked />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveSettings}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Appearance
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
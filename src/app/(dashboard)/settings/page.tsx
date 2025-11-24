'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Application preferences and configuration
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5" />
                        General Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="academic-year">Academic Year</Label>
                        <Input id="academic-year" defaultValue="2024-2025" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Input id="currency" defaultValue="INR (₹)" />
                    </div>
                    <Button>Save Settings</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">
                                Receive updates via email
                            </p>
                        </div>
                        <Button variant="outline">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">SMS Notifications</p>
                            <p className="text-sm text-muted-foreground">
                                Send attendance and fee alerts
                            </p>
                        </div>
                        <Button variant="outline">Configure</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

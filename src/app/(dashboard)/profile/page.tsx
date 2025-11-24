'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Shield, Key } from 'lucide-react'

export default function ProfilePage() {
    const { data: session } = useSession()
    const [isEditing, setIsEditing] = useState(false)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3 xl font-bold tracking-tight">Profile</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                                {session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">{session?.user?.name}</h3>
                                <p className="text-sm text-muted-foreground">{session?.user?.role}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{session?.user?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium">{session?.user?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Role:</span>
                                <span className="font-medium">{session?.user?.role}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                        </div>
                        <Button className="w-full">
                            <Key className="mr-2 h-4 w-4" />
                            Update Password
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            defaultValue={session?.user?.name || ''}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            defaultValue={session?.user?.email || ''}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        ) : (
                            <>
                                <Button>Save Changes</Button>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

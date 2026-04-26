import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export function AccountSettings() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />

      {/* Profile Information & Email */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            View and manage your profile details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarPreview || undefined} alt="Profile" />
              <AvatarFallback className="text-2xl bg-dost-blue text-white font-semibold">DA</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Profile Picture</h4>
              <p className="text-sm text-muted-foreground">
                JPG, GIF or PNG. Max size of 2MB.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="w-4 h-4 mr-2" />
                  Upload picture
                </Button>
                {avatarPreview && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { 
                      setAvatarPreview(null); 
                      if (fileInputRef.current) fileInputRef.current.value = ""; 
                    }} 
                    className="text-muted-foreground"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/png, image/jpeg, image/gif" 
              />
            </div>
          </div>
          <Separator />
          
          <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value="admin@dost.gov.ph" readOnly disabled />
            <p className="text-[0.8rem] text-muted-foreground">
              Your email address is used for login and notifications.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue="DOST Admin" />
          </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save changes</Button>
        </CardFooter>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password to keep your account secure.
          </CardDescription>
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
        </CardContent>
        <CardFooter>
          <Button variant="default">Update password</Button>
        </CardFooter>
      </Card>

      {/* Account Termination */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Account Termination</CardTitle>
          <CardDescription>
            Deactivate or permanently delete your account. This action cannot be easily undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="font-medium text-sm">Deactivate Account</p>
              <p className="text-sm text-muted-foreground">
                Temporarily disable your account. You can reactivate it later.
              </p>
            </div>
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">Deactivate</Button>
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="font-medium text-sm">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently remove your account and all associated data.
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

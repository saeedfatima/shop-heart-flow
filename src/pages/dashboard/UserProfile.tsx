import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Mail, Phone, User, Lock, Shield, Upload, X, Loader2, MapPin, Calendar, Briefcase, Link2, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { addressService, Address } from "@/lib/apiServices";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost';

const UserProfile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    location: user?.location || "",
    occupation: user?.occupation || "",
    dateOfBirth: user?.date_of_birth || "",
    tiktok: user?.tiktok || "",
    whatsapp: user?.whatsapp || "",
    instagram: user?.instagram || "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar}`) : null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressForm, setAddressForm] = useState({
    label: "",
    recipient_name: "",
    phone: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Nigeria",
    is_default: false,
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await addressService.getAll();
        setAddresses(Array.isArray(data) ? data.slice(0, 2) : []); // limit to 2 maximum
      } catch (error) {
        console.error("Failed to load addresses:", error);
      } finally {
        setAddressLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const openAddressEditor = (addr?: Address) => {
    if (addr) {
      setEditingAddress(addr);
      setAddressForm({
        label: addr.label || "Home",
        recipient_name: addr.recipient_name,
        phone: addr.phone,
        street_address: addr.street_address,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country || "Nigeria",
        is_default: addr.is_default,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        label: addresses.length === 0 ? "Home" : "Work",
        recipient_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
        phone: user?.phone || "",
        street_address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "Nigeria",
        is_default: addresses.length === 0,
      });
    }
    setShowAddressDialog(true);
  };

  const handleSaveAddress = async () => {
    const payload = {
      address_type: addressForm.label.toLowerCase() === 'work' ? 'work' : 'home',
      ...addressForm
    };

    try {
      if (editingAddress) {
        await addressService.update(editingAddress.id, payload);
        setAddresses(prev => prev.map(a => a.id === editingAddress.id ? { ...a, ...payload } : a));
      } else {
        const { data } = await addressService.create(payload);
        if (data) setAddresses(prev => [...prev, data]);
      }
      toast({ title: "Address saved", description: "Your shipping addresses have been updated." });
      setShowAddressDialog(false);
    } catch {
      toast({ title: "Error", description: "Could not save address", variant: "destructive" });
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await addressService.delete(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast({ title: "Address removed" });
    } catch {
      toast({ title: "Error", description: "Could not drop address", variant: "destructive" });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, GIF, WEBP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB as per PHP API)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Upload avatar if changed
      if (avatarFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const { error: uploadError } = await api.uploadFile('/auth/upload-avatar', formData);
        
        if (uploadError) {
          toast({
            title: "Avatar upload failed",
            description: uploadError,
            variant: "destructive",
          });
        } else {
          setAvatarFile(null);
        }
        setIsUploading(false);
      }

      // Update profile data
      const result = await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        occupation: formData.occupation,
        date_of_birth: formData.dateOfBirth,
        tiktok: formData.tiktok,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
      });

      if (result.success) {
        await refreshUser();
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast({
          title: "Update failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    // Note: Password change endpoint would need to be added to PHP API
    // For now, show a message that this feature requires backend implementation
    toast({
      title: "Password change",
      description: "Password change functionality requires additional backend setup.",
    });

    setShowPasswordDialog(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Picture</CardTitle>
            <CardDescription>Update your profile photo - this will be visible to others</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full h-9 w-9 shadow-md"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col items-center sm:items-start gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Photo
                  </Button>
                  {avatarPreview && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, GIF, PNG or WEBP. Max size 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us a little about yourself..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/500</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input 
                  id="location" 
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Occupation
                </Label>
                <Input 
                  id="occupation" 
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="Your job title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth
              </Label>
              <Input 
                id="dateOfBirth" 
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Addresses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Addresses
              </CardTitle>
              <CardDescription>Manage up to 2 shipping addresses</CardDescription>
            </div>
            {addresses.length < 2 && (
              <Button variant="outline" size="sm" onClick={() => openAddressEditor()}>
                Add Address
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {addressLoading ? (
               <div className="flex items-center justify-center p-4">
                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
               </div>
            ) : addresses.length === 0 ? (
              <div className="text-center p-6 bg-secondary/50 rounded-lg text-muted-foreground border-2 border-dashed">
                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No addresses added yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div key={addr.id} className="relative p-4 border rounded-lg bg-card">
                    {addr.is_default && (
                      <span className="absolute top-4 right-4 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium uppercase">
                        Default
                      </span>
                    )}
                    <h4 className="font-semibold">{addr.label}</h4>
                    <p className="text-sm font-medium mt-1">{addr.recipient_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {addr.street_address}<br/>
                      {addr.city}, {addr.state} {addr.postal_code}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{addr.phone}</p>
                    <div className="flex gap-2 mt-4">
                      <Button variant="secondary" size="sm" className="flex-1" onClick={() => openAddressEditor(addr)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAddress(addr.id)}><X className="h-4 w-4"/></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Social Media Links
            </CardTitle>
            <CardDescription>Connect your social media accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tiktok" className="flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                TikTok
              </Label>
              <Input 
                id="tiktok" 
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Label>
              <Input 
                id="whatsapp" 
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+234 xxx xxx xxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                Instagram
              </Label>
              <Input 
                id="instagram" 
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@username"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Keep your account secure</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                Change Password
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Form Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle>{editingAddress ? 'Edit Address' : 'Add Address'}</DialogTitle>
             <DialogDescription>Enter the shipping destination details below</DialogDescription>
           </DialogHeader>
           <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Address Label (Home, Work, etc)</Label>
                   <Input value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})} placeholder="e.g. Home" />
                 </div>
                 <div className="space-y-2">
                   <Label>Phone</Label>
                   <Input value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
                 </div>
              </div>
              <div className="space-y-2">
                 <Label>Recipient Name</Label>
                 <Input value={addressForm.recipient_name} onChange={e => setAddressForm({...addressForm, recipient_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <Label>Street Address</Label>
                 <Input value={addressForm.street_address} onChange={e => setAddressForm({...addressForm, street_address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>City</Label>
                   <Input value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label>State</Label>
                   <Input value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                 </div>
              </div>
              <div className="space-y-2">
                 <Label>Postal Code</Label>
                 <Input value={addressForm.postal_code} onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                 <input type="checkbox" checked={addressForm.is_default} onChange={e => setAddressForm({...addressForm, is_default: e.target.checked})} className="rounded border-gray-300"/>
                 Set as default shipping address
              </label>
           </div>
           <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddressDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveAddress}>Save Address</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default UserProfile;

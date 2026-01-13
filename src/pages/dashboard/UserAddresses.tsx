import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Plus, Edit, Trash2, Home, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addressService, Address, AddressInput } from "@/lib/apiServices";

const UserAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<AddressInput>({
    label: "",
    address_type: "home",
    recipient_name: "",
    street_address: "",
    apartment: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Nigeria",
    phone: "",
    is_default: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const data = await addressService.getAll();
      setAddresses(data);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await addressService.update(addressId, { is_default: true });
      await fetchAddresses();
      toast({
        title: "Default address updated",
        description: "Your default shipping address has been changed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default address.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (addressId: number) => {
    try {
      await addressService.delete(addressId);
      setAddresses(prev => prev.filter(a => a.id !== addressId));
      toast({
        title: "Address deleted",
        description: "The address has been removed from your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const result = await addressService.create(formData);
      if (result.data) {
        setAddresses(prev => [...prev, result.data!]);
        setIsDialogOpen(false);
        setFormData({
          label: "",
          address_type: "home",
          recipient_name: "",
          street_address: "",
          apartment: "",
          city: "",
          state: "",
          postal_code: "",
          country: "Nigeria",
          phone: "",
          is_default: false,
        });
        toast({
          title: "Address saved",
          description: "Your new address has been added successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save address.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Addresses</h1>
          <p className="text-muted-foreground">Manage your shipping addresses</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Addresses</h1>
            <p className="text-muted-foreground">Manage your shipping addresses</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
                <DialogDescription>
                  Enter your shipping address details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Label</Label>
                    <Input 
                      id="label" 
                      placeholder="Home, Work, etc."
                      value={formData.label}
                      onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={formData.address_type} 
                      onValueChange={(value: 'home' | 'work' | 'other') => setFormData(prev => ({ ...prev, address_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Name</Label>
                  <Input 
                    id="recipient" 
                    placeholder="John Doe"
                    value={formData.recipient_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipient_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input 
                    id="address" 
                    placeholder="123 Main Street"
                    value={formData.street_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, street_address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apt">Apartment, suite, etc. (optional)</Label>
                  <Input 
                    id="apt" 
                    placeholder="Apt 4B"
                    value={formData.apartment}
                    onChange={(e) => setFormData(prev => ({ ...prev, apartment: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      placeholder="Lagos"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state" 
                      placeholder="Lagos"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">Postal Code</Label>
                    <Input 
                      id="zip" 
                      placeholder="100001"
                      value={formData.postal_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      placeholder="+234 801 234 5678"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Address"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No addresses saved</h3>
          <p className="text-muted-foreground">Add your first shipping address to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <Card key={address.id} className={address.is_default ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {address.address_type === "home" ? (
                      <Home className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Building className="h-4 w-4 text-muted-foreground" />
                    )}
                    <CardTitle className="text-base">{address.label}</CardTitle>
                    {address.is_default && (
                      <Badge variant="secondary" className="ml-2">Default</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">{address.recipient_name}</p>
                    <p className="text-muted-foreground">{address.street_address}</p>
                    {address.apartment && <p className="text-muted-foreground">{address.apartment}</p>}
                    <p className="text-muted-foreground">{address.city}, {address.state} {address.postal_code}</p>
                    <p className="text-muted-foreground">{address.country}</p>
                    <p className="text-muted-foreground mt-1">{address.phone}</p>
                  </div>
                </div>
                {!address.is_default && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default UserAddresses;

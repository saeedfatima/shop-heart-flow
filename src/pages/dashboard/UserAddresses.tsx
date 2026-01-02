import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Plus, Edit, Trash2, Home, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockAddresses = [
  { 
    id: 1, 
    type: "home", 
    label: "Home",
    name: "John Doe",
    address: "123 Main Street, Apt 4B", 
    city: "New York", 
    state: "NY", 
    zip: "10001",
    country: "United States",
    phone: "+1 (555) 123-4567",
    isDefault: true 
  },
  { 
    id: 2, 
    type: "work", 
    label: "Work",
    name: "John Doe",
    address: "456 Business Ave, Suite 200", 
    city: "New York", 
    state: "NY", 
    zip: "10018",
    country: "United States",
    phone: "+1 (555) 987-6543",
    isDefault: false 
  },
  { 
    id: 3, 
    type: "home", 
    label: "Parents' House",
    name: "John Doe",
    address: "789 Oak Lane", 
    city: "Brooklyn", 
    state: "NY", 
    zip: "11201",
    country: "United States",
    phone: "+1 (555) 456-7890",
    isDefault: false 
  },
];

const UserAddresses = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSetDefault = (addressId: number) => {
    toast({
      title: "Default address updated",
      description: "Your default shipping address has been changed.",
    });
  };

  const handleDelete = (addressId: number) => {
    toast({
      title: "Address deleted",
      description: "The address has been removed from your account.",
    });
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    toast({
      title: "Address saved",
      description: "Your new address has been added successfully.",
    });
  };

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
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" placeholder="123 Main Street" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apt">Apartment, suite, etc. (optional)</Label>
                  <Input id="apt" placeholder="Apt 4B" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="New York" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="NY" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" placeholder="10001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Address</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockAddresses.map((address) => (
          <Card key={address.id} className={address.isDefault ? "ring-2 ring-primary" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {address.type === "home" ? (
                    <Home className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Building className="h-4 w-4 text-muted-foreground" />
                  )}
                  <CardTitle className="text-base">{address.label}</CardTitle>
                  {address.isDefault && (
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
                  <p className="font-medium">{address.name}</p>
                  <p className="text-muted-foreground">{address.address}</p>
                  <p className="text-muted-foreground">{address.city}, {address.state} {address.zip}</p>
                  <p className="text-muted-foreground">{address.country}</p>
                  <p className="text-muted-foreground mt-1">{address.phone}</p>
                </div>
              </div>
              {!address.isDefault && (
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
    </motion.div>
  );
};

export default UserAddresses;

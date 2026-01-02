import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockPaymentMethods = [
  { 
    id: 1, 
    type: "visa",
    last4: "4242",
    expiry: "12/25",
    name: "John Doe",
    isDefault: true 
  },
  { 
    id: 2, 
    type: "mastercard",
    last4: "5555",
    expiry: "08/26",
    name: "John Doe",
    isDefault: false 
  },
  { 
    id: 3, 
    type: "amex",
    last4: "0005",
    expiry: "03/25",
    name: "John Doe",
    isDefault: false 
  },
];

const getCardIcon = (type: string) => {
  const colors: Record<string, string> = {
    visa: "text-blue-600",
    mastercard: "text-orange-500",
    amex: "text-blue-400",
  };
  return <CreditCard className={`h-8 w-8 ${colors[type] || "text-muted-foreground"}`} />;
};

const getCardLabel = (type: string) => {
  const labels: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
  };
  return labels[type] || type;
};

const UserPayments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSetDefault = (methodId: number) => {
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been changed.",
    });
  };

  const handleDelete = (methodId: number) => {
    toast({
      title: "Payment method removed",
      description: "The payment method has been removed from your account.",
    });
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    toast({
      title: "Payment method added",
      description: "Your new payment method has been added successfully.",
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
            <h1 className="text-2xl font-bold text-foreground">Payment Methods</h1>
            <p className="text-muted-foreground">Manage your saved payment methods</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  Enter your card details securely.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input id="cardName" placeholder="John Doe" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" type="password" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Add Card</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {mockPaymentMethods.map((method) => (
          <Card key={method.id} className={method.isDefault ? "ring-2 ring-primary" : ""}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getCardIcon(method.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{getCardLabel(method.type)} •••• {method.last4}</p>
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.expiry} • {method.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {!method.isDefault && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => handleSetDefault(method.id)}
                >
                  Set as Default
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="mt-6 bg-secondary/30">
        <CardHeader>
          <CardTitle className="text-base">Secure Payments</CardTitle>
          <CardDescription>
            Your payment information is encrypted and securely stored. We never store your full card details on our servers.
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  );
};

export default UserPayments;

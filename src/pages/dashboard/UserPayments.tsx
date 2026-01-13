import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { paymentMethodService, PaymentMethod } from "@/lib/apiServices";

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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    card_number: "",
    cardholder_name: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const data = await paymentMethodService.getAll();
      setPaymentMethods(data);
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (methodId: number) => {
    try {
      await paymentMethodService.delete(methodId);
      setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
      toast({
        title: "Payment method removed",
        description: "The payment method has been removed from your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove payment method.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const result = await paymentMethodService.create({
        card_number: formData.card_number,
        cardholder_name: formData.cardholder_name,
        expiry_month: parseInt(formData.expiry_month),
        expiry_year: parseInt(formData.expiry_year),
        cvv: formData.cvv,
      });

      if (result.data) {
        setPaymentMethods(prev => [...prev, result.data!]);
        setIsDialogOpen(false);
        setFormData({
          card_number: "",
          cardholder_name: "",
          expiry_month: "",
          expiry_year: "",
          cvv: "",
        });
        toast({
          title: "Payment method added",
          description: "Your new payment method has been added successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add payment method.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method.",
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
          <h1 className="text-2xl font-bold text-foreground">Payment Methods</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
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
                  <Input 
                    id="cardNumber" 
                    placeholder="1234 5678 9012 3456"
                    value={formData.card_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, card_number: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input 
                    id="cardName" 
                    placeholder="John Doe"
                    value={formData.cardholder_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardholder_name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Month</Label>
                    <Input 
                      id="expiryMonth" 
                      placeholder="MM"
                      value={formData.expiry_month}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiry_month: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Year</Label>
                    <Input 
                      id="expiryYear" 
                      placeholder="YY"
                      value={formData.expiry_year}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiry_year: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input 
                      id="cvv" 
                      placeholder="123" 
                      type="password"
                      value={formData.cvv}
                      onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Card"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No payment methods saved</h3>
          <p className="text-muted-foreground">Add a payment method for faster checkout.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={method.is_default ? "ring-2 ring-primary" : ""}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getCardIcon(method.card_type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{getCardLabel(method.card_type)} •••• {method.last_four}</p>
                        {method.is_default && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.expiry_month}/{method.expiry_year} • {method.cardholder_name}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

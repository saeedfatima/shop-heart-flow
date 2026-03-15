import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle, MessageSquare, Mail, Phone, Clock, FileText, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data until Backend API is ready
const mockTickets = [
  {
    id: "TKT-001",
    subject: "Where is my order?",
    status: "open",
    category: "order",
    date: "1 day ago",
  },
  {
    id: "TKT-002",
    subject: "Received wrong item",
    status: "resolved",
    category: "return",
    date: "1 week ago",
  }
];

const UserHelp = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Ticket Submitted Successfully",
        description: "Our support team will review your complaint and get back to you shortly.",
      });
      setFormData({ subject: "", category: "general", message: "" });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Help & Support
        </h1>
        <p className="text-muted-foreground mt-1">Need help? We're here for you. Submit a ticket or contact us directly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Contact Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Submit a Support Ticket
              </CardTitle>
              <CardDescription>
                Open a dispute, file a complaint, or ask a question. We typically respond within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Issue</option>
                      <option value="return">Return/Refund</option>
                      <option value="payment">Payment Problem</option>
                      <option value="complaint">File a Complaint</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      placeholder="Brief summary of the issue" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Detailed Description</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Please provide as much detail as possible to help us resolve this for you..."
                    className="min-h-[150px]"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Previous Tickets Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Recent Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTickets.map((ticket) => (
                  <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary/50 rounded-lg border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-primary">{ticket.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-foreground">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">Submitted {ticket.date} • Category: {ticket.category}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-4 sm:mt-0">
                      View details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Other ways to reach us</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <a href="mailto:support@fashionaccessories.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    support@fashionaccessories.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+234 800 FA SUPPORT</p>
                  <p className="text-xs text-muted-foreground mt-1">Mon-Fri, 9am - 6pm WAT</p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-t pt-4 mt-4">
                <Clock className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Avg. Response Time</p>
                  <p className="text-sm text-muted-foreground">Within 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </motion.div>
  );
};

export default UserHelp;

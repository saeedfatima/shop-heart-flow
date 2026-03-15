import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Megaphone, Send, Mail, Bell, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminAnnouncements = () => {
  const { toast } = useToast();
  
  // State for Email Broadcast
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // State for Site Notification
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("info");
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject || !emailBody) return;
    
    setIsSendingEmail(true);
    
    // Simulate backend API call delay
    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailSubject("");
      setEmailBody("");
      toast({
        title: "Email Broadcast Queued",
        description: "Your message is being sent to all active users.",
      });
    }, 1500);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;

    setIsSendingNotif(true);

    // Simulate backend API call delay
    setTimeout(() => {
      setIsSendingNotif(false);
      setNotifTitle("");
      setNotifMessage("");
      toast({
        title: "Site Notification Published",
        description: "The alert has been pushed to the notification feeds of all users.",
      });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Announcements & Broadcasts</h1>
        <p className="text-muted-foreground">Send mass emails or push alerts to user notification feeds.</p>
      </div>

      <Tabs defaultValue="site" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="site" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Site Notification</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Email Broadcast</span>
          </TabsTrigger>
        </TabsList>

        {/* Site Notification Panel */}
        <TabsContent value="site">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Push Site Notification
              </CardTitle>
              <CardDescription>
                This will appear in the "Notifications" tab for all users on their dashboard.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSendNotification}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="notifType">Notification Type</Label>
                     <select 
                        id="notifType"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={notifType}
                        onChange={(e) => setNotifType(e.target.value)}
                      >
                        <option value="info">Info (Blue)</option>
                        <option value="success">Success (Green)</option>
                        <option value="warning">Warning (Yellow)</option>
                        <option value="error">Alert (Red)</option>
                      </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notifTitle">Title</Label>
                    <Input 
                      id="notifTitle"
                      placeholder="e.g., Flash Sale Tomorrow!" 
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notifMessage">Short Message</Label>
                  <Textarea 
                    id="notifMessage"
                    placeholder="Brief detail about the notification..." 
                    rows={4}
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 flex flex-col items-center">
                <Button type="submit" className="w-full sm:w-auto self-end" disabled={isSendingNotif}>
                  {isSendingNotif ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                  ) : (
                      <>
                        <Megaphone className="mr-2 h-4 w-4" />
                        Publish to All Users
                      </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Email Broadcast Panel */}
        <TabsContent value="email">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Send Email Broadcast
              </CardTitle>
              <CardDescription>
                Draft an email to be dispatched to the registered inboxes of all active users.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSendEmail}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailSubject">Subject Line</Label>
                  <Input 
                    id="emailSubject"
                    placeholder="e.g., Important update regarding your account" 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailBody">Message Body</Label>
                  <Textarea 
                    id="emailBody"
                    placeholder="Type your email message here. HTML is permitted." 
                    className="min-h-[250px]"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 flex flex-col items-center border-t">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        Requires PHP mailer or Resend integration to actually deliver emails.
                    </p>
                    <Button type="submit" className="w-full sm:w-auto" disabled={isSendingEmail}>
                      {isSendingEmail ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Dispatching...
                          </>
                      ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Email
                          </>
                      )}
                    </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

      </Tabs>
      
    </motion.div>
  );
};

export default AdminAnnouncements;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Send,
  Loader2,
  User as UserIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminService, Ticket, TicketReply } from "@/lib/apiServices";

const AdminTickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Dialog State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    const data = await adminService.getTickets();
    setTickets(data);
    setIsLoading(false);
  };



  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400";
      case "medium": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "open": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setReplyMessage("");
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    
    setIsSending(true);
    
    const { error } = await adminService.replyTicket(selectedTicket.id, replyMessage);
    
    if (error) {
        toast({ title: "Reply Failed", description: error, variant: "destructive" });
    } else {
        toast({
            title: "Reply Sent",
            description: `Your response has been sent to ${selectedTicket.user_name}.`,
        });
        setReplyMessage("");
        loadTickets(); // Refresh list after reply
    }
    setIsSending(false);
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;

    // Optional: Add resolve endpoint call
    // await adminService.updateTicketStatus(selectedTicket.id, 'resolved');
    
    const updatedTickets = tickets.map(t => 
      t.id === selectedTicket.id ? { ...t, status: 'resolved' as const } : t
    );
    setTickets(updatedTickets);
    setSelectedTicket({ ...selectedTicket, status: 'resolved' as const });
    
    toast({
      title: "Ticket Resolved",
      description: `Ticket ${selectedTicket.ticket_number} marked as resolved.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground">Manage user complaints, disputes, and inquiries.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === "open").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === "resolved").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {isLoading ? (
                <div className="p-12 text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary opacity-50" />
                    <p className="text-muted-foreground">Loading support tickets...</p>
                </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No tickets found matching your criteria</p>
              </div>
            ) : (
                filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  onClick={() => handleOpenTicket(ticket)}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{ticket.ticket_number}</span>
                        <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {ticket.category}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {ticket.subject}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {ticket.user_name} • {ticket.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 text-sm text-muted-foreground gap-2">
                     <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                     <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                         View Details
                     </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Reply Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {selectedTicket && (
            <>
              {/* Header Info */}
              <div className="border-b p-6 bg-muted/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <DialogTitle className="text-xl">{selectedTicket.subject}</DialogTitle>
                      <Badge variant="outline" className={selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                         {selectedTicket.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mr-6">
                      Ticket {selectedTicket.id} • Opened {new Date(selectedTicket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-6 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedTicket.user_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <a href={`mailto:${selectedTicket.user_email}`} className="hover:text-primary hover:underline">
                      {selectedTicket.user_email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Thread/Replies Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[300px] bg-background">
                {/* Original Complaint Highlight */}
                <div className="bg-secondary/30 p-4 rounded-xl border border-secondary mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        Original Complaint
                    </p>
                    <p className="text-sm font-medium leading-relaxed">
                        {selectedTicket.message}
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute inset-x-0 top-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-muted"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground font-medium">History</span>
                    </div>
                </div>

                {selectedTicket.replies?.map((reply: TicketReply, index: number) => (
                    <div key={index} className={`flex gap-4 ${reply.is_admin_reply ? 'flex-row-reverse' : ''}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${reply.is_admin_reply ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {reply.is_admin_reply ? 'A' : 'U'}
                        </div>
                        <div className={`flex flex-col ${reply.is_admin_reply ? 'items-end' : 'items-start'} max-w-[85%]`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-xs font-medium">
                                    {reply.is_admin_reply ? 'Support Agent' : selectedTicket.user_name}
                                </span>
                                <span className="text-xs text-muted-foreground">{new Date(reply.created_at).toLocaleString()}</span>
                            </div>
                            <div className={`p-3 rounded-2xl text-sm ${
                                reply.sender === 'admin' 
                                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                  : 'bg-muted rounded-tl-none border shadow-sm'
                            }`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="border-t p-6 bg-card">
                {selectedTicket.status === 'resolved' ? (
                     <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-600 dark:text-green-400 font-medium">
                         <div className="flex items-center justify-center gap-2 mb-1">
                             <CheckCircle2 className="h-4 w-4" />
                             Incident Resolved
                         </div>
                         This ticket is closed. No further replies can be sent.
                     </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="reply" className="text-xs font-semibold uppercase text-muted-foreground">Admin Response</Label>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50/50" 
                                onClick={handleResolveTicket}
                            >
                                <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                Resolve Ticket
                            </Button>
                        </div>
                        <div className="relative">
                            <Textarea 
                                id="reply"
                                placeholder="Type your update to the user..."
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                className="min-h-[120px] pr-12 pb-10 resize-none rounded-xl border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
                            />
                            <div className="absolute bottom-3 right-3">
                                <Button 
                                    onClick={handleSendReply} 
                                    disabled={!replyMessage.trim() || isSending}
                                    size="sm"
                                    className="rounded-lg px-4"
                                >
                                    {isSending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Update
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">
                            Pressing send will notify the user via email and site notification.
                        </p>
                    </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTickets;

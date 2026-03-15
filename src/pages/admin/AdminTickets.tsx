import { useState } from "react";
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

// Mock data until Backend API is ready
const mockTickets = [
  {
    id: "TKT-001",
    user_name: "Jane Doe",
    user_email: "jane.doe@example.com",
    subject: "Where is my order?",
    message: "I placed an order 3 days ago and it hasn't shipped yet. Order number is #ORD-2024-001.",
    status: "open",
    category: "order",
    date: "1 day ago",
    priority: "high",
    replies: [
        {
            sender: "user",
            message: "I placed an order 3 days ago and it hasn't shipped yet. Order number is #ORD-2024-001.",
            date: "1 day ago",
        }
    ]
  },
  {
    id: "TKT-002",
    user_name: "John Smith",
    user_email: "john.smith@example.com",
    subject: "Received wrong item",
    message: "I ordered a black watch but received a brown one instead.",
    status: "resolved",
    category: "return",
    date: "1 week ago",
    priority: "medium",
    replies: [
        {
            sender: "user",
            message: "I ordered a black watch but received a brown one instead.",
            date: "1 week ago",
        },
        {
            sender: "admin",
            message: "We apologize for the mix-up! We have generated a return label for you, and a replacement black watch is on its way.",
            date: "6 days ago",
        }
    ]
  },
  {
    id: "TKT-003",
    user_name: "Alice Johnson",
    user_email: "alice@example.com",
    subject: "Payment failed but money deducted",
    message: "My card was charged but the website says the payment failed. Please help.",
    status: "open",
    category: "payment",
    date: "2 hours ago",
    priority: "urgent",
    replies: [
        {
            sender: "user",
            message: "My card was charged but the website says the payment failed. Please help.",
            date: "2 hours ago",
        }
    ]
  }
];

interface TicketReply {
  sender: 'user' | 'admin';
  message: string;
  date: string;
}

interface Ticket {
  id: string;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  status: string;
  category: string;
  date: string;
  priority: string;
  replies: TicketReply[];
}

const AdminTickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Dialog State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

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

  const handleSendReply = () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    
    setIsSending(true);
    
    // Simulate API Call
    setTimeout(() => {
      // Update local state to show the reply
      const updatedTickets = tickets.map(t => {
        if (t.id === selectedTicket.id) {
            const newReply = { sender: 'admin', message: replyMessage, date: 'Just now' };
            const updatedTicket = { ...t, replies: [...t.replies, newReply] };
            setSelectedTicket(updatedTicket); // Update dialog view
            return updatedTicket;
        }
        return t;
      });
      
      setTickets(updatedTickets);
      setReplyMessage("");
      setIsSending(false);
      
      toast({
        title: "Reply Sent",
        description: `Your response has been sent to ${selectedTicket.user_name}.`,
      });
    }, 1000);
  };

  const handleResolveTicket = () => {
      if(!selectedTicket) return;

      const updatedTickets = tickets.map(t => 
        t.id === selectedTicket.id ? { ...t, status: 'resolved' } : t
      );
      setTickets(updatedTickets);
      setSelectedTicket({...selectedTicket, status: 'resolved'});
      
      toast({
        title: "Ticket Resolved",
        description: `Ticket ${selectedTicket.id} marked as resolved.`,
      });
  }

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
            {filteredTickets.length === 0 ? (
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
                        <span className="font-semibold">{ticket.id}</span>
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
                     <span>{ticket.date}</span>
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
                      Ticket {selectedTicket.id} • Opened {selectedTicket.date}
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
                {selectedTicket.replies.map((reply: TicketReply, index: number) => (
                    <div key={index} className={`flex gap-4 ${reply.sender === 'admin' ? 'flex-row-reverse' : ''}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${reply.sender === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {reply.sender === 'admin' ? 'A' : 'U'}
                        </div>
                        <div className={`flex flex-col ${reply.sender === 'admin' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-xs font-medium">
                                    {reply.sender === 'admin' ? 'Support Agent' : selectedTicket.user_name}
                                </span>
                                <span className="text-xs text-muted-foreground">{reply.date}</span>
                            </div>
                            <div className={`p-3 rounded-lg text-sm ${
                                reply.sender === 'admin' 
                                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                  : 'bg-muted rounded-tl-none'
                            }`}>
                                <p className="whitespace-pre-wrap">{reply.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="border-t p-4 bg-muted/10">
                {selectedTicket.status === 'resolved' ? (
                     <div className="text-center p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                         This ticket has been marked as resolved and is closed.
                     </div>
                ) : (
                    <div className="space-y-4">
                        <Label htmlFor="reply" className="sr-only">Reply to user</Label>
                        <Textarea 
                            id="reply"
                            placeholder="Type your response to the user..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="min-h-[100px] resize-none"
                        />
                        <div className="flex justify-between items-center">
                            <Button variant="outline" size="sm" onClick={handleResolveTicket}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                Mark as Resolved
                            </Button>
                            
                            <Button 
                                onClick={handleSendReply} 
                                disabled={!replyMessage.trim() || isSending}
                            >
                                {isSending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Send Reply
                            </Button>
                        </div>
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

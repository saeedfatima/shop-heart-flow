import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Mail, Users, UserPlus, ShoppingBag, DollarSign } from "lucide-react";

const mockCustomers = [
  { id: "USR-001", name: "John Doe", email: "john@example.com", orders: 12, spent: 1299.99, joined: "2023-06-15", status: "active", avatar: null },
  { id: "USR-002", name: "Jane Smith", email: "jane@example.com", orders: 8, spent: 849.50, joined: "2023-08-22", status: "active", avatar: null },
  { id: "USR-003", name: "Bob Wilson", email: "bob@example.com", orders: 5, spent: 429.99, joined: "2023-10-10", status: "active", avatar: null },
  { id: "USR-004", name: "Alice Brown", email: "alice@example.com", orders: 15, spent: 2150.00, joined: "2023-03-05", status: "vip", avatar: null },
  { id: "USR-005", name: "Charlie Davis", email: "charlie@example.com", orders: 3, spent: 199.99, joined: "2024-01-02", status: "new", avatar: null },
  { id: "USR-006", name: "Emma Johnson", email: "emma@example.com", orders: 22, spent: 3450.00, joined: "2022-11-18", status: "vip", avatar: null },
  { id: "USR-007", name: "Michael Lee", email: "michael@example.com", orders: 0, spent: 0, joined: "2024-01-10", status: "inactive", avatar: null },
  { id: "USR-008", name: "Sarah White", email: "sarah@example.com", orders: 7, spent: 789.99, joined: "2023-09-05", status: "active", avatar: null },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "vip": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "new": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    default: return "bg-gray-100 text-gray-800";
  }
};

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Customer Management</h1>
        <p className="text-muted-foreground">View and manage customer accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">1,893</p>
                <p className="text-xs text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">142</p>
                <p className="text-xs text-muted-foreground">New This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">4.2</p>
                <p className="text-xs text-muted-foreground">Avg. Orders/Customer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">$156</p>
                <p className="text-xs text-muted-foreground">Avg. Customer Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Customers</CardTitle>
              <CardDescription>View customer details and order history</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead className="hidden sm:table-cell">Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{customer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{customer.email}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell className="hidden sm:table-cell">${customer.spent.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{customer.joined}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminCustomers;

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, Package, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockProducts = [
  { id: "PRD-001", name: "Classic White Tee", category: "T-Shirts", price: 29.99, stock: 150, status: "active", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop" },
  { id: "PRD-002", name: "Denim Jacket", category: "Outerwear", price: 89.99, stock: 45, status: "active", image: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=100&h=100&fit=crop" },
  { id: "PRD-003", name: "Summer Dress", category: "Dresses", price: 59.99, stock: 0, status: "out_of_stock", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=100&h=100&fit=crop" },
  { id: "PRD-004", name: "Leather Belt", category: "Accessories", price: 39.99, stock: 78, status: "active", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop" },
  { id: "PRD-005", name: "Canvas Sneakers", category: "Footwear", price: 69.99, stock: 12, status: "low_stock", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop" },
  { id: "PRD-006", name: "Cashmere Sweater", category: "Sweaters", price: 129.99, stock: 32, status: "active", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&h=100&fit=crop" },
  { id: "PRD-007", name: "Silk Scarf", category: "Accessories", price: 59.99, stock: 67, status: "active", image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=100&h=100&fit=crop" },
  { id: "PRD-008", name: "Wool Coat", category: "Outerwear", price: 199.99, stock: 8, status: "low_stock", image: "https://images.unsplash.com/photo-1544923246-77307dd628b7?w=100&h=100&fit=crop" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "out_of_stock": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "low_stock": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    default: return "bg-gray-100 text-gray-800";
  }
};

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const categories = [...new Set(mockProducts.map(p => p.category))];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSave = () => {
    setIsDialogOpen(false);
    toast({
      title: "Product saved",
      description: "The product has been saved successfully.",
    });
  };

  const handleDelete = (productId: string) => {
    toast({
      title: "Product deleted",
      description: "The product has been removed.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products Management</h1>
          <p className="text-muted-foreground">Add, edit, and manage your products</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the product details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" placeholder="Classic White Tee" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" placeholder="29.99" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" placeholder="100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Product description..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Product Images</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop images here, or click to upload
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">124</p>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">98</p>
            <p className="text-xs text-muted-foreground">In Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-orange-600">15</p>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">11</p>
            <p className="text-xs text-muted-foreground">Out of Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Products</CardTitle>
              <CardDescription>Manage your product inventory</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden sm:table-cell">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{product.stock}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
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

export default AdminProducts;

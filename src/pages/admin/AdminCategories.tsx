import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tag, Plus, Edit, Trash2, Package, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockCategories = [
  { id: 1, name: "T-Shirts", slug: "t-shirts", products: 45, status: "active", description: "Casual and comfortable t-shirts" },
  { id: 2, name: "Dresses", slug: "dresses", products: 32, status: "active", description: "Elegant dresses for every occasion" },
  { id: 3, name: "Outerwear", slug: "outerwear", products: 18, status: "active", description: "Jackets, coats and more" },
  { id: 4, name: "Accessories", slug: "accessories", products: 56, status: "active", description: "Belts, scarves, and fashion accessories" },
  { id: 5, name: "Footwear", slug: "footwear", products: 24, status: "active", description: "Shoes, boots, and sneakers" },
  { id: 6, name: "Sweaters", slug: "sweaters", products: 15, status: "active", description: "Warm and cozy sweaters" },
  { id: 7, name: "Pants", slug: "pants", products: 28, status: "active", description: "Jeans, trousers, and more" },
  { id: 8, name: "Sale", slug: "sale", products: 12, status: "featured", description: "Discounted items" },
];

const AdminCategories = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsDialogOpen(false);
    toast({
      title: "Category saved",
      description: "The category has been saved successfully.",
    });
  };

  const handleDelete = (categoryId: number) => {
    toast({
      title: "Category deleted",
      description: "The category has been removed.",
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
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new product category.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" placeholder="T-Shirts" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" placeholder="t-shirts" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Category description..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Folder className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{mockCategories.length}</p>
                <p className="text-xs text-muted-foreground">Total Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">230</p>
                <p className="text-xs text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Tag className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">29</p>
                <p className="text-xs text-muted-foreground">Avg. Products/Category</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                {category.status === "featured" && (
                  <Badge variant="secondary">Featured</Badge>
                )}
              </div>
              <CardDescription className="text-xs">/{category.slug}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{category.products} products</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminCategories;

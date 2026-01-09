import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNaira } from "@/lib/currency";

const mockWishlist = [
  { 
    id: 1, 
    name: "Cashmere Sweater", 
    price: 129.99, 
    originalPrice: 159.99,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop",
    inStock: true,
    addedDate: "Jan 10, 2024"
  },
  { 
    id: 2, 
    name: "Leather Boots", 
    price: 189.99, 
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    inStock: true,
    addedDate: "Jan 8, 2024"
  },
  { 
    id: 3, 
    name: "Silk Scarf", 
    price: 59.99, 
    originalPrice: 79.99,
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop",
    inStock: true,
    addedDate: "Jan 5, 2024"
  },
  { 
    id: 4, 
    name: "Vintage Denim Jacket", 
    price: 149.99, 
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=400&h=400&fit=crop",
    inStock: false,
    addedDate: "Dec 28, 2023"
  },
  { 
    id: 5, 
    name: "Summer Dress", 
    price: 89.99, 
    originalPrice: 119.99,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop",
    inStock: true,
    addedDate: "Dec 20, 2023"
  },
  { 
    id: 6, 
    name: "Classic White Sneakers", 
    price: 99.99, 
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
    inStock: true,
    addedDate: "Dec 15, 2023"
  },
];

const UserWishlist = () => {
  const { toast } = useToast();

  const handleAddToCart = (item: typeof mockWishlist[0]) => {
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handleRemove = (item: typeof mockWishlist[0]) => {
    toast({
      title: "Removed from wishlist",
      description: `${item.name} has been removed from your wishlist.`,
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
            <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
            <p className="text-muted-foreground">{mockWishlist.length} items saved</p>
          </div>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share List
          </Button>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockWishlist.map((item) => (
          <Card key={item.id} className="overflow-hidden group">
            <div className="relative aspect-square">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              {!item.inStock && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
                </div>
              )}
              {item.originalPrice && (
                <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                  Sale
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                onClick={() => handleRemove(item)}
              >
                <Heart className="h-5 w-5 fill-primary text-primary" />
              </Button>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">{item.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-bold text-primary">{formatNaira(item.price)}</span>
                {item.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatNaira(item.originalPrice)}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  size="sm"
                  disabled={!item.inStock}
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleRemove(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Added {item.addedDate}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default UserWishlist;

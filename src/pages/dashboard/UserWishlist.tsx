import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNaira } from "@/lib/currency";
import { wishlistService, WishlistItem, normalizeProduct } from "@/lib/apiServices";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

const UserWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const data = await wishlistService.getAll();
      setWishlist(data);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    toast({
      title: "Added to cart",
      description: `${item.product.name} has been added to your cart.`,
    });
  };

  const handleRemove = async (item: WishlistItem) => {
    try {
      await wishlistService.remove(Number(item.product.id));
      setWishlist(prev => prev.filter(w => w.id !== item.id));
      toast({
        title: "Removed from wishlist",
        description: `${item.product.name} has been removed from your wishlist.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      });
    }
  };

  const getProductImage = (item: WishlistItem) => {
    const image = item.product.images?.[0];
    if (!image) return '/placeholder.svg';
    return image.startsWith('http') ? image : `${API_BASE_URL}${image}`;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
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
            <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
            <p className="text-muted-foreground">{wishlist.length} items saved</p>
          </div>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share List
          </Button>
        </div>
      </div>

      {/* Wishlist Grid */}
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-4">Start adding items you love!</p>
          <Button asChild>
            <Link to="/shop">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative aspect-square">
                <img 
                  src={getProductImage(item)} 
                  alt={item.product.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                {!item.product.inStock && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
                  </div>
                )}
                {item.product.originalPrice && (
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
                <Link to={`/product/${item.product.id}`}>
                  <h3 className="font-semibold mb-1 hover:text-primary transition-colors">{item.product.name}</h3>
                </Link>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-primary">{formatNaira(item.product.price)}</span>
                  {item.product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatNaira(item.product.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    size="sm"
                    disabled={!item.product.inStock}
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
                <p className="text-xs text-muted-foreground mt-2">
                  Added {new Date(item.added_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default UserWishlist;

// Cart item component for cart page
import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CartItem as CartItemType } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity, selectedColor, selectedSize } = item;

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(product.id, selectedColor.name, selectedSize.name, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(product.id, selectedColor.name, selectedSize.name);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-4 py-6 border-b border-border"
    >
      {/* Product Image */}
      <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: selectedColor.value }}
                />
                {selectedColor.name}
              </span>
              <span>•</span>
              <span>{selectedSize.name}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 border border-border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price */}
          <span className="font-semibold">${(product.price * quantity).toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  );
}

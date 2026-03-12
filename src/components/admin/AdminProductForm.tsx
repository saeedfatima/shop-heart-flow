import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DialogFooter } from "@/components/ui/dialog";
import { ImagePlus, X, Loader2, Plus } from "lucide-react";
import { adminService, categoryService, Category, Product } from "@/lib/apiServices";
import { useToast } from "@/hooks/use-toast";

interface ColorInput {
  name: string;
  value: string;
}

interface SizeInput {
  name: string;
  inStock: boolean;
}

interface ExistingImage {
  id: number;
  image: string;
  alt_text?: string;
}

interface AdminProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editProduct?: Product & { _rawImages?: ExistingImage[] };
}

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const AdminProductForm = ({ onSuccess, onCancel, editProduct }: AdminProductFormProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!editProduct;

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);

  // Colors
  const [colors, setColors] = useState<ColorInput[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorValue, setNewColorValue] = useState("#000000");

  // Sizes
  const [sizes, setSizes] = useState<SizeInput[]>([]);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(setCategories);
  }, []);

  // Pre-populate form when editing
  useEffect(() => {
    if (!editProduct) return;
    setName(editProduct.name || "");
    setPrice(String(editProduct.price || ""));
    setOriginalPrice(editProduct.original_price || editProduct.originalPrice ? String(editProduct.original_price || editProduct.originalPrice) : "");
    setDescription(editProduct.description || "");
    setCategoryId(editProduct.category_id ? String(editProduct.category_id) : "");
    setInStock(editProduct.inStock ?? editProduct.in_stock ?? true);
    setFeatured(editProduct.featured ?? false);
    setColors(editProduct.colors || []);
    setSizes((editProduct.sizes || []).map(s => ({ name: s.name, inStock: s.inStock })));
    if (editProduct._rawImages) {
      setExistingImages(editProduct._rawImages);
    }
  }, [editProduct]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: number) => {
    setDeleteImageIds((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const addColor = () => {
    if (!newColorName.trim()) return;
    setColors((prev) => [...prev, { name: newColorName.trim(), value: newColorValue }]);
    setNewColorName("");
    setNewColorValue("#000000");
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (sizeName: string) => {
    setSizes((prev) => {
      const exists = prev.find((s) => s.name === sizeName);
      if (exists) return prev.filter((s) => s.name !== sizeName);
      return [...prev, { name: sizeName, inStock: true }];
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: "Validation Error", description: "Product name is required.", variant: "destructive" });
      return;
    }
    if (!price || Number(price) <= 0) {
      toast({ title: "Validation Error", description: "Valid price is required.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", price);
      if (originalPrice) formData.append("original_price", originalPrice);
      formData.append("description", description.trim());
      if (categoryId) formData.append("category_id", categoryId);
      formData.append("in_stock", inStock ? "1" : "0");
      formData.append("featured", featured ? "1" : "0");

      imageFiles.forEach((file) => {
        formData.append("images[]", file);
      });

      if (colors.length > 0) {
        formData.append("colors", JSON.stringify(colors));
      }
      if (sizes.length > 0) {
        formData.append("sizes", JSON.stringify(sizes));
      }

      let result;
      if (isEditMode) {
        if (deleteImageIds.length > 0) {
          formData.append("delete_images", JSON.stringify(deleteImageIds));
        }
        result = await adminService.updateProduct(editProduct!.id, formData);
      } else {
        result = await adminService.createProduct(formData);
      }

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({
          title: isEditMode ? "Product Updated" : "Product Created",
          description: `"${name}" has been ${isEditMode ? 'updated' : 'added'} successfully.`,
        });
        onSuccess();
      }
    } catch {
      toast({ title: "Error", description: `Failed to ${isEditMode ? 'update' : 'create'} product.`, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const mediaBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '';

  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* Name & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prod-name">Product Name *</Label>
          <Input id="prod-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Classic White Tee" />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prod-price">Price (₦) *</Label>
          <Input id="prod-price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="45000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prod-orig-price">Original Price (₦)</Label>
          <Input id="prod-orig-price" type="number" min="0" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="60000 (optional, for sale)" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="prod-desc">Description</Label>
        <Textarea id="prod-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..." rows={3} />
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch id="prod-stock" checked={inStock} onCheckedChange={setInStock} />
          <Label htmlFor="prod-stock">In Stock</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="prod-featured" checked={featured} onCheckedChange={setFeatured} />
          <Label htmlFor="prod-featured">Featured</Label>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>Product Images</Label>
        <div className="flex flex-wrap gap-3">
          {/* Existing images (edit mode) */}
          {existingImages.map((img) => {
            const src = img.image.startsWith('http') ? img.image : `${mediaBaseUrl}${img.image}`;
            return (
              <div key={`existing-${img.id}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                <img src={src} alt={img.alt_text || 'Product'} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          {/* New image previews */}
          {imagePreviews.map((src, i) => (
            <div key={`new-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-primary/50 group">
              <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewImage(i)}
                className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">Add</span>
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <Label>Sizes</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_SIZES.map((s) => {
            const selected = sizes.some((sz) => sz.name === s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:border-primary"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <Label>Colors</Label>
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {colors.map((c, i) => (
              <Badge key={i} variant="secondary" className="gap-1.5 pr-1">
                <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: c.value }} />
                {c.name}
                <button type="button" onClick={() => removeColor(i)} className="ml-0.5 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={newColorValue}
            onChange={(e) => setNewColorValue(e.target.value)}
            className="w-8 h-8 rounded border border-border cursor-pointer"
          />
          <Input
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            placeholder="Color name (e.g. Red)"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
          />
          <Button type="button" variant="outline" size="sm" onClick={addColor}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="pt-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditMode ? "Update Product" : "Create Product"}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default AdminProductForm;

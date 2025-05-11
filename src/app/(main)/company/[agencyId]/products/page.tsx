"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePathname } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  status: boolean;
  createdAt: Date;
  email?: string; // Add email field
};

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const agencyId = pathParts[2]; // assuming the URL is /company/<agencyId>/billing/checkout
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
    agencyId: agencyId,
    status: true,
  });

  // Fetch products from the server when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?agencyId=${agencyId}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, [agencyId]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = async () => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          description: newProduct.description,
          stock: parseInt(newProduct.stock),
          status: newProduct.status,
          agencyId: newProduct.agencyId,
          createdAt: new Date(), // Ensure createdAt is a Date object
        }),
      });

      if (!res.ok) throw new Error("Failed to add product");

      const created = await res.json();
      setProducts((prev) => [...prev, created]);

      setNewProduct({
        name: "",
        price: "",
        category: "",
        description: "",
        stock: "",
        agencyId,
        status: true,
      });
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product");

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // Format data for chart
  const chartData = Object.values(
    products.reduce((acc, product) => {
      const date = new Date(product.createdAt).toISOString().split("T")[0]; // Ensure it's a Date object
      if (!acc[date]) acc[date] = { date, count: 0 };
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; count: number }>),
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Product Management</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex gap-2 items-center">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
              <Input
                placeholder="Price"
                type="number"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />
              <Input
                placeholder="Category"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              />
              <Textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
              <Input
                placeholder="Stock Quantity"
                type="number"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
              />
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Active</Label>
                <Switch
                  id="status"
                  checked={newProduct.status}
                  onCheckedChange={(checked) =>
                    setNewProduct({ ...newProduct, status: checked })
                  }
                />
              </div>
              <Button onClick={handleAddProduct} className="w-full">
                Create Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
<p>The payment for the product will be provided by Team Workeloo with 12 hours or earlier for more information reach out to atharvaanbhule@gmail.com.</p>
      <Table className="border rounded-md shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
 
        <TableBody>
          {filtered.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {product.description}
              </TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.status
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.status ? "Active" : "Inactive"}
                </span>
              </TableCell>

              <TableCell className="text-right space-y-2">
                <Input
                  type="email"
                  placeholder="Customer email"
                  onChange={(e) => {
                    const updatedProducts = products.map((p) =>
                      p.id === product.id ? { ...p, email: e.target.value } : p
                    );
                    setProducts(updatedProducts);
                  }}
                  value={(product as any).email || ""}
                  className="w-[180px] mb-2"
                />
                <Button
  size="sm"
  onClick={async () => {
    const email = (document.querySelector(
      `input[type="email"]`
    ) as HTMLInputElement)?.value;
    if (!email) {
      toast.error("Enter an email first");
      return;
    }

    try {
      const response = await fetch("/api/email-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          //@ts-ignore
          productId: product.id,
          receipt: email.slice(0, 40), // Ensure receipt is no longer than 40 characters
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send checkout email");
      }

      toast.success("Checkout link sent!");
    } catch (err) {
      console.error("Error sending email:", err);
      toast.error("Error sending email");
    }
  }}
>
  Send Checkout
</Button>

              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

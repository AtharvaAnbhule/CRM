"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle, Trash2, Download, Save, Upload } from "lucide-react";

const taxRates = [0, 5, 10, 15, 20];

const invoiceSchema = z.object({
  from: z.object({
    name: z.string().min(1, "Required"),
    address: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Required"),
    website: z.string().optional(),
    taxId: z.string().optional(),
  }),
  to: z.object({
    name: z.string().min(1, "Required"),
    address: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Required"),
    taxId: z.string().optional(),
  }),
  invoiceNumber: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  dueDate: z.string().min(1, "Required"),
  currency: z.string().min(1, "Required"),
  items: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(1, "Required"),
      quantity: z.number().min(0.01, "Must be at least 0.01"),
      price: z.number().min(0, "Must be positive"),
      tax: z.number().min(0, "Must be positive").max(100, "Max 100%"),
      discount: z.number().min(0, "Must be positive").max(100, "Max 100%").default(0),
    })
  ),
  discount: z.object({
    type: z.enum(["none", "percentage", "fixed"]).default("none"),
    value: z.number().min(0, "Must be positive").default(0),
  }),
  payment: z.object({
    method: z.string().optional(),
    account: z.string().optional(),
    dueDays: z.number().min(1, "Must be at least 1").default(30),
  }),
  notes: z.string().optional(),
  terms: z.string().optional(),
  signature: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue"]).default("draft"),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function InvoiceGenerator() {
  const [activeTab, setActiveTab] = useState("editor");
  const [signatureData, setSignatureData] = useState("");
  const signaturePadRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [clientList, setClientList] = useState<Array<{name: string, email: string, phone: string, address: string}>>([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClient, setNewClient] = useState({name: "", email: "", phone: "", address: ""});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      from: {
        name: "Your Company Name",
        address: "123 Business St, City, Country",
        email: "billing@yourcompany.com",
        phone: "+1 (555) 123-4567",
        website: "www.yourcompany.com",
        taxId: "TAX-123456789",
      },
      to: {
        name: "",
        address: "",
        email: "",
        phone: "",
        taxId: "",
      },
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
      date: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      currency: "USD",
      items: [
        { id: crypto.randomUUID(), description: "Product/Service 1", quantity: 1, price: 100, tax: 10, discount: 0 },
      ],
      discount: {
        type: "none",
        value: 0,
      },
      payment: {
        method: "Bank Transfer",
        account: "Account #: 123456789\nRouting #: 987654321\nBank Name: Your Bank",
        dueDays: 30,
      },
      notes: "Thank you for your business!",
      terms: "Payment due within 30 days. Late payments subject to 5% fee.",
      status: "draft",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Calculate various amounts
  const calculateSubtotal = () => {
    return fields.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateItemDiscounts = () => {
    return fields.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      return sum + (itemTotal * (item.discount / 100));
    }, 0);
  };

  const calculateTax = () => {
    return fields.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const discountedTotal = itemTotal - (itemTotal * (item.discount / 100));
      return sum + (discountedTotal * (item.tax / 100));
    }, 0);
  };

  const calculateInvoiceDiscount = () => {
    const subtotal = calculateSubtotal() - calculateItemDiscounts();
    const discountType = form.watch("discount.type");
    const discountValue = form.watch("discount.value");
    
    if (discountType === "percentage") {
      return subtotal * (discountValue / 100);
    } else if (discountType === "fixed") {
      return discountValue;
    }
    return 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const itemDiscounts = calculateItemDiscounts();
    const invoiceDiscount = calculateInvoiceDiscount();
    const tax = calculateTax();
    
    return subtotal - itemDiscounts - invoiceDiscount + tax;
  };

  // Signature handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signaturePadRef.current) return;
    
    const canvas = signaturePadRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.lineCap = "round";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signaturePadRef.current) return;

    const canvas = signaturePadRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!signaturePadRef.current) return;
    const canvas = signaturePadRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(false);
    setSignatureData(canvas.toDataURL());
    form.setValue("signature", canvas.toDataURL());
  };

  const clearSignature = () => {
    if (!signaturePadRef.current) return;
    const canvas = signaturePadRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
    form.setValue("signature", "");
  };

  // Client management
  const addClient = () => {
    setClientList([...clientList, newClient]);
    setNewClient({name: "", email: "", phone: "", address: ""});
    setShowClientModal(false);
  };

  const selectClient = (client: typeof newClient) => {
    form.setValue("to.name", client.name);
    form.setValue("to.email", client.email);
    form.setValue("to.phone", client.phone);
    form.setValue("to.address", client.address);
  };

  // PDF Generation
  const generatePDF = () => {
    const doc = new jsPDF();
    const values = form.getValues();
    const currencySymbol = getCurrencySymbol(values.currency);

    // Header with logo and invoice info
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("INVOICE", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(values.from.name, 15, 15);
    doc.text(values.from.address, 15, 20);
    if (values.from.website) doc.text(values.from.website, 15, 25);
    if (values.from.taxId) doc.text(`Tax ID: ${values.from.taxId}`, 15, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(`Invoice #: ${values.invoiceNumber}`, 160, 15);
    doc.text(`Date: ${format(new Date(values.date), "MMM dd, yyyy")}`, 160, 20);
    doc.text(`Due Date: ${format(new Date(values.dueDate), "MMM dd, yyyy")}`, 160, 25);
    doc.text(`Status: ${values.status.toUpperCase()}`, 160, 30, { 
      //@ts-ignore
      color: values.status === "paid" ? "#22c55e" : 
             values.status === "overdue" ? "#ef4444" : "#3b82f6"
    });

    // Bill To section
    doc.setFontSize(10);
    doc.text("Bill To:", 15, 50);
    //@ts-ignore
    doc.setFont(undefined, "bold");
    doc.text(values.to.name, 15, 55);
    //@ts-ignore
    doc.setFont(undefined, "normal");
    doc.text(values.to.address, 15, 60);
    doc.text(values.to.email, 15, 65);
    doc.text(values.to.phone, 15, 70);
    if (values.to.taxId) doc.text(`Tax ID: ${values.to.taxId}`, 15, 75);

    // Items table
    autoTable(doc, {
      startY: 90,
      head: [['Description', 'Qty', 'Price', 'Discount', 'Tax', 'Amount']],
      body: values.items.map(item => [
        item.description,
        item.quantity,
        `${currencySymbol}${item.price.toFixed(2)}`,
        item.discount ? `${item.discount}%` : '-',
        `${item.tax}%`,
        `${currencySymbol}${calculateItemAmount(item).toFixed(2)}`
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 }
      },
      didDrawPage: function (data) {
        // Summary section
        doc.setFontSize(10);
        //@ts-ignore
        let yPos = data.cursor.y + 10;
        
        doc.text("Subtotal:", 150, yPos);
        doc.text(`${currencySymbol}${calculateSubtotal().toFixed(2)}`, 180, yPos);
        yPos += 5;
        
        const itemDiscounts = calculateItemDiscounts();
        if (itemDiscounts > 0) {
          doc.text("Item Discounts:", 150, yPos);
          doc.text(`-${currencySymbol}${itemDiscounts.toFixed(2)}`, 180, yPos);
          yPos += 5;
        }
        
        const invoiceDiscount = calculateInvoiceDiscount();
        if (invoiceDiscount > 0) {
          const discountType = values.discount.type === "percentage" ? 
            `${values.discount.value}%` : "Fixed";
          doc.text(`Invoice Discount (${discountType}):`, 150, yPos);
          doc.text(`-${currencySymbol}${invoiceDiscount.toFixed(2)}`, 180, yPos);
          yPos += 5;
        }
        
        const tax = calculateTax();
        doc.text(`Tax (${values.items.reduce((acc, item) => acc + (item.tax > 0 ? 1 : 0), 0)} items):`, 150, yPos);
        doc.text(`${currencySymbol}${tax.toFixed(2)}`, 180, yPos);
        yPos += 5;
        //@ts-ignore
        doc.setFont(undefined, 'bold');
        doc.text("Total:", 150, yPos);
        doc.text(`${currencySymbol}${calculateTotal().toFixed(2)}`, 180, yPos);
        //@ts-ignore
        doc.setFont(undefined, 'normal');
        yPos += 10;
        
        // Payment information
        if (values.payment.method) {
          doc.setFontSize(10);
          doc.text("Payment Method:", 15, yPos);
          doc.text(values.payment.method, 50, yPos);
          yPos += 5;
          
          if (values.payment.account) {
            const accountLines = doc.splitTextToSize(values.payment.account, 100);
            doc.text("Payment Details:", 15, yPos);
            doc.text(accountLines, 50, yPos);
            yPos += accountLines.length * 5 + 5;
          }
        }
        
        // Notes and terms
        if (values.notes) {
          doc.text("Notes:", 15, yPos);
          const notesLines = doc.splitTextToSize(values.notes, 180);
          doc.text(notesLines, 30, yPos + 5);
          yPos += notesLines.length * 5 + 10;
        }
        
        if (values.terms) {
          doc.text("Terms:", 15, yPos);
          const termsLines = doc.splitTextToSize(values.terms, 180);
          doc.text(termsLines, 30, yPos + 5);
          yPos += termsLines.length * 5 + 10;
        }
        
        // Signature
        if (signatureData) {
          doc.addImage(signatureData, 'PNG', 15, yPos, 50, 20);
          doc.text("Authorized Signature", 15, yPos + 25);
        }
      }
    });

    doc.save(`invoice_${values.invoiceNumber}.pdf`);
  };

  const calculateItemAmount = (item: InvoiceFormValues['items'][0]) => {
    const itemTotal = item.price * item.quantity;
    const discountedTotal = itemTotal - (itemTotal * (item.discount / 100));
    return discountedTotal * (1 + item.tax / 100);
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      INR: "₹",
    };
    return symbols[currency] || currency;
  };

  // Save/Load invoice
  const saveInvoice = () => {
    const invoice = form.getValues();
    const blob = new Blob([JSON.stringify(invoice)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${invoice.invoiceNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadInvoice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        form.reset(data);
        if (data.signature) {
          setSignatureData(data.signature);
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Set due date based on payment terms
  useEffect(() => {
    const dueDays = form.watch("payment.dueDays");
    const date = form.watch("date");
    if (date && dueDays) {
      form.setValue("dueDate", format(addDays(new Date(date), dueDays), "yyyy-MM-dd"));
    }
  }, [form.watch("payment.dueDays"), form.watch("date")]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="editor">Invoice Editor</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Load Invoice
            </Button>
            <Button variant="outline" onClick={saveInvoice}>
              <Save className="w-4 h-4 mr-2" /> Save Invoice
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={loadInvoice}
              accept=".json"
              className="hidden"
            />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">From</h3>
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input {...form.register("from.name")} />
                </div>
                <div className="space-y-2">
                  <Label>Address *</Label>
                  <Input {...form.register("from.address")} />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" {...form.register("from.email")} />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input {...form.register("from.phone")} />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input {...form.register("from.website")} />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID</Label>
                  <Input {...form.register("from.taxId")} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Bill To</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowClientModal(true)}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Client
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input {...form.register("to.name")} />
                </div>
                <div className="space-y-2">
                  <Label>Address *</Label>
                  <Input {...form.register("to.address")} />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" {...form.register("to.email")} />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input {...form.register("to.phone")} />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID</Label>
                  <Input {...form.register("to.taxId")} />
                </div>
                {clientList.length > 0 && (
                  <div className="space-y-2">
                    <Label>Saved Clients</Label>
                    <Select onValueChange={(value) => {
                      const client = clientList.find(c => c.name === value);
                      if (client) selectClient(client);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientList.map((client) => (
                          <SelectItem key={client.name} value={client.name}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label>Invoice Number *</Label>
                <Input {...form.register("invoiceNumber")} />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" {...form.register("date")} />
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input type="date" {...form.register("dueDate")} />
              </div>
              <div className="space-y-2">
                <Label>Currency *</Label>
                <Select 
                  onValueChange={(value) => form.setValue("currency", value)}
                  defaultValue={form.watch("currency")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Terms (days)</Label>
                <Input 
                  type="number" 
                  {...form.register("payment.dueDays", { valueAsNumber: true })} 
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  onValueChange={(value) => form.setValue("status", value as any)}
                  defaultValue={form.watch("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ 
                    id: crypto.randomUUID(), 
                    description: "", 
                    quantity: 1, 
                    price: 0, 
                    tax: 0,
                    discount: 0
                  })}
                >
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Qty</TableHead>
                    <TableHead className="w-32">Price</TableHead>
                    <TableHead className="w-24">Discount (%)</TableHead>
                    <TableHead className="w-24">Tax (%)</TableHead>
                    <TableHead className="w-32">Amount</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          {...form.register(`items.${index}.description`)}
                          className="border-none p-0 focus:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          className="border-none p-0 focus:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...form.register(`items.${index}.price`, { valueAsNumber: true })}
                          className="border-none p-0 focus:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          {...form.register(`items.${index}.discount`, { valueAsNumber: true })}
                          className="border-none p-0 focus:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          onValueChange={(value) => 
                            form.setValue(`items.${index}.tax`, parseFloat(value))
                          }
                          value={item.tax.toString()}
                        >
                          <SelectTrigger className="border-none p-0 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {taxRates.map(rate => (
                              <SelectItem key={rate} value={rate.toString()}>
                                {rate}%
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {getCurrencySymbol(form.watch("currency"))}
                        {calculateItemAmount(item).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Discount</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select 
                  onValueChange={(value) => form.setValue("discount.type", value as any)}
                  defaultValue={form.watch("discount.type")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Discount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.watch("discount.type") !== "none" && (
                <div className="space-y-2">
                  <Label>
                    {form.watch("discount.type") === "percentage" ? "Percentage" : "Amount"}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register("discount.value", { valueAsNumber: true })}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Total Discount</Label>
                <div className="text-lg font-medium">
                  -{getCurrencySymbol(form.watch("currency"))}
                  {calculateInvoiceDiscount().toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Input {...form.register("payment.method")} />
              </div>
              <div className="space-y-2">
                <Label>Payment Details</Label>
                <Textarea 
                  {...form.register("payment.account")} 
                  placeholder="Bank account details, PayPal email, etc."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Signature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4">
                <canvas
                  ref={signaturePadRef}
                  width={500}
                  height={200}
                  className="border rounded w-full h-48 cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <div className="flex justify-end mt-2">
                  <Button type="button" variant="outline" onClick={clearSignature}>
                    Clear Signature
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea {...form.register("notes")} />
              </div>
              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <Textarea {...form.register("terms")} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                <Badge variant="outline" className="mr-2">
                  Subtotal: {getCurrencySymbol(form.watch("currency"))}
                  {calculateSubtotal().toFixed(2)}
                </Badge>
                <Badge variant="outline" className="mr-2">
                  Tax: {getCurrencySymbol(form.watch("currency"))}
                  {calculateTax().toFixed(2)}
                </Badge>
                <Badge variant="outline" className="mr-2">
                  Discount: {getCurrencySymbol(form.watch("currency"))}
                  {calculateInvoiceDiscount().toFixed(2)}
                </Badge>
                <Badge className="bg-primary">
                  Total: {getCurrencySymbol(form.watch("currency"))}
                  {calculateTotal().toFixed(2)}
                </Badge>
              </div>
              <Button type="button" onClick={generatePDF}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{form.watch("from.name")}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <p>{form.watch("from.address")}</p>
                    <p>{form.watch("from.email")} • {form.watch("from.phone")}</p>
                    {form.watch("from.website") && <p>{form.watch("from.website")}</p>}
                    {form.watch("from.taxId") && <p>Tax ID: {form.watch("from.taxId")}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <CardTitle className="text-2xl mb-2">INVOICE</CardTitle>
                  <div className="space-y-1">
                    <p className="font-medium">Invoice #: {form.watch("invoiceNumber")}</p>
                    <p className="text-sm">Date: {format(new Date(form.watch("date")), "MMM dd, yyyy")}</p>
                    <p className="text-sm">Due Date: {format(new Date(form.watch("dueDate")), "MMM dd, yyyy")}</p>
                    <Badge 
                      variant="outline" 
                      className={
                        form.watch("status") === "paid" ? "bg-green-100 text-green-800" :
                        form.watch("status") === "overdue" ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      }
                    >
                      {form.watch("status").toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-medium text-sm mb-2">From:</h3>
                  <p className="font-medium">{form.watch("from.name")}</p>
                  <p className="text-sm">{form.watch("from.address")}</p>
                  <p className="text-sm">{form.watch("from.email")}</p>
                  <p className="text-sm">{form.watch("from.phone")}</p>
                  {form.watch("from.taxId") && (
                    <p className="text-sm">Tax ID: {form.watch("from.taxId")}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-2">Bill To:</h3>
                  <p className="font-medium">{form.watch("to.name")}</p>
                  <p className="text-sm">{form.watch("to.address")}</p>
                  <p className="text-sm">{form.watch("to.email")}</p>
                  <p className="text-sm">{form.watch("to.phone")}</p>
                  {form.watch("to.taxId") && (
                    <p className="text-sm">Tax ID: {form.watch("to.taxId")}</p>
                  )}
                               </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {getCurrencySymbol(form.watch("currency"))}
                        {item.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.discount > 0 ? `${item.discount}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.tax > 0 ? `${item.tax}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {getCurrencySymbol(form.watch("currency"))}
                        {calculateItemAmount(item).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end mt-8">
                <div className="w-full md:w-1/2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>
                      {getCurrencySymbol(form.watch("currency"))}
                      {calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  {calculateItemDiscounts() > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Item Discounts:</span>
                      <span className="text-red-500">
                        -{getCurrencySymbol(form.watch("currency"))}
                        {calculateItemDiscounts().toFixed(2)}
                      </span>
                    </div>
                  )}
                  {calculateInvoiceDiscount() > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Invoice Discount (
                        {form.watch("discount.type") === "percentage"
                          ? `${form.watch("discount.value")}%`
                          : "Fixed"}
                        ):
                      </span>
                      <span className="text-red-500">
                        -{getCurrencySymbol(form.watch("currency"))}
                        {calculateInvoiceDiscount().toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tax ({fields.reduce((acc, item) => acc + (item.tax > 0 ? 1 : 0), 0)} items):
                    </span>
                    <span>
                      {getCurrencySymbol(form.watch("currency"))}
                      {calculateTax().toFixed(2)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>
                      {getCurrencySymbol(form.watch("currency"))}
                      {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {form.watch("payment.method") && (
                <div className="mt-8">
                  <h3 className="font-medium mb-2">Payment Information</h3>
                  <p className="font-medium">{form.watch("payment.method")}</p>
                  {form.watch("payment.account") && (
                    <pre className="text-sm whitespace-pre-wrap mt-2">
                      {form.watch("payment.account")}
                    </pre>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {form.watch("notes") && (
                  <div>
                    <h3 className="font-medium mb-2">Notes</h3>
                    <p className="text-sm whitespace-pre-wrap">{form.watch("notes")}</p>
                  </div>
                )}
                {form.watch("terms") && (
                  <div>
                    <h3 className="font-medium mb-2">Terms & Conditions</h3>
                    <p className="text-sm whitespace-pre-wrap">{form.watch("terms")}</p>
                  </div>
                )}
              </div>

              {signatureData && (
                <div className="mt-8">
                  <h3 className="font-medium mb-2">Authorized Signature</h3>
                  <img 
                    src={signatureData} 
                    alt="Signature" 
                    className="h-20 border-b-2 border-black" 
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t">
              <Button onClick={generatePDF}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input 
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input 
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input 
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowClientModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={addClient}
                disabled={!newClient.name || !newClient.address || !newClient.email || !newClient.phone}
              >
                Add Client
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
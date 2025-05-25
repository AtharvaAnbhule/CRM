"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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

const invoiceSchema = z.object({
  from: z.object({
    name: z.string().min(1, "Required"),
    address: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Required"),
  }),
  to: z.object({
    name: z.string().min(1, "Required"),
    address: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Required"),
  }),
  invoiceNumber: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  dueDate: z.string().min(1, "Required"),
  items: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(1, "Required"),
      quantity: z.number().min(1, "Must be at least 1"),
      price: z.number().min(0, "Must be positive"),
      tax: z.number().min(0, "Must be positive").default(0),
    })
  ),
  notes: z.string().optional(),
  terms: z.string().optional(),
  signature: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function InvoiceGenerator() {
  const [activeTab, setActiveTab] = useState("editor");
  const [signatureData, setSignatureData] = useState("");
  const signaturePadRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      from: {
        name: "Your Company Name",
        address: "123 Business St, City, Country",
        email: "billing@yourcompany.com",
        phone: "+1 (555) 123-4567",
      },
      to: {
        name: "",
        address: "",
        email: "",
        phone: "",
      },
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
      date: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      items: [
        { id: crypto.randomUUID(), description: "Product/Service 1", quantity: 1, price: 100, tax: 10 },
      ],
      notes: "Thank you for your business!",
      terms: "Payment due within 30 days. Late payments subject to 5% fee.",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const calculateSubtotal = () => {
    return fields.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return fields.reduce((sum, item) => sum + (item.price * item.quantity * (item.tax / 100)), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

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

  const generatePDF = () => {
    const doc = new jsPDF();
    const values = form.getValues();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("INVOICE", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Invoice #: ${values.invoiceNumber}`, 15, 30);
    doc.text(`Date: ${format(new Date(values.date), "MMM dd, yyyy")}`, 15, 36);
    doc.text(`Due Date: ${format(new Date(values.dueDate), "MMM dd, yyyy")}`, 15, 42);

    // From/To
    doc.setFontSize(10);
    doc.text("From:", 15, 60);
    doc.text(values.from.name, 15, 66);
    doc.text(values.from.address, 15, 72);
    doc.text(values.from.email, 15, 78);
    doc.text(values.from.phone, 15, 84);

    doc.text("To:", 105, 60);
    doc.text(values.to.name, 105, 66);
    doc.text(values.to.address, 105, 72);
    doc.text(values.to.email, 105, 78);
    doc.text(values.to.phone, 105, 84);

    // Items table
    autoTable(doc, {
      startY: 100,
      head: [['Description', 'Qty', 'Price', 'Tax', 'Amount']],
      body: values.items.map(item => [
        item.description,
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `${item.tax}%`,
        `$${(item.price * item.quantity * (1 + item.tax/100)).toFixed(2)}`
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      didDrawPage: function (data) {
        // Footer with totals
        doc.setFontSize(12);
        doc.text(`Subtotal: $${calculateSubtotal().toFixed(2)}`, 150, data.cursor.y + 10);
        doc.text(`Tax: $${calculateTax().toFixed(2)}`, 150, data.cursor.y + 20);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`Total: $${calculateTotal().toFixed(2)}`, 150, data.cursor.y + 30);
        doc.setFont(undefined, 'normal');

        // Notes and signature
        doc.setFontSize(10);
        doc.text(`Notes: ${values.notes || ''}`, 15, data.cursor.y + 50);
        doc.text(`Terms: ${values.terms || ''}`, 15, data.cursor.y + 56);

        if (signatureData) {
          doc.addImage(signatureData, 'PNG', 15, data.cursor.y + 70, 50, 20);
          doc.text("Authorized Signature", 15, data.cursor.y + 95);
        }
      }
    });

    doc.save(`invoice_${values.invoiceNumber}.pdf`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="editor">Invoice Editor</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">From</h3>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input {...form.register("from.name")} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input {...form.register("from.address")} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" {...form.register("from.email")} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...form.register("from.phone")} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Bill To</h3>
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input {...form.register("to.name")} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input {...form.register("to.address")} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" {...form.register("to.email")} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...form.register("to.phone")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input {...form.register("invoiceNumber")} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...form.register("date")} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" {...form.register("dueDate")} />
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
                  onClick={() => append({ id: crypto.randomUUID(), description: "", quantity: 1, price: 0, tax: 0 })}
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
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          className="border-none p-0 focus:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.price`, { valueAsNumber: true })}
                          className="border-none p-0 focus:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          {...form.register(`items.${index}.tax`, { valueAsNumber: true })}
                          className="border-none p-0 focus:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        ${((item.price * item.quantity) * (1 + item.tax/100)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          ×
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
            <CardFooter className="flex justify-end">
              <Button type="button" onClick={generatePDF}>
                Download PDF
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">INVOICE</CardTitle>
                <div className="text-right">
                  <p className="font-medium">Invoice #: {form.watch("invoiceNumber")}</p>
                  <p className="text-sm">Date: {format(new Date(form.watch("date")), "MMM dd, yyyy")}</p>
                  <p className="text-sm">Due Date: {format(new Date(form.watch("dueDate")), "MMM dd, yyyy")}</p>
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
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-2">To:</h3>
                  <p className="font-medium">{form.watch("to.name")}</p>
                  <p className="text-sm">{form.watch("to.address")}</p>
                  <p className="text-sm">{form.watch("to.email")}</p>
                  <p className="text-sm">{form.watch("to.phone")}</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.tax}%</TableCell>
                      <TableCell className="text-right">
                        ${((item.price * item.quantity) * (1 + item.tax/100)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end mt-8">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm">{form.watch("notes") || "N/A"}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Terms & Conditions</h4>
                  <p className="text-sm">{form.watch("terms") || "N/A"}</p>
                </div>
              </div>

              {signatureData && (
                <div className="mt-12">
                  <div className="w-48 border-t-2 border-black pt-2">
                    <img src={signatureData} alt="Signature" className="h-12" />
                    <p className="text-sm mt-1">Authorized Signature</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t">
              <Button onClick={generatePDF}>Download PDF</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
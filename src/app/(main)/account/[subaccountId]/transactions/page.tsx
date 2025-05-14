"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Legend,
  Line
} from "recharts";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: string;
};

export default function TransactionsPage() {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const subaccountId = pathParts[2];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCreate = async () => {
    const payload = {
      title,
      amount: parseFloat(amount),
      type,
      subaccountid: subaccountId,
    };

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success("Transaction added!");
      fetchTransactions();
      resetForm();
      setAddModalOpen(false);
    } else {
      toast.error("Failed to add transaction");
    }
  };

  const handleUpdate = async () => {
    const payload = {
      title,
      amount: parseFloat(amount),
      type,
      subaccountid: subaccountId,
    };

    const res = await fetch(`/api/transactions/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success("Transaction updated!");
      fetchTransactions();
      resetForm();
      setEditModalOpen(false);
    } else {
      toast.error("Failed to update transaction");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted successfully");
      fetchTransactions();
    } else {
      toast.error("Failed to delete");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        let parsed: Transaction[];

        if (file.name.endsWith(".json")) {
          parsed = JSON.parse(text);
        } else if (file.name.endsWith(".csv")) {
          const lines = text.trim().split("\n");
          const headers = lines[0].split(",");
          parsed = lines.slice(1).map((line) => {
            const values = line.split(",");
            const obj: any = {};
            headers.forEach((header, idx) => {
              obj[header.trim()] = values[idx].trim();
            });
            return obj as Transaction;
          });
        } else {
          toast.error("Unsupported file format");
          return;
        }

        for (const tx of parsed) {
          const payload = {
            title: tx.title,
            amount: parseFloat(String(tx.amount)),
            type: tx.type,
            subaccountid: subaccountId,
          };

          await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        toast.success("Transactions imported successfully!");
        fetchTransactions();
      } catch (err) {
        console.error(err);
        toast.error("Failed to import transactions");
      }
    };

    reader.readAsText(file);
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setType("income");
    setEditId(null);
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const chartData = transactions.map((t) => ({
    name: t.title,
    income: t.type === "income" ? t.amount : 0,
    expense: t.type === "expense" ? t.amount : 0,
  }));

  return (
    <div className="p-4 sm:p-8 md:p-10 lg:p-16 max-w-7xl mx-auto space-y-6 overflow-y-auto">
  {/* Header and Controls */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
    <div className="flex flex-wrap gap-2 items-center">
      <Input type="file" accept=".csv,.json" onChange={handleImport} />
      <Button variant="outline" onClick={handleDownload}>
        Download
      </Button>
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => resetForm()} className="rounded-xl">
            + Add Transaction
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <Card className="p-4 space-y-4">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              placeholder="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <Button onClick={handleCreate} className="w-full">
              Create
            </Button>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  {/* Summary */}
  <Card className="p-6 rounded-xl shadow bg-muted text-foreground flex flex-wrap justify-between items-center font-semibold text-lg gap-4">
    <div>
      💰 Income: <span className="text-green-600">${totalIncome.toFixed(2)}</span>
    </div>
    <div>
      💸 Expense: <span className="text-red-600">${totalExpense.toFixed(2)}</span>
    </div>
  </Card>

  {/* Scatter Plot */}
  <Card className="p-6 overflow-x-auto rounded-xl">
    <h2 className="text-xl font-semibold mb-4">Transaction Scatter Plot</h2>
    <div className="min-w-[600px] h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <XAxis
            type="number"
            dataKey="index"
            name="Index"
            label={{ value: "Transaction", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            type="number"
            dataKey="amount"
            name="Amount"
            label={{ value: "Amount ($)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value) => `$${value}`}
            labelFormatter={() => ""}
          />
          <Scatter
            name="Income"
            data={transactions.map((t, i) => ({ ...t, index: i })).filter((t) => t.type === "income")}
            fill="#22c55e"
          />
          <Scatter
            name="Expense"
            data={transactions.map((t, i) => ({ ...t, index: i })).filter((t) => t.type === "expense")}
            fill="#ef4444"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  </Card>

  {/* Table */}
  <Card className="rounded-xl overflow-auto max-h-[400px]">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Title</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((txn) => (
          <TableRow key={txn.id}>
            <TableCell>{txn.title}</TableCell>
            <TableCell>${txn.amount.toFixed(2)}</TableCell>
            <TableCell className="capitalize">{txn.type}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditId(txn.id);
                  setTitle(txn.title);
                  setAmount(txn.amount.toString());
                  setType(txn.type);
                  setEditModalOpen(true);
                }}
              >
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(txn.id)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>

  {/* Line Chart */}
  <Card className="p-6 overflow-x-auto rounded-xl">
    <h2 className="text-xl font-semibold mb-4">Transaction Line Chart</h2>
    <div className="min-w-[600px] h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={transactions.map((t, i) => ({ ...t, index: i }))}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="index" label={{ value: "Transaction", position: "insideBottom", offset: -5 }} />
          <YAxis label={{ value: "Amount ($)", angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={(value) => `$${value}`} labelFormatter={() => ""} />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            data={transactions.filter((t) => t.type === "income").map((t, i) => ({ ...t, index: i }))}
            stroke="#22c55e"
            name="Income"
            dot
          />
          <Line
            type="monotone"
            dataKey="amount"
            data={transactions.filter((t) => t.type === "expense").map((t, i) => ({ ...t, index: i }))}
            stroke="#ef4444"
            name="Expense"
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>

  {/* Edit Modal */}
  <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Transaction</DialogTitle>
      </DialogHeader>
      <Card className="p-4 space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <Button onClick={handleUpdate} className="w-full">
          Update
        </Button>
      </Card>
    </DialogContent>
  </Dialog>
</div>


  );
}

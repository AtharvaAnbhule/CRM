"use client";

import { useEffect, useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Search, ArrowUpDown, Download } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: string;
  date: string;
  category?: string;
  subaccountid: string;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const CATEGORIES = [
  "Marketing",
  "Advertising",
  "Sales",
  "Software",
  "Subscriptions",
  "Salaries",
  "Utilities",
  "Rent",
  "Travel",
  "Meals & Entertainment",
  "Office Supplies",
  "Legal & Professional Services",
  "Insurance",
  "Taxes",
  "Training & Education",
  "Equipment",
  "Maintenance",
  "Shipping",
  "Inventory",
  "Miscellaneous",
];

export default function TransactionsPage() {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const subaccountId = pathParts[2];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/transactions?subaccountId=${subaccountId}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      } else {
        toast.error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    }
  };

  useEffect(() => {
    if (subaccountId) {
      fetchTransactions();
    }
  }, [subaccountId]);

  const handleCreate = async () => {
    if (!title || !amount || !subaccountId) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      title,
      amount: parseFloat(amount),
      type,
      subaccountid: subaccountId,
      category: category || "Other",
      date: date?.toISOString() || new Date().toISOString(),
    };

    try {
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
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  const handleUpdate = async () => {
    if (!editId || !title || !amount) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      title,
      amount: parseFloat(amount),
      type,
      subaccountid: subaccountId,
      category: category || "Other",
      date: date?.toISOString() || new Date().toISOString(),
    };

    try {
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
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully");
        fetchTransactions();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete");
    }
  };

  const handleDownload = () => {
    const filtered = transactions.filter(
      (t) => t.subaccountid === subaccountId
    );
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setType("income");
    setCategory("");
    setDate(new Date());
    setEditId(null);
  };

  // Filter and sort logic - only show transactions for current subaccount
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((t) => t.subaccountid === subaccountId);

    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Transaction];
        const bValue = b[sortConfig.key as keyof Transaction];

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [
    transactions,
    subaccountId,
    searchTerm,
    filterType,
    filterCategory,
    sortConfig,
  ]);

  const requestSort = (key: string) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredTransactions]);

  // Analytics calculations
  const totalIncome = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpense = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const netBalance = totalIncome - totalExpense;

  const incomeByCategory = useMemo(() => {
    const income = filteredTransactions.filter((t) => t.type === "income");
    const categories = [...new Set(income.map((t) => t.category || "Other"))];
    return categories.map((cat) => ({
      name: cat,
      value: income
        .filter((t) => t.category === cat || (!t.category && cat === "Other"))
        .reduce((sum, t) => sum + t.amount, 0),
    }));
  }, [filteredTransactions]);

  const expenseByCategory = useMemo(() => {
    const expense = filteredTransactions.filter((t) => t.type === "expense");
    const categories = [...new Set(expense.map((t) => t.category || "Other"))];
    return categories.map((cat) => ({
      name: cat,
      value: expense
        .filter((t) => t.category === cat || (!t.category && cat === "Other"))
        .reduce((sum, t) => sum + t.amount, 0),
    }));
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    const monthly: Record<
      string,
      { income: number; expense: number; month: string }
    > = {};

    filteredTransactions.forEach((t) => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthName = date.toLocaleString("default", { month: "short" });

      if (!monthly[monthYear]) {
        monthly[monthYear] = { income: 0, expense: 0, month: monthName };
      }

      if (t.type === "income") {
        monthly[monthYear].income += t.amount;
      } else {
        monthly[monthYear].expense += t.amount;
      }
    });

    return Object.values(monthly).sort((a, b) => {
      const aDate = new Date(a.month + " 1, 2000");
      const bDate = new Date(b.month + " 1, 2000");
      return aDate.getTime() - bDate.getTime();
    });
  }, [filteredTransactions]);

  return (
    <div className="p-4 m-5 sm:p-8 md:p-10 lg:p-16 max-w-7xl mx-auto space-y-6 overflow-y-auto">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-10 w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={filterType}
            onValueChange={(val: "all" | "income" | "expense") =>
              setFilterType(val)
            }>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterCategory}
            onValueChange={(val) => setFilterCategory(val)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
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
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DatePicker
                  selected={date}
                  onChange={(date: Date) => setDate(date)}
                  className="w-full p-2 border rounded-md"
                />
                <Button onClick={handleCreate} className="w-full">
                  Create
                </Button>
              </Card>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 rounded-xl bg-green-50 dark:bg-green-900/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalIncome.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-800 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600 dark:text-green-300">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Expense</p>
              <p className="text-2xl font-bold text-red-600">
                ${totalExpense.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-800 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-600 dark:text-red-300">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card
          className={`p-6 rounded-xl ${netBalance >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <p
                className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${netBalance.toFixed(2)}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${netBalance >= 0 ? "bg-green-100 dark:bg-green-800" : "bg-red-100 dark:bg-red-800"}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  netBalance >= 0
                    ? "text-green-600 dark:text-green-300"
                    : "text-red-600 dark:text-red-300"
                }>
                <path d="M6 15h12M6 9h12" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trends */}
        <Card className="p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Monthly Trends</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Income" />
                <Bar dataKey="expense" fill="#ef4444" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Income/Expense Distribution */}
        <Card className="p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">
            Income/Expense Distribution
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Income", value: totalIncome },
                    { name: "Expense", value: totalExpense },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }>
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Income by Category */}
        <Card className="p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Income by Category</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }>
                  {incomeByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expense by Category */}
        <Card className="p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Expense by Category</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }>
                  {expenseByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card className="rounded-xl overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-[200px] cursor-pointer"
                onClick={() => requestSort("title")}>
                <div className="flex items-center">
                  Title
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort("amount")}>
                <div className="flex items-center">
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort("type")}>
                <div className="flex items-center">
                  Type
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort("category")}>
                <div className="flex items-center">
                  Category
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort("date")}>
                <div className="flex items-center">
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell>{txn.title}</TableCell>
                <TableCell
                  className={
                    txn.type === "income" ? "text-green-600" : "text-red-600"
                  }>
                  ${txn.amount.toFixed(2)}
                </TableCell>
                <TableCell className="capitalize">{txn.type}</TableCell>
                <TableCell>{txn.category || "Other"}</TableCell>
                <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditId(txn.id);
                      setTitle(txn.title);
                      setAmount(txn.amount.toString());
                      setType(txn.type);
                      setCategory(txn.category || "");
                      setDate(new Date(txn.date));
                      setEditModalOpen(true);
                    }}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(txn.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <strong>
              {Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                filteredTransactions.length
              )}
              -
              {Math.min(
                currentPage * itemsPerPage,
                filteredTransactions.length
              )}
            </strong>{" "}
            of <strong>{filteredTransactions.length}</strong> transactions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}>
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}>
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

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
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DatePicker
              selected={date}
              onChange={(date: Date) => setDate(date)}
              className="w-full p-2 border rounded-md"
            />
            <Button onClick={handleUpdate} className="w-full">
              Update
            </Button>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}

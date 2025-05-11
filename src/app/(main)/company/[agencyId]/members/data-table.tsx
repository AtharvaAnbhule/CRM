"use client";

import React, { useEffect, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useModal } from "@/hooks/use-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/common/CustomModal";

interface TeamsDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterValue: string;
  actionButtonText?: React.ReactNode;
  modalChildren?: React.ReactNode;
}

function TeamsDataTable<TData extends { createdAt?: string }, TValue>({
  columns,
  data,
  filterValue,
  actionButtonText,
  modalChildren,
}: TeamsDataTableProps<TData, TValue>) {
  const { setOpen } = useModal();

  

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

 // Top of the component
const [graphData, setGraphData] = useState<{ date: string; total: number }[]>([]);

useEffect(() => {
  const counts: Record<string, number> = {};

  data.forEach((member) => {
    if (member.createdAt) {
      const date = new Date(member.createdAt);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      counts[monthYear] = (counts[monthYear] || 0) + 1;
    }
  });

  const sortedKeys = Object.keys(counts).sort();
  let cumulative = 0;
  const formatted = sortedKeys.map((key) => {
    cumulative += counts[key];
    const [year, month] = key.split("-");
    const formattedLabel = `${new Date(+year, +month - 1).toLocaleString("default", {
      month: "short",
    })} ${year}`;
    return { date: formattedLabel, total: cumulative };
  });

  setGraphData(formatted);
}, [data]);

  

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center md:text-left dark:text-white">
        <h1 className="text-4xl font-bold">Manage Your Members</h1>
        <p className="text-lg opacity-80">Organize your members efficiently.</p>
      </div>

      {/* 📊 Members Over Time Chart */}
      <div className="bg-white dark:bg-[#1e1e2f] p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Members Added Over Time
        </h2>
        <div className="overflow-x-auto">
  <div style={{ minWidth: `${graphData.length * 100}px` }}>
  <div className="overflow-x-auto">
  <div style={{ minWidth: `${graphData.length * 90}px` }}>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={graphData}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="date" stroke="#888" />
        <YAxis allowDecimals={false} stroke="#888" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f1f2e",
            border: "1px solid #333",
            color: "#fff",
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#7c3aed"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>

  </div>
</div>

      </div>

      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-4 text-muted-foreground" />
          <Input
            placeholder="Search name..."
            value={(table.getColumn(filterValue)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(filterValue)?.setFilterValue(event.target.value)
            }
            className="h-12 pl-10"
          />
        </div>
        <Button
          className="flex gap-2 bg-violet-600"
          onClick={() => {
            if (modalChildren) {
              setOpen(
                <CustomModal
                  title="Add Members"
                  subTitle="Send an invitation"
                  scrollShadow={false}
                >
                  {modalChildren}
                </CustomModal>
              );
            }
          }}
        >
          {actionButtonText}
        </Button>
      </div>

      <div className="border bg-background rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default TeamsDataTable;

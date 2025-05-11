"use client";

import React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";

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

interface FunnelsDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterValue: string;
  actionButtonText?: React.ReactNode;
  modalChildren?: React.ReactNode;
}

export default function FunnelsDataTable<TData, TValue>({
  columns,
  data,
  filterValue,
  modalChildren,
  actionButtonText,
}: FunnelsDataTableProps<TData, TValue>) {
  const { isOpen, setOpen, setClose } = useModal();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
    <h1 className="text-3xl font-bold mb-2">Manage Your Builder</h1>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      Create, edit, and manage all your Builder efficiently.
    </p>
      <div className="flex items-center justify-between p-4 dark:bg-gray-900 rounded-lg shadow-md"> 
      
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-3 text-gray-400" />
            <Input
              placeholder="Search by name..."
              value={
                (table.getColumn(filterValue)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(filterValue)?.setFilterValue(event.target.value)
              }
              className="h-10 pl-10 border border-gray-700 dark:bg-gray-800 text-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-400"
            />
          </div>
        </div>
        <Button
          className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 rounded-lg shadow-md"
          onClick={() => {
            if (modalChildren)
              setOpen(
                <CustomModal
                  title="Create a Builder"
                  subTitle="Builders are like websites, but better! Try creating one!"
                >
                  {modalChildren}
                </CustomModal>
              );
          }}
        >
          {actionButtonText}
        </Button>
      </div>
      <div className="border border-gray-700 dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="dark:bg-gray-700 dark:text-gray-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                  className="dark:hover:bg-gray-700 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 dark:text-gray-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center dark:text-gray-400 text-sm"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

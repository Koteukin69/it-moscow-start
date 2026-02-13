'use client';

import {type ReactNode} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Loader2} from "lucide-react";

export interface Column<T> {
  header: ReactNode;
  cell: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  loading: boolean;
  emptyIcon: ReactNode;
  emptyMessage: string;
}

export default function DataTable<T>({data, columns, keyField, loading, emptyIcon, emptyMessage}: DataTableProps<T>) {
  return (
    <Card className="bg-background/70 overflow-hidden">
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <Loader2 size={20} className="animate-spin mx-auto text-muted-foreground"/>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {emptyIcon}
                    <span>{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map(item => (
                <TableRow key={String(item[keyField])}>
                  {columns.map((col, i) => (
                    <TableCell key={i} className={col.className}>{col.cell(item)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

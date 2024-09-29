import React from "react";
import { Table, flexRender } from "@tanstack/react-table";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
} from "@tanstack/react-table";
import { Screening } from "@/app/_api/getScreeningInfo";

type TableBodyProps = {
  table: Table<Screening>;
};

export default function TableBody({ table }: TableBodyProps) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {table.getRowModel().rows.map((row, idx) => (
        <tr key={idx}>
          {row.getVisibleCells().map((cell, idx) => (
            <td
              key={idx}
              className="px-6 py-4 whitespace-nowrap"
              style={{ width: cell.column.columnDef.size }}
            >
              <span>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </span>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

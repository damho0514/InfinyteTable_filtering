import { Screening } from "@/app/_api/getScreeningInfo";
import { RowModel, flexRender } from "@tanstack/react-table";
import React from "react";

type ScreeningTableRowProps = {
  rowModel: RowModel<Screening>;
};
export default function ScreeningTableRow({
  rowModel,
}: ScreeningTableRowProps) {
  return (
    <table className="w-full table-fixed">
      <tbody className="bg-white divide-y divide-gray-200">
        {rowModel.rows.map((row) => (
          <tr key={row.id} className="hover:bg-blue1">
            {row.getVisibleCells().map((cell) => (
              <td
                className="px-6 py-4 whitespace-nowrap"
                style={{ width: cell.column.getSize() }} // Match cell width with header
                key={cell.id}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import React from "react";
import { Table } from "@tanstack/react-table";
import { Screening } from "@/app/_api/getScreeningInfo";
import { flexRender } from "@tanstack/react-table";
import UpIcon from "@/src/assets/icon/UpIcon";
import DownIcon from "@/src/assets/icon/DownIcon";
import NoneArrowIcon from "@/src/assets/icon/NoneArrowIcon";

interface TableHeaderProps {
  table: Table<Screening>;
  // onSortClick: (id: string) => void;
}
export default function TableHeader({ table }: TableHeaderProps) {
  return (
    <thead className="bg-headerColor h-[62px] text-xl font-bold text-gray70">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              style={{
                width: header.getSize(),
                cursor: header.column.getCanSort() ? "pointer" : "default",
              }}
              onClick={header.column.getToggleSortingHandler()}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
              {
                {
                  asc: <UpIcon />,
                  desc: <DownIcon />,
                }[header.column.getIsSorted() as string]
              }
              {header.column.getCanSort() && !header.column.getIsSorted() ? (
                <NoneArrowIcon />
              ) : null}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}

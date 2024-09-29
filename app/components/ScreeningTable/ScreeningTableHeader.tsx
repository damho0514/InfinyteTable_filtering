import { Screening } from "@/app/_api/getScreeningInfo";
import DownIcon from "@/src/assets/icon/DownIcon";
import NoneArrowIcon from "@/src/assets/icon/NoneArrowIcon";
import UpIcon from "@/src/assets/icon/UpIcon";
import { Table, flexRender } from "@tanstack/react-table";
import React from "react";

const indexingArray = [1, 5, 6, 7, 8, 9, 10];

type ScreeningTableHeaderProps = {
  table: Table<Screening>;
};

export default function ScreeningTableHeader({
  table,
}: ScreeningTableHeaderProps) {
  return (
    <table className="w-full table-fixed">
      <thead className="bg-done_bg h-[62px] text-xl font-bold text-gray70">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, index) => (
              <th
                key={header.id}
                className="px-6 py-3"
                style={{ width: header.column.getSize() }}
                onClick={
                  indexingArray.includes(index) && header.column.getCanSort()
                    ? header.column.getToggleSortingHandler() // indexingArray에 포함된 경우에만 정렬 핸들러 호출
                    : undefined
                }
              >
                <div className="flex gap-5 items-center">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  <div
                    className={`${
                      indexingArray.includes(index) ? "cursor-pointer" : ""
                    }`}
                  >
                    {indexingArray.includes(index) &&
                    header.column.getCanSort() &&
                    !header.column.getIsSorted() ? (
                      <NoneArrowIcon />
                    ) : null}
                    {indexingArray.includes(index) &&
                      {
                        asc: <UpIcon />,
                        desc: <DownIcon />,
                      }[header.column.getIsSorted() as string]}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
    </table>
  );
}

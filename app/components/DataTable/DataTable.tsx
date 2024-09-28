"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Column,
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { debounce, filter } from "lodash";
import { Screening, getScreeningInfo } from "@/app/_api/getScreeningInfo";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import LoadMoreObserver from "./LoadMoreObserver";
import { handleCopy } from "@/app/utils/clipboardUtils";
import { formatDateTime } from "@/app/utils/formatDateTime";
import CopyIcon from "@/src/assets/icon/CopyIcon";
import NoneArrowIcon from "@/src/assets/icon/NoneArrowIcon";
import DownIcon from "@/src/assets/icon/DownIcon";
import UpIcon from "@/src/assets/icon/UpIcon";

const defaultSorting: SortingState = [{ id: "alert.date", desc: true }];
const statusOptions = ["DONE", "DNR", "SCREENED", "ERROR", "OBSERVING"];
const indexingArray = [2, 5, 6, 7, 8, 9, 10];

export default function DataTable() {
  const loadMoreRef = useRef<null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");
  const [sortField, setSortField] = useState<string | null>("alert.date");
  const [filters, setFilters] = useState<string[]>([]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery<Screening[]>({
    queryKey: ["screening", filters, sortField, sortOrder],
    queryFn: ({ pageParam = 1, queryKey }) => {
      return getScreeningInfo({
        pages: Number(pageParam),
        limit: 40,
        sortField,
        sortOrder,
        filters,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 40 ? pages.length + 1 : undefined;
    },
  });

  const isFetchingRef = useRef(isFetchingNextPage);

  const handleScroll = useCallback(
    debounce(() => {
      if (loadMoreRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = loadMoreRef.current;
        const isBottom = scrollTop + clientHeight >= scrollHeight - 10;

        if (isBottom && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    }, 1000),
    [hasNextPage, fetchNextPage, isFetchingNextPage]
  );

  const handleSort = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    if (typeof updaterOrValue === "function") {
      const newSorting = updaterOrValue(defaultSorting); // 기본 정렬을 전달
      handleSortingLogic(newSorting);
    } else {
      handleSortingLogic(updaterOrValue);
    }
  };

  useEffect(() => {
    setSortField("alert.date");
    setSortOrder("desc");
  }, []);

  // 정렬 로직을 처리하는 함수
  const handleSortingLogic = (sorting: SortingState) => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0]; // 첫 번째 정렬 기준만 사용

      // 정렬 해제 로직
      if (sortField === id) {
        if (sortOrder === (desc ? "desc" : "asc")) {
          // 현재 정렬 기준과 동일하고, 같은 방향인 경우
          // 기본 정렬로 되돌리기 (alert.date 내림차순)
          setSortField("alert.date");
          setSortOrder("desc");
        } else {
          // 방향만 바꾸는 경우
          setSortOrder(desc ? "desc" : "asc");
        }
      } else {
        // 새로운 정렬 기준으로 설정
        setSortField(id);
        setSortOrder(desc ? "desc" : "asc");
      }
    } else {
      // 정렬 기준이 없을 경우
      setSortField("alert.date"); // 기본 정렬 필드
      setSortOrder("desc"); // 기본 정렬 방향
    }
  };

  const columns: ColumnDef<Screening>[] = useMemo(
    () => [
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        size: 20,
      },
      {
        size: 100,
        id: "patientInfo",
        accessorKey: "patientInfo",
        header: "Patient info",
        enableSorting: true,
        cell: ({ row }) => {
          const name = row.original.name;
          const sex = row.original.sex;
          const age = row.original.age;
          const emrId = row.original.emr_id;
          return (
            <>
              <div className="font-bold">
                <div>{`${name} (${sex}/${age})`}</div>
              </div>
              <div className="flex justify-between">
                <div>{emrId}</div>
                <div
                  className="cursor-pointer"
                  onClick={() => handleCopy(String(emrId))}
                >
                  <CopyIcon />
                </div>
              </div>
            </>
          );
        },
      },
      {
        id: "3",
        accessorKey: "3",
        header: "",
        size: 200,
        cell: ({ row }) => {
          const location = row.original.location;
          const admissionDate = row.original.admission_dt;
          return (
            <>
              <p className="font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                {location}
              </p>
              <p>{admissionDate.split(" ")[0]}</p>
            </>
          );
        },
      },
      {
        id: "4",
        accessorKey: "4",
        header: "",
        size: 100,
        cell: ({ row }) => {
          const department = row.original.department;
          const doctor = row.original.doctor;
          return (
            <>
              <p className="font-bold">{department}</p>
              <p>{doctor}</p>
            </>
          );
        },
      },
      {
        id: "Screened Type",
        accessorKey: "ScreenedType",
        header: "ScreenedType",
        size: 100,
        cell: ({ row }) => {
          const alertType = row.original.alert.type;
          const alertValue = row.original.alert.value.toFixed(1);
          return <p>{`${alertType} ${alertValue}`}</p>;
        },
      },
      {
        size: 100,
        id: "alert.date",
        accessorKey: "alert.date",
        header: "ScreenedDate",
        cell: ({ row }) => {
          const alertDate = row.original.alert.date;
          return <p>{formatDateTime(alertDate)}</p>;
        },
      },
      {
        id: "SBP",
        header: "SBP",
        accessorKey: "SBP",
        size: 0,
        cell: ({ row }) => {
          const screeningData = row.original.screening_data;
          const sbpValue =
            screeningData
              .find((item) => item.type === "SBP")
              ?.value.toFixed(1) || "N/A";
          return <p>{sbpValue}</p>;
        },
      },
      {
        id: "DBP",
        header: "DBP",
        accessorKey: "DBP",
        size: 0,
        cell: ({ row }) => {
          const screeningData = row.original.screening_data;
          const dbpValue =
            screeningData
              .find((item) => item.type === "DBP")
              ?.value.toFixed(1) || "N/A";
          return <p>{dbpValue}</p>;
        },
      },
      {
        id: "PR",
        header: "PR",
        accessorKey: "PR",
        size: 0,
        cell: ({ row }) => {
          const screeningData = row.original.screening_data;
          const prValue =
            screeningData
              .find((item) => item.type === "PR")
              ?.value.toFixed(1) || "N/A";
          return <p>{prValue}</p>;
        },
      },
      {
        id: "RR",
        header: "RR",
        accessorKey: "RR",
        size: 0,
        cell: ({ row }) => {
          const screeningData = row.original.screening_data;
          const rrValue =
            screeningData
              .find((item) => item.type === "RR")
              ?.value.toFixed(1) || "N/A";
          return <p>{rrValue}</p>;
        },
      },
      {
        id: "BT",
        header: "BT",
        accessorKey: "BT",
        size: 0,
        cell: ({ row }) => {
          const screeningData = row.original.screening_data;
          const btValue =
            screeningData
              .find((item) => item.type === "BT")
              ?.value.toFixed(1) || "N/A";
          return <p>{btValue}</p>;
        },
      },
    ],
    []
  );

  const handleCheckboxChange = useCallback(
    (status: string) => {
      setFilters((prev) => {
        console.log(filters);
        // 이전 상태와 비교하여 중복된 상태 변경 방지
        if (prev.includes(status)) {
          return prev.filter((s) => s !== status);
        } else {
          return [...prev, status];
        }
      });
    },
    [filters]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingRef.current) {
            fetchNextPage();
          }
        });
      },
      { rootMargin: "0px", threshold: 1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [fetchNextPage, hasNextPage]);

  const table = useReactTable<Screening>({
    data: data?.pages.flatMap((res) => res) || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: handleSort,
    state: {
      sorting: [{ id: sortField || "alert.date", desc: sortOrder === "desc" }],
    },
  });

  const rowModel = useMemo(() => table.getRowModel(), [table, data]);

  return status === "pending" ? (
    <p>Loading...</p>
  ) : status === "error" ? (
    <p>Error: {error.message}</p>
  ) : (
    <div>
      <div className="flex gap-12">
        {statusOptions.map((status) => (
          <div key={status}>
            <input
              type="checkbox"
              checked={filters.includes(status)} // Manage checkbox state
              onChange={(e) => handleCheckboxChange(status)} // Implement your checkbox handling logic
            />
            {status}
          </div>
        ))}
      </div>
      <div className="border-x border-t border-b">
        <table className="w-full table-fixed">
          <thead className="bg-headerColor h-[62px] text-xl font-bold text-gray70">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className="px-6 py-3"
                    style={{ width: header.column.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex gap-5 items-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        </table>
        <div
          className="overflow-y-auto max-h-[800px]"
          onScroll={handleScroll}
          ref={loadMoreRef}
        >
          <table className="w-full table-fixed">
            <tbody className="bg-white divide-y divide-gray-200">
              {rowModel.rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className="px-6 py-4 whitespace-nowrap"
                      style={{ width: cell.column.getSize() }} // Match cell width with header
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-error_text font-bold text-xl">
        {isFetchingNextPage ? "Fetching..." : null}
      </div>
    </div>
  );
}

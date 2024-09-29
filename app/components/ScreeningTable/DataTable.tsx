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
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { debounce } from "lodash";
import {
  Screening,
  StatusType,
  getScreeningInfo,
} from "@/app/_api/getScreeningInfo";
import { handleCopy } from "@/app/utils/clipboardUtils";
import { formatDateTime } from "@/app/utils/formatDateTime";
import CopyIcon from "@/src/assets/icon/CopyIcon";
import { translateStatus } from "@/app/utils/translateStatus";
import StatusTag from "../StatusTag/StatusTag";
import ScreeningTableHeader from "./ScreeningTableHeader";
import ScreeningTableRow from "./ScreeningTableRow";

const defaultSorting: SortingState = [{ id: "alert.date", desc: true }];
const statusOptions = ["SCREENED", "OBSERVING", "ERROR", "DONE", "DNR"];

export default function DataTable() {
  const loadMoreRef = useRef<null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");
  const [sortField, setSortField] = useState("alert.date");
  const [filters, setFilters] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<Screening[]>([]);

  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["screening", filters, sortField, sortOrder],
    queryFn: ({ pageParam = 1, queryKey }) => {
      return getScreeningInfo({
        pages: Number(pageParam),
        limit: 10,
        sortField,
        sortOrder,
        filters,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
      if (firstPageParam <= 1) {
        return undefined;
      }
      return firstPageParam - 1;
    },
  });

  const isFetchingRef = useRef(isFetchingNextPage);

  const handleCheckboxChange = useCallback(
    (status: string) => {
      setFilters((prev) => {
        const newFilters = prev.includes(status)
          ? prev.filter((s) => s !== status)
          : [...prev, status];

        if (data) {
          const allData = data.pages.flat();
          if (newFilters.length === 0) {
            setFilteredData(allData);
          } else {
            const filtered = allData.filter((item) =>
              newFilters.includes(item.status)
            );
            setFilteredData(filtered);
          }
        }

        return newFilters;
      });
    },
    [data]
  );

  useEffect(() => {
    if (data) {
      const allData = data.pages.flatMap((res) => res);

      if (filters.length === 0) {
        setFilteredData(allData);
      } else {
        const filtered = allData.filter((item) =>
          filters.includes(item.status)
        );
        setFilteredData(filtered);
      }
    }
  }, [data, filters]);

  const handleSort = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(defaultSorting)
        : updaterOrValue;

    handleSortingLogic(newSorting);
  };

  const handleSortingLogic = (sorting: SortingState) => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];

      if (sortField === id) {
        if (sortOrder === (desc ? "desc" : "asc")) {
          setSortField("alert.date");
          setSortOrder("desc");
        } else {
          setSortOrder(desc ? "desc" : "asc");
        }
      } else {
        setSortField(id);
        setSortOrder(desc ? "desc" : "asc");
      }
    } else {
      setSortField("");
      setSortOrder(null);
    }
  };

  useEffect(() => {
    setSortField("alert.date");
    setSortOrder("desc");
  }, []);

  const columns: ColumnDef<Screening>[] = useMemo(
    () => [
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        size: 20,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <StatusTag status={status}>{translateStatus(status)}</StatusTag>
          );
        },
      },
      {
        size: 100,
        id: "emr_id",
        accessorKey: "emr_id",
        header: "Patient info",
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
        id: "location",
        accessorKey: "location",
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
        id: "department",
        accessorKey: "department",
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
        id: "screenedType",
        accessorKey: "screenedType",
        header: "screenedType",
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
        accessorKey: "screening_data",
        size: 0,
        enableSorting: true,
        cell: ({ row }) => {
          const screeningData = row.original.screening_data;
          const sbpValue = screeningData
            .find((item) => item.type === "SBP")
            ?.value.toFixed(1);
          return <p>{sbpValue}</p>;
        },
        sortingFn: (rowA, rowB) => {
          const valueA =
            rowA.original.screening_data.find((item) => item.type === "SBP")
              ?.value || 0;
          const valueB =
            rowB.original.screening_data.find((item) => item.type === "SBP")
              ?.value || 0;
          return valueA - valueB;
        },
      },
      {
        id: "DBP",
        header: "DBP",
        accessorKey: "screening_data",
        size: 0,
        cell: ({ row }) => {
          const screeningData = row.original.screening_data;
          const dbpValue =
            screeningData
              .find((item) => item.type === "DBP")
              ?.value.toFixed(1) || "N/A";
          return <p>{dbpValue}</p>;
        },
        sortingFn: (rowA, rowB) => {
          const valueA =
            rowA.original.screening_data.find((item) => item.type === "DBP")
              ?.value || 0;
          const valueB =
            rowB.original.screening_data.find((item) => item.type === "DBP")
              ?.value || 0;
          return valueA - valueB;
        },
        enableSorting: true,
      },
      {
        id: "PR",
        header: "PR",
        accessorKey: "screening_data",
        size: 0,
        cell: ({ row }) => {
          const screeningData = row.original.screening_data;
          const prValue =
            screeningData
              .find((item) => item.type === "PR")
              ?.value.toFixed(1) || "N/A";
          return <p>{prValue}</p>;
        },
        sortingFn: (rowA, rowB) => {
          const valueA =
            rowA.original.screening_data.find((item) => item.type === "PR")
              ?.value || 0;
          const valueB =
            rowB.original.screening_data.find((item) => item.type === "PR")
              ?.value || 0;
          return valueA - valueB;
        },
        enableSorting: true,
      },
      {
        id: "RR",
        header: "RR",
        accessorKey: "screening_data",
        size: 0,
        cell: ({ row }) => {
          const screeningData = row.original.screening_data;
          const rrValue =
            screeningData
              .find((item) => item.type === "RR")
              ?.value.toFixed(1) || "N/A";
          return <p>{rrValue}</p>;
        },
        sortingFn: (rowA, rowB) => {
          const valueA =
            rowA.original.screening_data.find((item) => item.type === "RR")
              ?.value || 0;
          const valueB =
            rowB.original.screening_data.find((item) => item.type === "RR")
              ?.value || 0;
          return valueA - valueB;
        },
        enableSorting: true,
      },
      {
        id: "BT",
        header: "BT",
        accessorKey: "screening_data",
        size: 0,
        cell: ({ row }) => {
          const screeningData = row.original.screening_data;
          const btValue =
            screeningData
              .find((item) => item.type === "BT")
              ?.value.toFixed(1) || "N/A";
          return <p>{btValue}</p>;
        },
        sortingFn: (rowA, rowB) => {
          const valueA =
            rowA.original.screening_data.find((item) => item.type === "BT")
              ?.value || 0;
          const valueB =
            rowB.original.screening_data.find((item) => item.type === "BT")
              ?.value || 0;
          return valueA - valueB;
        },
        enableSorting: true,
      },
    ],
    []
  );

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
    data: filteredData,
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
              checked={filters.includes(status)}
              onChange={(e) => handleCheckboxChange(status)}
            />
            {translateStatus(status as StatusType)}
          </div>
        ))}
      </div>
      <div className="border-x border-t border-b">
        <ScreeningTableHeader table={table} />
        <div
          className="overflow-y-auto max-h-[800px]"
          onScroll={handleScroll}
          ref={loadMoreRef}
        >
          <ScreeningTableRow rowModel={rowModel} />
        </div>
      </div>
      <div className="text-error_text font-bold text-xl">
        {isFetchingNextPage ? "Fetching..." : null}
      </div>
    </div>
  );
}

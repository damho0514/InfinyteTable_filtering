import React, { useCallback, useEffect, useState } from "react";
import { Screening, getScreeningInfo } from "../_api/getScreeningInfo";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";

const defaultSorting: SortingState = [{ id: "alert.date", desc: true }];

export const useScreening = () => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");
  const [sortField, setSortField] = useState("alert.date");
  const [filters, setFilters] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<Screening[]>([]);

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
      console.log(lastPage);
      return lastPage.length === 40 ? pages.length + 1 : undefined;
    },
  });

  const handleSort = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(defaultSorting)
        : updaterOrValue;
    handleSortingLogic(newSorting);
  };

  const handleCheckboxChange = useCallback(
    (status: string) => {
      setFilters((prev) => {
        const newFilters = prev.includes(status)
          ? prev.filter((s) => s !== status)
          : [...prev, status];

        if (data) {
          const allData = data.pages.flatMap((res) => res);
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

  const handleSortingLogic = (sorting: SortingState) => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0]; // 첫 번째 정렬 기준만 사용

      // 정렬 해제 로직
      if (sortField === id) {
        if (sortOrder === (desc ? "desc" : "asc")) {
          // 현재 정렬 기준과 동일하고, 같은 방향인 경우
          // 정렬 해제
          setSortField("");
          setSortOrder(null); // 정렬 방향 초기화
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
      setSortField("alert.date"); // 정렬 기준 초기화
      setSortOrder("desc"); // 정렬 방향 초기화
    }
  };

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

  return {
    data,
    handleSort,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleCheckboxChange,
    handleSortingLogic,
    status,
    error,
    filters,
    filteredData,
    sortField,
    sortOrder,
  };
};

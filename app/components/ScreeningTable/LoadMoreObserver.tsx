"use client";

import React, { RefObject, useEffect, useRef } from "react";

type LoadMoreObserverProps = {
  loadMoreRef: RefObject<HTMLDivElement>;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
};

export default function LoadMoreObserver({
  loadMoreRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: LoadMoreObserverProps) {
  const isFetchingRef = useRef(isFetchingNextPage);

  useEffect(() => {
    isFetchingRef.current = isFetchingNextPage;
  }, [isFetchingNextPage]);

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

  return null;
}

import { StatusType } from "@/app/_api/getScreeningInfo";
import React, { ReactNode } from "react";

interface StatusTagProps {
  status: StatusType;
  children: ReactNode;
}

const StatusTag: React.FC<StatusTagProps> = ({ status, children }) => {
  const statusClasses = {
    DONE: "bg-done_bg text-done_text",
    OBSERVING: "bg-observing_bg text-observing_text",
    SCREENED: "bg-screened_bg text-screened_text",
    ERROR: "bg-error_bg text-error_text",
    DNR: "bg-dnr_bg text-dnr_text",
  };

  const classes = statusClasses[status] || "bg-gray-200 text-black"; // 기본 스타일

  return (
    <span className={`${classes} px-2 py-1 rounded-lg font-bold inline-block`}>
      {children}
    </span>
  );
};

export default StatusTag;

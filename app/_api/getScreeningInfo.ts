import axios from "axios";

export type StatusType = "DONE" | "DNR" | "SCREENED" | "ERROR" | "OBSERVING";

export interface Screening {
  status: StatusType;
  emr_id: number;
  name: string;
  sex: "F" | "M";
  age: number;
  location: string;
  doctor: string;
  department: string;
  admission_dt: string;
  alert: {
    type: "BT" | "SBP" | "DBP" | "RR" | "PR";
    value: number;
    date: string;
  };
  screening_data: [
    {
      type: "BT" | "SBP" | "DBP" | "RR" | "PR";
      value: number;
    }
  ];
}

export const getScreeningInfo = async ({
  pages,
  limit,
  sortField,
  sortOrder,
  filters,
}: {
  pages: number;
  limit: number;
  sortField: string | null;
  sortOrder: "asc" | "desc" | null;
  filters: string[];
}) => {
  try {
    const response = await axios(
      `http://localhost:3001/screening?_page=${pages}&_limit=${limit}&_sort=${sortField}&_order=${sortOrder}`
    );

    return response.data;
  } catch (error) {
    console.error({ error });
    throw error;
  }
};

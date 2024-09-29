import { StatusType } from "../_api/getScreeningInfo";

export function translateStatus(status: StatusType): string {
  switch (status) {
    case "DONE":
      return "완료";
    case "ERROR":
      return "오류";
    case "DNR":
      return "DNR";
    case "OBSERVING":
      return "관찰";
    case "SCREENED":
      return "신규";
    default:
      return "알 수 없음";
  }
}

export function formatDateTime(dateTime: string) {
  const [datePart, timePart] = dateTime.split(" ");
  const [_, month, day] = datePart.split("-");
  return `${month}.${day} ${timePart.slice(0, 5)}`;
}

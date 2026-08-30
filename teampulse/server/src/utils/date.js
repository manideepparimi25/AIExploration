// Returns a date as YYYY-MM-DD (UTC). Pure and testable.
export function todayStr(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

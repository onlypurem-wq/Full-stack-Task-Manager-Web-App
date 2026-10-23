// A Date object -> "YYYY-MM-DD" in the user's own timezone.
// Don't use toISOString() for this: it converts to UTC and can shift the day.
export function toDateString(d) {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

// Today (or today +/- some days) as "YYYY-MM-DD"
export function dateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toDateString(d);
}

// "2026-10-25" -> "Oct 25"
export function formatDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// "2026-10-25" -> "Sunday, October 25"
export function formatLong(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
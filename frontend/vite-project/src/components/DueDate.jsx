import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { formatDate } from "../dates";

export default function DueDate({ value, overdue, onChange }) {
  const [editing, setEditing] = useState(false);

  function handleChange(e) {
    const v = e.target.value;
    // While you type a date by hand the browser reports half-finished values
    // (like year 0002), so only accept a complete, sensible date.
    if (/^\d{4}-\d{2}-\d{2}$/.test(v) && v >= "1900-01-01") {
      setEditing(false);
      onChange(v);
    }
  }

  if (editing) {
    return (
      <input
        type="date"
        className="dueInput"
        aria-label="Due date"
        autoFocus
        value={value || ""}
        onChange={handleChange}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
        onFocus={(e) => {
          try {
            e.target.showPicker?.(); // opens the calendar popup right away
          } catch {
            // some browsers refuse; the field still works by typing
          }
        }}
      />
    );
  }

  if (!value) {
    return (
      <button
        type="button"
        className="dueBadge dueEmpty"
        onClick={() => setEditing(true)}
      >
        <CalendarPlus size={12} /> Add date
      </button>
    );
  }

  return (
    <span className="dueGroup">
      <button
        type="button"
        className={`dueBadge ${overdue ? "overdue" : ""}`}
        title="Change due date"
        onClick={() => setEditing(true)}
      >
        {overdue ? "Overdue · " : "Due "}
        {formatDate(value)}
      </button>
      <button
        type="button"
        className="dueClear"
        aria-label="Remove due date"
        onClick={() => onChange(null)}
      >
        ×
      </button>
    </span>
  );
}
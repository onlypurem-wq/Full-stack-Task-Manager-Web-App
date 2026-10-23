import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { api } from "../api";
import { dateString, toDateString, formatLong } from "../dates";
import NavBar from "../components/sidenav";
import DueDate from "../components/DueDate";
import "../styles.css";

// Set to false once login works (same flag as the other pages).
const SKIP_AUTH = false;

const SAMPLE_TASKS = [
  { _id: "1", title: "Read 2 books", task: "Read 2 books", done: true, dueDate: dateString(-3) },
  { _id: "2", title: "Sports", task: "Sports", done: false, dueDate: dateString(0) },
  { _id: "3", title: "Course module", task: "Course module", done: false, dueDate: dateString(0) },
  { _id: "4", title: "Call the doctor", task: "Call the doctor", done: false, dueDate: dateString(0) },
  { _id: "5", title: "Buy a gift", task: "Buy a gift", done: false, dueDate: dateString(2) },
  { _id: "6", title: "Submit report", task: "Submit report", done: false, dueDate: dateString(6) },
  { _id: "7", title: "Plan the trip", task: "Plan the trip", done: false, dueDate: null },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS = 2; // tasks shown inside a day before "+N more"

export default function Calendar() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [offline, setOffline] = useState(false); // true when showing sample data
  const [view, setView] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1); // first day of the shown month
  });
  const [selected, setSelected] = useState(dateString()); // "YYYY-MM-DD"
  const [newTitle, setNewTitle] = useState("");

  async function fetchTasks() {
    const data = await api("/api");
    setTasks(Array.isArray(data) ? data : data.tasks || []);
  }

  useEffect(() => {
    async function load() {
      try {
        await fetchTasks();
      } catch {
        if (SKIP_AUTH) {
          setTasks(SAMPLE_TASKS);
          setOffline(true);
        } else {
          navigate("/login");
        }
      }
    }
    load();
  }, [navigate]);

  async function addTask(e) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    const created = { title, task: title, done: false, dueDate: selected };

    try {
      if (offline) {
        setTasks((prev) => [{ ...created, _id: String(Date.now()) }, ...prev]);
      } else {
        await api("/api", { method: "POST", body: JSON.stringify(created) });
        await fetchTasks();
      }
      setNewTitle("");
    } catch (err) {
      alert(err.message);
    }
  }

  async function toggleDone(t) {
    const newDone = !t.done;
    setTasks((prev) =>
      prev.map((x) => (x._id === t._id ? { ...x, done: newDone } : x))
    );
    if (offline) return;

    try {
      await api(`/api/${t._id}`, {
        method: "PUT",
        body: JSON.stringify({ title: t.title, task: t.task, done: newDone }),
      });
    } catch (err) {
      setTasks((prev) =>
        prev.map((x) => (x._id === t._id ? { ...x, done: !newDone } : x))
      );
      alert(err.message);
    }
  }

  // Move a task to another day (or remove its date with null)
  async function changeDueDate(t, newDate) {
    const previous = t.dueDate;
    setTasks((prev) =>
      prev.map((x) => (x._id === t._id ? { ...x, dueDate: newDate } : x))
    );
    if (offline) return;

    try {
      await api(`/api/${t._id}`, {
        method: "PUT",
        body: JSON.stringify({ dueDate: newDate }),
      });
    } catch (err) {
      setTasks((prev) =>
        prev.map((x) => (x._id === t._id ? { ...x, dueDate: previous } : x))
      );
      alert(err.message);
    }
  }

  // --- Calendar math ---
  const year = view.getFullYear();
  const month = view.getMonth();
  const startOffset = view.getDay(); // blank days before the 1st (Sunday = 0)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  // Day 1 - startOffset + i: JavaScript rolls over into the previous/next month for us
  const cells = Array.from(
    { length: cellCount },
    (_, i) => new Date(year, month, 1 - startOffset + i)
  );

  function changeMonth(delta) {
    setView(new Date(year, month + delta, 1));
  }

  function goToday() {
    const n = new Date();
    setView(new Date(n.getFullYear(), n.getMonth(), 1));
    setSelected(dateString());
  }

  // Group tasks by their date: { "2026-10-25": [task, task], ... }
  const byDate = {};
  tasks.forEach((t) => {
    if (!t.dueDate) return;
    const key = t.dueDate.slice(0, 10);
    (byDate[key] = byDate[key] || []).push(t);
  });

  const today = dateString();
  const undated = tasks.filter((t) => !t.dueDate).length;
  const selectedTasks = byDate[selected] || [];
  const monthTitle = view.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="body">
      <NavBar />

      <main className="calendarPage">
        <header className="calendarHeader">
          <h1>Calendar</h1>
          <div className="monthControls">
            <button className="iconButton" aria-label="Previous month" onClick={() => changeMonth(-1)}>
              <ChevronLeft size={18} />
            </button>
            <span className="monthTitle">{monthTitle}</span>
            <button className="iconButton" aria-label="Next month" onClick={() => changeMonth(1)}>
              <ChevronRight size={18} />
            </button>
            <button className="button" onClick={goToday}>Today</button>
          </div>
        </header>

        {undated > 0 && (
          <p className="calendarNote">
            {undated} {undated === 1 ? "task has" : "tasks have"} no date, so
            {undated === 1 ? " it isn't" : " they aren't"} shown here.
          </p>
        )}

        <div className="calendarLayout">
          <div className="calendarGrid">
            {WEEKDAYS.map((d) => (
              <div key={d} className="weekday">{d}</div>
            ))}

            {cells.map((d) => {
              const key = toDateString(d);
              const dayTasks = byDate[key] || [];
              const classes = ["dayCell"];
              if (d.getMonth() !== month) classes.push("outside");
              if (key === today) classes.push("today");
              if (key === selected) classes.push("selected");

              return (
                <button
                  type="button"
                  key={key}
                  className={classes.join(" ")}
                  onClick={() => setSelected(key)}
                >
                  <span className="dayNumber">{d.getDate()}</span>
                  {dayTasks.slice(0, MAX_CHIPS).map((t) => (
                    <span key={t._id} className={`chip ${t.done ? "done" : ""}`}>
                      {t.title}
                    </span>
                  ))}
                  {dayTasks.length > MAX_CHIPS && (
                    <span className="moreChip">
                      +{dayTasks.length - MAX_CHIPS} more
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <aside className="dayPanel">
            <h3>{formatLong(selected)}</h3>

            <ul className="dayList">
              {selectedTasks.map((t) => (
                <li key={t._id}>
                  <input
                    type="checkbox"
                    checked={!!t.done}
                    onChange={() => toggleDone(t)}
                  />
                  <span className={`dayTitle ${t.done ? "strike" : ""}`}>
                    {t.title}
                  </span>
                  <DueDate
                    value={selected}
                    overdue={!t.done && selected < today}
                    onChange={(newDate) => changeDueDate(t, newDate)}
                  />
                </li>
              ))}
              {selectedTasks.length === 0 && (
                <li className="placeholder">No tasks this day</li>
              )}
            </ul>

            <form className="dayForm" onSubmit={addTask}>
              <input
                type="text"
                placeholder="New task for this day"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <button className="button" type="submit" aria-label="Add task">
                <Plus size={16} />
              </button>
            </form>
          </aside>
        </div>
      </main>
    </div>
  );
}
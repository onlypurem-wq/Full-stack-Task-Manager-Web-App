import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, CheckCheck, Pencil } from "lucide-react";
import { api } from "../api";
import { dateString } from "../dates";
import NavBar from "../components/sidenav";
import DueDate from "../components/DueDate";
import "../styles.css";

// Same idea as the dashboard: lets you work on the design without the backend.
// Set to false once login works.
const SKIP_AUTH = false;

const SAMPLE_TASKS = [
  { _id: "1", title: "Read 2 books", task: "Finish before the weekend", done: true, dueDate: dateString(-2) },
  { _id: "2", title: "Sports every day", task: "30 minutes", done: false, dueDate: dateString(-1) },
  { _id: "3", title: "Complete the course", task: "Two modules left", done: false, dueDate: dateString(1) },
  { _id: "4", title: "Buy a gift", task: "Birthday on Friday", done: false, dueDate: null },
];

const TABS = ["All", "In Progress", "Completed"];

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState("All");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [offline, setOffline] = useState(false); // true when showing sample data

  // Editing: which task is being edited, and what's in its edit fields
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", details: "" });

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
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const newTask = {
      title: cleanTitle,
      task: details.trim() || cleanTitle, // `task` is required by your schema
      done: false,
      dueDate: dueDate || null,
    };

    try {
      if (offline) {
        setTasks((prev) => [{ ...newTask, _id: String(Date.now()) }, ...prev]);
      } else {
        await api("/api", { method: "POST", body: JSON.stringify(newTask) });
        await fetchTasks();
      }
      setTitle("");
      setDetails("");
      setDueDate("");
    } catch (err) {
      alert(err.message);
    }
  }

  // Open the edit fields for one task, pre-filled with its current values
  function startEdit(t) {
    setEditingId(t._id);
    setEditForm({
      title: t.title,
      // when no details were given, `task` was saved as a copy of the title
      details: t.task === t.title ? "" : t.task || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(e) {
    e.preventDefault();
    const cleanTitle = editForm.title.trim();
    if (!cleanTitle) return;

    // Only title and details: `done` and `dueDate` have their own controls
    const changes = {
      title: cleanTitle,
      task: editForm.details.trim() || cleanTitle,
    };

    try {
      if (offline) {
        setTasks((prev) =>
          prev.map((x) => (x._id === editingId ? { ...x, ...changes } : x))
        );
      } else {
        await api(`/api/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(changes),
        });
        await fetchTasks();
      }
      cancelEdit();
    } catch (err) {
      alert(err.message);
    }
  }

  // Change (or clear, with null) just the due date
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

  async function markAllDone() {
    const targets = visible.filter((t) => !t.done);
    if (targets.length === 0) return;

    const ids = new Set(targets.map((t) => t._id));
    setTasks((prev) =>
      prev.map((x) => (ids.has(x._id) ? { ...x, done: true } : x))
    );

    if (offline) return;

    const results = await Promise.allSettled(
      targets.map((t) =>
        api(`/api/${t._id}`, {
          method: "PUT",
          body: JSON.stringify({ title: t.title, task: t.task, done: true }),
        })
      )
    );

    if (results.some((r) => r.status === "rejected")) {
      alert("Some tasks couldn't be updated.");
      await fetchTasks();
    }
  }

  async function deleteTask(t) {
    try {
      if (!offline) await api(`/api/${t._id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((x) => x._id !== t._id));
      if (editingId === t._id) cancelEdit();
    } catch (err) {
      alert(err.message);
    }
  }

  const today = dateString();

  const counts = {
    All: tasks.length,
    "In Progress": tasks.filter((t) => !t.done).length,
    Completed: tasks.filter((t) => t.done).length,
  };

  const visible = tasks
    .filter((t) =>
      tab === "All" ? true : tab === "Completed" ? t.done : !t.done
    )
    .sort((a, b) => Number(!!a.done) - Number(!!b.done)); // undone first

  const canMarkAll = visible.some((t) => !t.done);

  return (
    <div className="body">
      <NavBar />

      <main className="tasksPage">
        <h1>Tasks</h1>

        <form className="taskForm" onSubmit={addTask}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Details (optional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <input
            type="date"
            aria-label="Due date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button className="button" type="submit">
            <Plus size={16} /> Add
          </button>
        </form>

        <div className="tabsRow">
          <div className="tabs">
            {TABS.map((name) => (
              <button
                key={name}
                type="button"
                className={`tab ${tab === name ? "active" : ""}`}
                onClick={() => setTab(name)}
              >
                {name} <span className="tabCount">{counts[name]}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="button"
            onClick={markAllDone}
            disabled={!canMarkAll}
          >
            <CheckCheck size={16} /> Mark all as done
          </button>
        </div>

        <ul className="taskList">
          {visible.map((t) => {
            // The task being edited shows a form instead of the normal row
            if (editingId === t._id) {
              return (
                <li key={t._id} className="taskItem editing">
                  <form
                    className="editForm"
                    onSubmit={saveEdit}
                    onKeyDown={(e) => e.key === "Escape" && cancelEdit()}
                  >
                    <input
                      type="text"
                      placeholder="Title"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      required
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Details (optional)"
                      value={editForm.details}
                      onChange={(e) =>
                        setEditForm({ ...editForm, details: e.target.value })
                      }
                    />
                    <div className="editActions">
                      <button type="submit" className="button">Save</button>
                      <button type="button" className="button ghost" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </li>
              );
            }

            const due = t.dueDate ? t.dueDate.slice(0, 10) : null;
            const overdue = due && !t.done && due < today;

            return (
              <li key={t._id} className={`taskItem ${t.done ? "done" : ""}`}>
                <input
                  type="checkbox"
                  checked={!!t.done}
                  onChange={() => toggleDone(t)}
                />
                <div className="taskText">
                  <strong>{t.title}</strong>
                  {t.task && t.task !== t.title && <p>{t.task}</p>}
                </div>

                <DueDate
                  value={due}
                  overdue={overdue}
                  onChange={(newDate) => changeDueDate(t, newDate)}
                />

                <button
                  type="button"
                  className="editButton"
                  aria-label="Edit task"
                  onClick={() => startEdit(t)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="deleteButton"
                  aria-label="Delete task"
                  onClick={() => deleteTask(t)}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
          {visible.length === 0 && <li className="placeholder">Nothing here yet</li>}
        </ul>
      </main>
    </div>
  );
}
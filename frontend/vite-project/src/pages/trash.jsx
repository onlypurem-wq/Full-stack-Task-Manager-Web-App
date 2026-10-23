import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Trash2 } from "lucide-react";
import { api } from "../api";
import NavBar from "../components/sidenav";
import "../styles.css";

// Set to false once login works (same flag as the other pages).
const SKIP_AUTH = false;

const RETENTION_DAYS = 7; // keep in sync with TRASH_DAYS in task.controller.js
const DAY = 24 * 60 * 60 * 1000;

function daysAgo(n) {
  return new Date(Date.now() - n * DAY).toISOString();
}

const SAMPLE_TRASH = [
  { _id: "t1", title: "Old grocery list", task: "Old grocery list", done: false, deletedAt: daysAgo(1) },
  { _id: "t2", title: "Email the landlord", task: "Reply about the lease", done: true, deletedAt: daysAgo(4) },
  { _id: "t3", title: "Return library books", task: "Return library books", done: false, deletedAt: daysAgo(6) },
];

function daysLeft(deletedAt) {
  const msLeft = new Date(deletedAt).getTime() + RETENTION_DAYS * DAY - Date.now();
  return Math.max(0, Math.ceil(msLeft / DAY));
}

function formatDeleted(deletedAt) {
  return new Date(deletedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function Trash() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [offline, setOffline] = useState(false); // true when showing sample data

  useEffect(() => {
    async function load() {
      try {
        const data = await api("/api/trash");
        setItems(Array.isArray(data) ? data : data.tasks || []);
      } catch {
        if (SKIP_AUTH) {
          setItems(SAMPLE_TRASH);
          setOffline(true);
        } else {
          navigate("/login");
        }
      }
    }
    load();
  }, [navigate]);

  async function restore(t) {
    try {
      if (!offline) await api(`/api/${t._id}/restore`, { method: "PUT" });
      setItems((prev) => prev.filter((x) => x._id !== t._id));
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteForever(t) {
    if (!window.confirm(`Delete "${t.title}" forever? This can't be undone.`)) return;
    try {
      if (!offline) await api(`/api/${t._id}/permanent`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x._id !== t._id));
    } catch (err) {
      alert(err.message);
    }
  }

  async function emptyTrash() {
    if (!window.confirm("Delete everything in the trash forever? This can't be undone.")) return;
    try {
      if (!offline) await api("/api/trash", { method: "DELETE" });
      setItems([]);
    } catch (err) {
      alert(err.message);
    }
  }

  async function restoreAll() {
  if (items.length === 0) return;
  try {
    if (!offline) await api("/api/trash/restore", { method: "PUT" });
    setItems([]);
  } catch (err) {
    alert(err.message);
  }
}

  // Most recently deleted first
  const sorted = [...items].sort(
    (a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)
  );

  return (
    <div className="body">
      <NavBar />

      <main className="tasksPage">
        <h1>Trash</h1>

        <div className="tabsRow">
          <p className="trashNote">
            Deleted tasks stay here for {RETENTION_DAYS} days, then they're removed for good.
          </p>
          <div className="trashActions">
            <button
              type="button"
              className="button ghost"
              onClick={restoreAll}
              disabled={items.length === 0}
            >
              <RotateCcw size={16} /> Restore all
            </button>
            <button
              type="button"
              className="button"
              onClick={emptyTrash}
              disabled={items.length === 0}
            >
              <Trash2 size={16} /> Empty trash
            </button>
          </div>
        </div>

        <ul className="taskList">
          {sorted.map((t) => {
            const left = daysLeft(t.deletedAt);
            return (
              <li key={t._id} className="taskItem">
                <div className="taskText">
                  <strong>{t.title}</strong>
                  {t.task && t.task !== t.title && <p>{t.task}</p>}
                  <p className="trashMeta">
                    Deleted {formatDeleted(t.deletedAt)} ·{" "}
                    {left === 1 ? "1 day left" : `${left} days left`}
                  </p>
                </div>

                <button
                  type="button"
                  className="button ghost restoreButton"
                  onClick={() => restore(t)}
                >
                  <RotateCcw size={14} /> Restore
                </button>
                <button
                  type="button"
                  className="deleteButton"
                  aria-label="Delete forever"
                  title="Delete forever"
                  onClick={() => deleteForever(t)}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
          {sorted.length === 0 && <li className="placeholder">The trash is empty</li>}
        </ul>
      </main>
    </div>
  );
}
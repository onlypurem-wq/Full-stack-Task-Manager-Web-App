import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "../api";
import NavBar from "../components/sidenav";
import NotificationBell from "../components/NotificationBell";
import SearchBox from "../components/SearchBox";
import "../styles.css";

// Set to true while the backend isn't connected, so you can work on the design.
// Set it back to false once login works.
const SKIP_AUTH = false;

const SAMPLE_TASKS = [
  { _id: "1", title: "Read 2 books", task: "Finish before the weekend", done: true },
  { _id: "2", title: "Sports every day", task: "30 minutes", done: false },
  { _id: "3", title: "Complete the course", task: "Two modules left", done: false },
  { _id: "4", title: "Buy a gift", task: "Birthday on Friday", done: false },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [offline, setOffline] = useState(false); // true when showing sample data

  useEffect(() => {
    async function load() {
      try {
        const profile = await api("/auth/profile");
        setUser(profile.user || profile);
      } catch {
        if (SKIP_AUTH) {
          setUser({ name: "Guest" });
          setTasks(SAMPLE_TASKS);
          setOffline(true);
        } else {
          navigate("/login");
        }
        return;
      }
      try {
        const data = await api("/api");
        setTasks(Array.isArray(data) ? data : data.tasks || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [navigate]);

  async function toggleDone(t) {
    const newDone = !t.done;

    // Update the screen immediately
    setTasks((prev) =>
      prev.map((x) => (x._id === t._id ? { ...x, done: newDone } : x))
    );

    // Sample data has no backend to save to
    if (offline) return;

    try {
      await api(`/api/${t._id}`, {
        method: "PUT",
        body: JSON.stringify({ title: t.title, task: t.task, done: newDone }),
      });
    } catch (err) {
      // Save failed: undo the change and show why
      setTasks((prev) =>
        prev.map((x) => (x._id === t._id ? { ...x, done: !newDone } : x))
      );
      alert(err.message);
    }
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const inProgress = total - done;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const pending = tasks.filter((t) => !t.done);

  return (
    <div className="body">
      <NavBar />

      <div className="dashboard">
        <header className="dashboardNav">
          <h1>Hi, {user?.name}!</h1>
          <div className="headerActions">
            <button className="button" onClick={() => navigate("/tasks")}>
              <Plus size={16} /> Create
            </button>
            <SearchBox tasks={tasks} />
            <NotificationBell />
          </div>
        </header>

        <div className="dashboardGrid">
          {/* Row 1 */}
          <section className="card dark">
            <h3>Overview</h3>
            <span className="bigNumber">{percent}%</span>
            <span className="bigLabel">of your tasks are done</span>
            <div className="statTiles">
              <div className="statTile"><strong>{total}</strong><span>Total</span></div>
              <div className="statTile"><strong>{inProgress}</strong><span>In progress</span></div>
              <div className="statTile"><strong>{done}</strong><span>Completed</span></div>
            </div>
          </section>

          <section className="card light">
            <h3>Weekly progress</h3>
            <p className="placeholder">Chart coming soon</p>
          </section>

          <section className="card light">
            <h3>Monthly Progress</h3>
            <div className="donut" style={{ "--pct": percent }}>
              <span>{percent}%</span>
            </div>
          </section>

          {/* Row 2 */}
          <section className="card light">
            <h3>Month goals</h3>
            <ul className="goalList">
              {tasks.slice(0, 4).map((t) => (
                <li key={t._id}>
                  <input
                    type="checkbox"
                    checked={!!t.done}
                    onChange={() => toggleDone(t)}
                  />
                  <span className={t.done ? "strike" : ""}>{t.title}</span>
                </li>
              ))}
              {tasks.length === 0 && <li className="placeholder">No goals yet</li>}
            </ul>
          </section>

          <section className="inProcess">
            <h3>Tasks in progress ({pending.length})</h3>
            <div className="taskRow">
              {pending.slice(0, 2).map((t) => (
                <div key={t._id} className="card light taskCard">
                  <strong>{t.title}</strong>
                  {t.task && <p>{t.task}</p>}
                </div>
              ))}
              <Link to="/tasks" className="taskCard addTask">
                <Plus size={18} /> Add task
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Bell } from "lucide-react";
import { api } from "../api";

// Placeholder data until the backend has notifications
const SAMPLE = [
  { id: 1, text: "Welcome to Tidy!" },
  { id: 2, text: "You have 2 tasks left today" },
];

async function fetchNotifications() {
  try {
    const notifications = await api("/notifications");
    setNotifications(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
  }
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([])

  return (
    <div className="bellWrapper">
      <button
        className="iconButton"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={18} />
      </button>

      {open && (
        <div className="dropdown">
          <h4>Notifications</h4>
          {SAMPLE.length === 0 ? (
            <p className="placeholder">Nothing new</p>
          ) : (
            <ul>
              {SAMPLE.map((n) => (
                <li key={n.id}>{n.text}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function NavBar() {
  const navigate = useNavigate();

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    navigate("/login");
  }

  return (
    <nav className="nav" id="nav">
      <h2>Tidy</h2>
      <ul>
        <li><NavLink className="navButton" to="/dashboard">Dashboard</NavLink></li>
        <li className="navDivider" aria-hidden="true"></li>
        <li><NavLink className="navButton" to="/tasks">Tasks</NavLink></li>
        <li className="navDivider" aria-hidden="true"></li>
        <li><NavLink className="navButton" to="/calendar">Calendar</NavLink></li>
        <li className="navDivider" aria-hidden="true"></li>
        <li><NavLink className="navButton" to="/trash">Trash</NavLink></li>
        <li className="navDivider" aria-hidden="true"></li>
        <li><NavLink className="navButton" to="/settings">Settings</NavLink></li>
      </ul>
      <button className="button navLogout" onClick={logout}>Log Out</button>
    </nav>
  );
}
import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import DashBoard from "./pages/dashboard";
import Tasks from "./pages/tasks";
import Calendar from "./pages/calendar";
import Trash from "./pages/trash";
import Settings from "./pages/settings";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<DashBoard />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/trash" element={<Trash />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
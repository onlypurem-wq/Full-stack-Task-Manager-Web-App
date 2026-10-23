import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { getTheme, setTheme } from "../theme";
import NavBar from "../components/sidenav";
import "../styles.css";

export default function Settings() {
  const [theme, setThemeState] = useState(getTheme);

  function choose(next) {
    setTheme(next); // changes the whole app and saves the choice
    setThemeState(next); // updates which button looks selected
  }

  return (
    <div className="body">
      <NavBar />

      <main className="tasksPage">
        <h1>Settings</h1>

        <section className="card light settingsCard">
          <div className="settingRow">
            <div>
              <h3>Theme</h3>
              <p>Choose how Tidy looks.</p>
            </div>

            <div className="tabs" role="group" aria-label="Theme">
              <button
                type="button"
                className={`tab ${theme === "light" ? "active" : ""}`}
                aria-pressed={theme === "light"}
                onClick={() => choose("light")}
              >
                <Sun size={16} /> Light
              </button>
              <button
                type="button"
                className={`tab ${theme === "dark" ? "active" : ""}`}
                aria-pressed={theme === "dark"}
                onClick={() => choose("dark")}
              >
                <Moon size={16} /> Dark
              </button>
            </div>
          </div>
        </section>

        <p className="placeholder">More settings coming soon</p>
      </main>
    </div>
  );
}
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function SearchBox({ tasks }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function toggle() {
    if (open) {
      close();
    } else {
      setOpen(true);
      inputRef.current.focus({ preventScroll: true });
    }
  }

  // Close when you click anywhere outside the search box
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? tasks
        .filter(
          (t) =>
            t.title?.toLowerCase().includes(q) ||
            t.task?.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];

  return (
    <div className="searchWrapper" ref={wrapperRef}>
      <div className={`searchBox ${open ? "open" : ""}`}>
        <button
          type="button"
          className="searchToggle"
          aria-label="Search"
          onClick={toggle}
        >
          <Search size={18} />
        </button>

        {/* Always rendered, so the width can animate */}
        <input
          ref={inputRef}
          className="searchInput"
          type="text"
          placeholder="Search tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && close()}
          tabIndex={open ? 0 : -1}
        />
      </div>

      {open && q && (
        <div className="searchDropdown">
          {results.length === 0 && <p className="placeholder">No matches</p>}
          {results.map((t) => (
            <button
              key={t._id}
              type="button"
              className="searchResult"
              onClick={() => {
                close();
                navigate("/tasks");
              }}
            >
              <span className={t.done ? "strike" : ""}>{t.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
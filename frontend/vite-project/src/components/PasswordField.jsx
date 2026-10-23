import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({ value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);

  return (
    <label className="field">
      <span>Password</span>
      <div className="fieldRow">
        <input
          className="authInput"
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="eyeButton"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}
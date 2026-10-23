import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import "../styles.css";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      // Signup doesn't log you in, so go to the login page
      navigate("/login?registered=1");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1>Create an account</h1>
      <p className="authSub">Please enter your details</p>

      <form className="authForm" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            className="authInput"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            className="authInput"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <p className="authError" role="alert">{error}</p>

        <button type="submit" className="button authSubmit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="authSwitch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
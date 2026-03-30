import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post("/api/auth/login", form);
      const token = res.data.token;
      const decoded = jwtDecode(token);

      if (decoded.role !== "ADMIN") {
        setError("Access denied: Admin privileges required.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <header style={styles.header}>
          <div style={styles.iconCircle}>🔐</div>
          <h2 style={styles.title}>Admin Portal</h2>
          <p style={styles.subtitle}>Please sign in to continue</p>
        </header>

        {error && (
          <div style={styles.errorBox}>
            <span style={{ marginRight: "8px" }}>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            style={isLoading ? styles.buttonDisabled : styles.button}
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <footer style={styles.footer}>
          <p>© 2026 Inventory Management System</p>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a", // Match dashboard slate
    fontFamily: "'Inter', sans-serif",
  },
  loginCard: {
    background: "#1e293b",
    padding: "40px",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
    border: "1px solid #334155",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  iconCircle: {
    fontSize: "32px",
    marginBottom: "15px",
    display: "inline-block",
    padding: "15px",
    background: "rgba(99, 102, 241, 0.1)",
    borderRadius: "50%",
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
  },
  errorBox: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#f87171",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "13px",
    marginBottom: "20px",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#cbd5e1",
    marginLeft: "4px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    padding: "14px",
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.2s, opacity 0.2s",
    marginTop: "10px",
  },
  buttonDisabled: {
    padding: "14px",
    background: "#334155",
    color: "#94a3b8",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "not-allowed",
    marginTop: "10px",
  },
  footer: {
    marginTop: "30px",
    textAlign: "center",
    fontSize: "12px",
    color: "#475569",
  },
};

export default Login;
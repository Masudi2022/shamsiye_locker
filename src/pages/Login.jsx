import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SHAMSIYE_LOGO from "../assets/images/shamsiye.png";

export default function Login() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");

    if (!username.trim() || !password.trim()) {
      return setErr("Enter username and password");
    }

    if (username.trim() === "ranantunga" && password.trim() === "ranantunga") {
      localStorage.setItem("auth_ok", "1");
      nav("/generator");
    } else {
      setErr("Wrong username or password");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>
      <div style={styles.circleThree}></div>

      <div style={styles.card}>
        <div style={styles.badge}>🔐 SECURE LOGIN</div>

        <div style={styles.logoBox}>
          <img src={SHAMSIYE_LOGO} alt="Shamsiye Logo" style={styles.logo} />
        </div>

        <h2 style={styles.title}>SHAMSIYE</h2>
        <p style={styles.subtitle}>Student Tag Generation System</p>

        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>USERNAME</label>
            <div style={styles.inputBox}>
              <span style={styles.inputIcon}>👤</span>
              <input
                style={styles.input}
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>PASSWORD</label>
            <div style={styles.inputBox}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                style={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <button
                type="button"
                style={styles.eyeButton}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {err && <p style={styles.error}>⚠️ {err}</p>}

          <button type="submit" style={styles.button}>
            LOGIN →
          </button>
        </form>

        <p style={styles.footerText}>Authorized users only</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    padding: "20px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at top left, rgba(34,197,94,.32), transparent 34%), radial-gradient(circle at bottom right, rgba(59,130,246,.17), transparent 36%), linear-gradient(180deg, #eafff2 0%, #ffffff 55%, #f8fafc 100%)",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  circleOne: {
    position: "absolute",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "rgba(34,197,94,0.13)",
    top: "-90px",
    left: "-90px",
  },

  circleTwo: {
    position: "absolute",
    width: "230px",
    height: "230px",
    borderRadius: "50%",
    background: "rgba(59,130,246,0.10)",
    bottom: "-80px",
    right: "-80px",
  },

  circleThree: {
    position: "absolute",
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    background: "rgba(22,163,74,0.08)",
    top: "18%",
    right: "14%",
  },

  card: {
    width: "100%",
    maxWidth: "480px",
    padding: "34px",
    borderRadius: "32px",
    background: "rgba(255,255,255,0.97)",
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow:
      "0 32px 85px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.9)",
    boxSizing: "border-box",
    textAlign: "center",
    position: "relative",
    zIndex: 2,
  },

  badge: {
    display: "inline-block",
    padding: "8px 15px",
    marginBottom: "18px",
    borderRadius: "999px",
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #bbf7d0",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.6px",
  },

  logoBox: {
    width: "112px",
    height: "112px",
    margin: "0 auto 18px",
    borderRadius: "30px",
    background: "linear-gradient(180deg, #ffffff, #f8fafc)",
    border: "1px solid rgba(15,23,42,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 22px 42px rgba(22,163,74,0.22)",
    overflow: "hidden",
  },

  logo: {
    width: "88%",
    height: "88%",
    objectFit: "contain",
  },

  title: {
    margin: 0,
    fontSize: "clamp(31px, 7vw, 45px)",
    fontWeight: 950,
    color: "#16a34a",
    letterSpacing: "1px",
  },

  subtitle: {
    margin: "8px 0 28px",
    fontSize: "clamp(13px, 3vw, 15px)",
    color: "#64748b",
    fontWeight: 700,
  },

  form: {
    width: "100%",
    textAlign: "left",
  },

  field: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "0.4px",
  },

  inputBox: {
    width: "100%",
    minHeight: "56px",
    padding: "0 12px",
    borderRadius: "18px",
    border: "1px solid #dbe3ea",
    background: "#ffffff",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
  },

  inputIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "10px",
    background: "#ecfdf5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    flexShrink: 0,
  },

  input: {
    flex: 1,
    width: "100%",
    minWidth: 0,
    border: "none",
    outline: "none",
    fontSize: "16px",
    color: "#0f172a",
    background: "transparent",
  },

  eyeButton: {
    width: "38px",
    height: "38px",
    border: "none",
    borderRadius: "13px",
    background: "#f8fafc",
    color: "#475569",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  error: {
    margin: "0 0 16px",
    padding: "12px 14px",
    borderRadius: "15px",
    background: "#fff1f2",
    border: "1px solid #fecaca",
    color: "#9f1239",
    fontSize: "13px",
    fontWeight: 800,
  },

  button: {
    width: "100%",
    padding: "17px",
    borderRadius: "18px",
    border: "none",
    background: "linear-gradient(135deg, #16a34a, #22c55e)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 20px 38px rgba(22,163,74,0.32)",
    letterSpacing: "0.6px",
  },

  footerText: {
    margin: "18px 0 0",
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 700,
  },
};
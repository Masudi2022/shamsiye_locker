import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SHAMSIYE_LOGO from "../assets/images/shamsiye.png";

export default function Login() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const normalize = (v) => String(v ?? "").trim();

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");

    const u = normalize(username);
    const p = normalize(password);

    if (!u || !p) return setErr("Please enter username and password.");

    if (u === "ranantunga" && p === "ranantunga") {
      localStorage.setItem("auth_ok", "1");
      nav("/generator");
    } else {
      setErr("Wrong username or password");
    }
  };

  const S = useMemo(
    () => ({
      page: {
        minHeight: "100vh",
        padding: "28px 14px",
        background:
          "radial-gradient(1100px 550px at 18% 10%, rgba(34,197,94,.22), transparent 60%), radial-gradient(1100px 550px at 82% 0%, rgba(59,130,246,.12), transparent 55%), linear-gradient(180deg, #eafff2 0%, #ffffff 55%, #f8fafc 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
        color: "#0f172a",
        display: "grid",
        placeItems: "center",
      },

      wrap: {
        width: "100%",
        maxWidth: 980,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1.05fr 0.95fr",
        gap: 18,
        alignItems: "stretch",
        position: "relative",
        zIndex: 1,
      },

      // left brand panel (desktop only)
      left: {
        background: "rgba(255,255,255,.92)",
        border: "1px solid rgba(15,23,42,.08)",
        borderRadius: 26,
        boxShadow: "0 25px 50px rgba(2, 132, 62, 0.12)",
        padding: 26,
        position: "relative",
        overflow: "hidden",
      },

      leftGlow: {
        position: "absolute",
        inset: -220,
        background:
          "radial-gradient(circle at 15% 20%, rgba(34,197,94,.22), transparent 55%), radial-gradient(circle at 80% 10%, rgba(59,130,246,.12), transparent 48%)",
        pointerEvents: "none",
      },

      brandRow: { display: "flex", gap: 16, alignItems: "center", position: "relative" },

      logoWrap: {
        width: 90,
        height: 90,
        borderRadius: 22,
        background: "#ffffff",
        border: "1px solid rgba(15,23,42,.10)",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: "0 14px 24px rgba(15,23,42,.10)",
      },

      logo: { width: "88%", height: "88%", objectFit: "contain" },

      sub: {
        margin: "10px 0 0",
        color: "#475569",
        fontSize: 14,
        maxWidth: 520,
        lineHeight: 1.55,
      },

      badges: {
        marginTop: 18,
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        position: "relative",
      },

      badgeGreen: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 999,
        background: "#ecfdf5",
        border: "1px solid #bbf7d0",
        color: "#065f46",
        fontSize: 13,
        fontWeight: 900,
      },

      badgeBlue: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 999,
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#1d4ed8",
        fontSize: 13,
        fontWeight: 900,
      },

      note: {
        marginTop: 18,
        borderRadius: 20,
        border: "1px solid rgba(15,23,42,.08)",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        padding: 18,
        position: "relative",
      },

      noteTitle: {
        margin: 0,
        fontSize: 14,
        fontWeight: 950,
        display: "flex",
        alignItems: "center",
        gap: 6,
      },

      noteText: {
        margin: "8px 0 0",
        color: "#64748b",
        fontSize: 13,
        lineHeight: 1.5,
      },

      // login card
      card: {
        background: "rgba(255,255,255,.96)",
        border: "1px solid rgba(15,23,42,.10)",
        borderRadius: 26,
        boxShadow: "0 25px 50px rgba(15, 23, 42, 0.10)",
        padding: 26,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      },

      cardTop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        marginBottom: 10,
      },

      mobileLogoWrap: {
        display: "none",
        width: 62,
        height: 62,
        borderRadius: 18,
        background: "#ffffff",
        border: "1px solid rgba(15,23,42,.10)",
        placeItems: "center",
        overflow: "hidden",
        boxShadow: "0 12px 18px rgba(15,23,42,.10)",
        flexShrink: 0,
      },

      cardTitle: {
        margin: 0,
        fontSize: 22,
        fontWeight: 950,
        letterSpacing: "-0.01em",
      },

      cardSub: {
        margin: "8px 0 18px",
        color: "#64748b",
        fontSize: 13,
      },

      field: { marginBottom: 16 },
      label: {
        fontSize: 12,
        fontWeight: 950,
        color: "#0f172a",
        marginBottom: 8,
        letterSpacing: "0.3px",
      },

      inputWrap: {
        display: "flex",
        alignItems: "center",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        padding: "12px 14px",
        gap: 10,
        transition: "border-color .15s ease, box-shadow .15s ease",
      },

      input: {
        flex: 1,
        border: "none",
        outline: "none",
        fontSize: 14,
        background: "transparent",
        color: "#0f172a",
      },

      iconBtn: {
        border: "1px solid #e5e7eb",
        background: "#f8fafc",
        cursor: "pointer",
        padding: "8px 12px",
        borderRadius: 14,
        fontWeight: 900,
        fontSize: 12,
        color: "#0f172a",
      },

      error: {
        marginTop: 2,
        marginBottom: 14,
        padding: "12px 14px",
        borderRadius: 16,
        border: "1px solid #fecaca",
        background: "#fff1f2",
        color: "#9f1239",
        fontWeight: 950,
        fontSize: 12,
      },

      btn: {
        width: "100%",
        padding: "13px 16px",
        borderRadius: 16,
        border: "1px solid #16a34a",
        background: "#16a34a",
        cursor: "pointer",
        fontWeight: 950,
        color: "#ffffff",
        boxShadow: "0 16px 28px rgba(22, 163, 74, 0.22)",
        fontSize: 14,
        letterSpacing: 0.3,
        transition: "transform .15s ease, box-shadow .15s ease, filter .15s ease",
      },

      css: `
        .shell { display: grid; }
        .inputWrap:focus-within {
          border-color: #16a34a;
          box-shadow: 0 0 0 4px rgba(34,197,94,.14);
        }
        .btn:hover {
          filter: brightness(0.98);
          transform: translateY(-2px);
          box-shadow: 0 20px 34px rgba(22, 163, 74, 0.28);
        }
        .btn:active { transform: translateY(0px); }

        .iconBtn:hover { background: #f1f5f9; border-color: #94a3b8; }

        /* subtle shine */
        .shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom right,
            rgba(255,255,255,0) 45%,
            rgba(255,255,255,.28) 50%,
            rgba(255,255,255,0) 55%
          );
          transform: rotate(30deg);
          animation: shine 10s infinite;
          pointer-events: none;
        }
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(30deg); }
          22%, 100% { transform: translateX(100%) rotate(30deg); }
        }

        /* Responsive */
        @media (max-width: 920px) {
          .shell { grid-template-columns: 1fr; }
          .leftPanel { display: none; }
          .mobileLogo { display: grid !important; }
          .card { max-width: 520px; margin: 0 auto; }
        }
        @media (max-width: 420px) {
          .card { padding: 18px; border-radius: 22px; }
        }
      `,
    }),
    []
  );

  return (
    <div style={S.page}>
      <style>{S.css}</style>

      <div className="shell" style={S.wrap}>
        {/* LEFT BRAND (desktop only) */}
        <div className="leftPanel" style={S.left}>
          <div style={S.leftGlow} />

          <div style={S.brandRow}>
            <div style={S.logoWrap}>
              <img src={SHAMSIYE_LOGO} alt="Logo" style={S.logo} />
            </div>

            <div style={{ minWidth: 0 }}>
              <p style={S.sub}>
                Student Tag Generation System.
                <br />
                Sign in to continue.
              </p>

              <div style={S.badges}>
                <span style={S.badgeGreen}>📄 A4 READY</span>
                <span style={S.badgeBlue}>🎓 STREAM • ROLE • ROOM</span>
                <span style={S.badgeGreen}>⚡ INSTANT PRINT</span>
              </div>
            </div>
          </div>

          <div style={S.note}>
            <p style={S.noteTitle}>🔐 Login required</p>
            <p style={S.noteText}>
              Use your assigned username and password to access the generator.
            </p>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="shine" style={S.card}>
          <div style={S.cardTop}>
            <div>
              <h2 style={S.cardTitle}>LOGIN</h2>
              <p style={S.cardSub}>Enter your credentials to continue</p>
            </div>

            <div className="mobileLogo" style={S.mobileLogoWrap}>
              <img
                src={SHAMSIYE_LOGO}
                alt="Logo"
                style={{ width: "88%", height: "88%", objectFit: "contain" }}
              />
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div style={S.field}>
              <div style={S.label}>USERNAME</div>
              <div className="inputWrap" style={S.inputWrap}>
                <input
                  style={S.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  autoComplete="username"
                />
              </div>
            </div>

            <div style={S.field}>
              <div style={S.label}>PASSWORD</div>
              <div className="inputWrap" style={S.inputWrap}>
                <input
                  style={S.input}
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="iconBtn"
                  style={S.iconBtn}
                  onClick={() => setShow((x) => !x)}
                  aria-label={show ? "Hide password" : "Show password"}
                  title={show ? "Hide password" : "Show password"}
                >
                  {show ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {err && <div style={S.error}>⚠️ {err}</div>}

            <button type="submit" className="btn" style={S.btn}>
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

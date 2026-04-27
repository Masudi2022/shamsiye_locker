import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import SHAMSIYE_LOGO from "../assets/images/shamsiye.png";

const STREAMS = [
  "F1 A",
  "F1 B",
  "F1 C",
  "F2 A",
  "F2 B",
  "F2 C",
  "F3 A",
  "F3 B",
  "F3 C",
  "F4 A",
  "F4 B",
  "F4 C",
];

const load = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const save = (k, value) => localStorage.setItem(k, JSON.stringify(value));

const U = (v) => (v == null ? "" : String(v).toUpperCase());

const formatStreamLabel = (stream) => {
  if (!stream) return "";
  const s = String(stream).replace(/\s+/g, "");
  return s.replace(/^([A-Za-z])(\d.*)$/, "$1 $2").toUpperCase();
};

function StreamBox({ value }) {
  return <div className="streamBox">{formatStreamLabel(value)}</div>;
}

export default function Generator() {
  const nav = useNavigate();

  const [stream, setStream] = useState(() => U(load("selected_stream", STREAMS[0])));
  const [name, setName] = useState("");

  const [students, setStudents] = useState(() => {
    const raw = load("students", []);
    if (!Array.isArray(raw)) return [];

    return raw.map((s) => ({
      id: s?.id ?? uuid(),
      name: U(s?.name).trim(),
      stream: U(s?.stream ?? s?.form ?? STREAMS[0]),
      photoDataUrl: s?.photoDataUrl ?? "",
    }));
  });

  useEffect(() => {
    const cleaned = students.map((s) => ({
      id: s?.id ?? uuid(),
      name: U(s?.name).trim(),
      stream: U(s?.stream),
      photoDataUrl: s?.photoDataUrl ?? "",
    }));

    save("students", cleaned);
  }, [students]);

  useEffect(() => {
    save("selected_stream", U(stream));
  }, [stream]);

  const addStudent = () => {
    const NAME = U(name).trim();
    const STREAM = U(stream);

    if (!NAME) return alert("ENTER FULL NAME");

    setStudents((prev) => [
      {
        id: uuid(),
        name: NAME,
        stream: STREAM,
        photoDataUrl: "",
      },
      ...prev,
    ]);

    setName("");
  };

  const remove = (id) => {
    setStudents((p) => p.filter((s) => s.id !== id));
  };

  const clearAll = () => {
    if (!confirm("CLEAR ALL STUDENTS?")) return;
    setStudents([]);
    localStorage.removeItem("students");
  };

  const stats = useMemo(() => {
    const byStream = new Map();

    for (const s of students) {
      const key = U(s.stream);
      byStream.set(key, (byStream.get(key) || 0) + 1);
    }

    return {
      total: students.length,
      byStream,
    };
  }, [students]);

  const S = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(180deg, #ecfdf5 0%, #ffffff 45%, #f8fafc 100%)",
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      color: "#0f172a",
      paddingBottom: 28,
    },

    header: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(236, 253, 245, .95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #bbf7d0",
      boxShadow: "0 12px 24px rgba(22, 163, 74, 0.10)",
    },

    headerInner: {
      maxWidth: 1600,
      margin: "0 auto",
      padding: "14px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 14,
      flexWrap: "wrap",
    },

    brand: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    },

    logoBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: "#fff",
      border: "1px solid #bbf7d0",
      display: "grid",
      placeItems: "center",
      overflow: "hidden",
    },

    logo: {
      width: "86%",
      height: "86%",
      objectFit: "contain",
    },

    title: {
      margin: 0,
      fontSize: 17,
      fontWeight: 950,
    },

    sub: {
      margin: "4px 0 0",
      fontSize: 12,
      color: "#475569",
    },

    actions: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
    },

    btn: {
      padding: "9px 13px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#ffffff",
      cursor: "pointer",
      fontWeight: 900,
      color: "#0f172a",
    },

    btnGreen: {
      padding: "9px 13px",
      borderRadius: 12,
      border: "1px solid #16a34a",
      background: "#16a34a",
      cursor: "pointer",
      fontWeight: 900,
      color: "#ffffff",
    },

    btnDanger: {
      padding: "9px 13px",
      borderRadius: 12,
      border: "1px solid #fecaca",
      background: "#fff1f2",
      cursor: "pointer",
      fontWeight: 900,
      color: "#9f1239",
    },

    container: {
      maxWidth: 1600,
      margin: "0 auto",
      padding: "22px 24px 0",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
      gap: 20,
      alignItems: "start",
    },

    section: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 22,
      padding: 22,
      boxShadow: "0 14px 30px rgba(2, 132, 62, 0.07)",
    },

    full: {
      gridColumn: "1 / -1",
    },

    sectionTitle: {
      margin: 0,
      fontSize: 17,
      fontWeight: 950,
    },

    sectionSub: {
      margin: "6px 0 0",
      fontSize: 13,
      color: "#64748b",
    },

    formRow: {
      marginTop: 18,
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      alignItems: "end",
    },

    field: {
      flex: "1 1 260px",
      minWidth: 0,
    },

    wideField: {
      flex: "2 1 520px",
      minWidth: 0,
    },

    label: {
      fontSize: 13,
      fontWeight: 950,
      color: "#334155",
      marginBottom: 8,
    },

    input: {
      width: "100%",
      padding: "14px 16px",
      borderRadius: 14,
      border: "1px solid #e5e7eb",
      outline: "none",
      textTransform: "uppercase",
      fontSize: 15,
      boxSizing: "border-box",
    },

    select: {
      width: "100%",
      padding: "14px 16px",
      borderRadius: 14,
      border: "1px solid #e5e7eb",
      outline: "none",
      textTransform: "uppercase",
      fontWeight: 900,
      fontSize: 15,
      boxSizing: "border-box",
      background: "#ffffff",
    },

    stats: {
      marginTop: 16,
      paddingTop: 16,
      borderTop: "1px dashed #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      fontSize: 13,
      color: "#64748b",
    },

    chips: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
    },

    chip: {
      padding: "6px 11px",
      borderRadius: 999,
      background: "#f8fafc",
      border: "1px solid #e5e7eb",
      fontSize: 13,
      fontWeight: 900,
      color: "#0f172a",
    },

    tableWrap: {
      marginTop: 16,
      overflowX: "auto",
    },
  };

  return (
    <div style={S.page}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          overflow-x: hidden;
        }

        .streamBox {
          width: 140px;
          height: 64px;
          border: 2px solid #000;
          background: #fff;
          display: grid;
          place-items: center;
          font-size: 38px;
          font-weight: 950;
          letter-spacing: 1px;
          color: #0f172a;
          font-family: Arial, Helvetica, sans-serif;
        }

        .studentsTable {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 620px;
        }

        .studentsTable th {
          background: #f8fafc;
          padding: 14px 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
          text-align: left;
          white-space: nowrap;
        }

        .studentsTable td {
          padding: 14px 12px;
          border-bottom: 1px solid #eef2f7;
          font-size: 14px;
          vertical-align: middle;
          white-space: nowrap;
        }

        .studentsTable tbody tr:nth-child(even) td {
          background: #fcfffd;
        }

        .studentsTable tbody tr:hover td {
          background: #f0fff6;
        }

        .tagPreview {
          width: 220px;
          border: 2px solid #000;
          background: #fff;
        }

        .tagTop {
          display: grid;
          grid-template-columns: 82px 1fr;
          height: 78px;
          border-bottom: 2px solid #000;
        }

        .tagImage {
          border-right: 2px solid #000;
          display: grid;
          place-items: center;
          padding: 6px;
        }

        .tagImage img {
          width: 62px;
          height: 62px;
          object-fit: contain;
        }

        .tagForm {
          display: grid;
          place-items: center;
          font-size: 30px;
          font-weight: 950;
          letter-spacing: 1px;
        }

        .tagName {
          min-height: 42px;
          display: grid;
          place-items: center;
          text-align: center;
          font-size: 12px;
          font-weight: 950;
          padding: 6px;
        }

        .dangerBtn {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid #fecaca;
          background: #fff1f2;
          cursor: pointer;
          font-weight: 950;
          color: #9f1239;
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .streamBox {
            width: 120px;
            height: 56px;
            font-size: 34px;
          }

          .tagPreview {
            width: 200px;
          }
        }
      `}</style>

      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.brand}>
            <div style={S.logoBox}>
              <img src={SHAMSIYE_LOGO} alt="Shamsiye Logo" style={S.logo} />
            </div>

            <div>
              <h2 style={S.title}>SHAMSIYE • CLASS LOCKER TAG GENERATOR</h2>
              <p style={S.sub}>Picture + Form on first row, student name on second row.</p>
            </div>
          </div>

          <div style={S.actions}>
            <button style={S.btnGreen} onClick={() => nav("/verify")}>
              Verify PDF
            </button>

            <button style={S.btnDanger} onClick={clearAll}>
              Clear
            </button>

            <button
              style={S.btn}
              onClick={() => {
                localStorage.removeItem("auth_ok");
                nav("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={S.container}>
        <div style={S.grid}>
          <section style={S.section}>
            <h3 style={S.sectionTitle}>📋 Select Form</h3>
            <p style={S.sectionSub}>This form will appear on the right side of the tag.</p>

            <div style={S.formRow}>
              <div style={S.field}>
                <div style={S.label}>🎯 FORM</div>
                <select value={stream} onChange={(e) => setStream(U(e.target.value))} style={S.select}>
                  {STREAMS.map((f) => (
                    <option key={f} value={U(f)}>
                      {formatStreamLabel(f)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ width: "100%" }}>
                <div style={S.label}>🔍 FORM PREVIEW</div>
                <StreamBox value={stream} />
              </div>
            </div>

            <div style={S.stats}>
              <span>
                Total Students: <b>{stats.total}</b>
              </span>

              <div style={S.chips}>
                {[...stats.byStream.entries()].slice(0, 6).map(([f, n]) => (
                  <span key={f} style={S.chip}>
                    {formatStreamLabel(f)}: {n}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section style={S.section}>
            <h3 style={S.sectionTitle}>➕ Add Student</h3>
            <p style={S.sectionSub}>Only student name and form are needed.</p>

            <div style={S.formRow}>
              <div style={S.wideField}>
                <div style={S.label}>📝 FULL NAME</div>
                <input
                  value={name}
                  onChange={(e) => setName(U(e.target.value))}
                  placeholder='e.g. "SALUM KHALIB GERMANY"'
                  style={S.input}
                />
              </div>

              <div style={{ width: "100%" }}>
                <button style={{ ...S.btnGreen, width: "100%", padding: "14px 16px" }} onClick={addStudent}>
                  ✨ Add Student
                </button>
              </div>
            </div>
          </section>

          <section style={{ ...S.section, ...S.full }}>
            <h3 style={S.sectionTitle}>📋 Student List</h3>
            <p style={S.sectionSub}>Preview layout: first row has picture and form, second row has name.</p>

            <div style={S.tableWrap}>
              <table className="studentsTable">
                <thead>
                  <tr>
                    <th>TAG PREVIEW</th>
                    <th>FULL NAME</th>
                    <th>FORM</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="tagPreview">
                          <div className="tagTop">
                            <div className="tagImage">
                              <img src={SHAMSIYE_LOGO} alt="tag preview" />
                            </div>

                            <div className="tagForm">{formatStreamLabel(s.stream)}</div>
                          </div>

                          <div className="tagName">{U(s.name)}</div>
                        </div>
                      </td>

                      <td style={{ fontWeight: 950 }}>{U(s.name)}</td>

                      <td>
                        <StreamBox value={s.stream} />
                      </td>

                      <td>
                        <button className="dangerBtn" onClick={() => remove(s.id)}>
                          ✖ Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {students.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: 18, color: "#64748b", textAlign: "center" }}>
                        ✨ No students yet. Add your first student above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
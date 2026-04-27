import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";

import TagsDocument from "../pdf/TagsDocument.jsx";
import SHAMSIYE_LOGO from "../assets/images/shamsiye.png";
import PASSPORT_PLACEHOLDER from "../assets/images/shamsiye.png";

const load = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const imageToBase64 = async (imageUrl) => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
};

const formatStreamLabel = (stream) => {
  if (!stream) return "";
  const s = String(stream).replace(/\s+/g, "");
  return s.replace(/^([A-Za-z])(\d.*)$/, "$1 $2").toUpperCase();
};

const getStudentStream = (s) => s?.stream ?? s?.form ?? "";

function TagPreview({ student }) {
  return (
    <div className="tagPreview">
      <div className="tagTop">
        <div className="tagImage">
          <img src={PASSPORT_PLACEHOLDER} alt="passport placeholder" />
        </div>

        <div className="tagForm">{formatStreamLabel(getStudentStream(student))}</div>
      </div>

      <div className="tagName">{String(student?.name || "").toUpperCase()}</div>
    </div>
  );
}

export default function Verify() {
  const nav = useNavigate();

  const [logoDataUrl, setLogoDataUrl] = useState(null);

  useEffect(() => {
    imageToBase64(SHAMSIYE_LOGO)
      .then(setLogoDataUrl)
      .catch((error) => {
        console.error("Logo failed to load:", error);
      });
  }, []);

  const studentsRaw = useMemo(() => load("students", []), []);

  const students = useMemo(() => {
    if (!Array.isArray(studentsRaw)) return [];

    return studentsRaw.map((s) => ({
      id: s?.id,
      name: String(s?.name || "").toUpperCase(),
      stream: getStudentStream(s),
      photoDataUrl: s?.photoDataUrl ?? "",
    }));
  }, [studentsRaw]);

  const S = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(180deg, #f0fff6 0%, #ffffff 40%, #ffffff 100%)",
      padding: "22px 14px",
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      color: "#0f172a",
    },

    container: {
      maxWidth: 1220,
      margin: "0 auto",
    },

    header: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 18,
      padding: 18,
      boxShadow: "0 14px 28px rgba(22, 163, 74, 0.10)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      flexWrap: "wrap",
    },

    brand: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      minWidth: 0,
    },

    logoWrap: {
      width: 52,
      height: 52,
      borderRadius: 14,
      background: "#ecfdf5",
      border: "1px solid #bbf7d0",
      display: "grid",
      placeItems: "center",
      overflow: "hidden",
      flexShrink: 0,
    },

    logo: {
      width: "88%",
      height: "88%",
      objectFit: "contain",
    },

    title: {
      margin: 0,
      fontSize: 20,
      fontWeight: 900,
      lineHeight: 1.1,
    },

    sub: {
      margin: "6px 0 0",
      fontSize: 13,
      color: "#475569",
      maxWidth: 760,
    },

    pill: {
      display: "inline-flex",
      gap: 8,
      alignItems: "center",
      padding: "6px 10px",
      borderRadius: 999,
      background: "#ecfdf5",
      border: "1px solid #bbf7d0",
      color: "#065f46",
      fontSize: 12,
      fontWeight: 800,
      marginTop: 8,
    },

    actions: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
    },

    btn: {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#ffffff",
      cursor: "pointer",
      fontWeight: 900,
      color: "#0f172a",
    },

    btnGreen: {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid #16a34a",
      background: "#16a34a",
      cursor: "pointer",
      fontWeight: 900,
      color: "#ffffff",
      boxShadow: "0 10px 20px rgba(22, 163, 74, 0.18)",
    },

    btnDisabled: {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid #94a3b8",
      background: "#94a3b8",
      cursor: "not-allowed",
      fontWeight: 900,
      color: "#ffffff",
    },

    btnDanger: {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid #fecaca",
      background: "#fff1f2",
      cursor: "pointer",
      fontWeight: 900,
      color: "#9f1239",
    },

    section: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 18,
      padding: 16,
      marginTop: 14,
      boxShadow: "0 10px 25px rgba(2, 132, 62, 0.06)",
    },

    sectionTitle: {
      margin: 0,
      fontSize: 14,
      fontWeight: 900,
    },

    sectionSub: {
      margin: "6px 0 0",
      fontSize: 12,
      color: "#64748b",
    },

    empty: {
      marginTop: 14,
      padding: 16,
      borderRadius: 18,
      border: "1px dashed #cbd5e1",
      background: "#ffffff",
      color: "#475569",
    },

    tableWrap: {
      marginTop: 14,
      overflowX: "auto",
    },
  };

  const clearStudents = () => {
    if (!confirm("Clear all students?")) return;
    localStorage.removeItem("students");
    nav("/generator");
  };

  return (
    <div style={S.page}>
      <style>{`
        .studentsTable {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 620px;
        }

        .studentsTable thead th {
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
          padding: 12px;
          font-size: 12px;
          text-align: left;
          color: #0f172a;
          white-space: nowrap;
        }

        .studentsTable tbody td {
          border-bottom: 1px solid #eef2f7;
          padding: 12px;
          font-size: 13px;
          color: #0f172a;
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
          color: #0f172a;
          font-family: Arial, Helvetica, sans-serif;
        }

        .tagName {
          min-height: 42px;
          display: grid;
          place-items: center;
          text-align: center;
          font-size: 12px;
          font-weight: 950;
          padding: 6px;
          color: #0f172a;
        }

        .formBadge {
          width: 120px;
          height: 56px;
          border: 2px solid #000000;
          background: #ffffff;
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 34px;
          letter-spacing: 1px;
          line-height: 1;
          color: #0b1220;
          font-family: Arial, Helvetica, sans-serif;
          user-select: none;
        }

        @media (max-width: 720px) {
          .tagPreview {
            width: 200px;
          }

          .tagTop {
            grid-template-columns: 74px 1fr;
            height: 72px;
          }

          .tagImage img {
            width: 56px;
            height: 56px;
          }

          .tagForm {
            font-size: 26px;
          }

          .formBadge {
            width: 110px;
            height: 54px;
            font-size: 32px;
          }
        }
      `}</style>

      <div style={S.container}>
        <div style={S.header}>
          <div style={S.brand}>
            <div style={S.logoWrap}>
              <img src={logoDataUrl || SHAMSIYE_LOGO} alt="Shamsiye Logo" style={S.logo} />
            </div>

            <div style={{ minWidth: 0 }}>
              <h2 style={S.title}>Verify & Export PDF</h2>
              <p style={S.sub}>
                Confirm class locker tags: first row has picture and form, second row has student name.
              </p>
              <div style={S.pill}>✅ Picture + Form • Name below • No role • No room</div>
            </div>
          </div>

          <div style={S.actions}>
            <button style={S.btn} onClick={() => nav("/generator")}>
              ← Back
            </button>

            {logoDataUrl ? (
              <PDFDownloadLink
                document={<TagsDocument students={students} logoDataUrl={logoDataUrl} />}
                fileName="shamsiye-class-locker-tags.pdf"
              >
                {({ loading }) => (
                  <button style={S.btnGreen}>
                    {loading ? "Preparing PDF..." : "Download PDF"}
                  </button>
                )}
              </PDFDownloadLink>
            ) : (
              <button style={S.btnDisabled} disabled>
                Loading Logo...
              </button>
            )}

            <button style={S.btnDanger} onClick={clearStudents}>
              Clear Students
            </button>
          </div>
        </div>

        {students.length === 0 ? (
          <div style={S.empty}>No students found. Go back and add students first.</div>
        ) : (
          <div style={S.section}>
            <h3 style={S.sectionTitle}>Preview ({students.length})</h3>
            <p style={S.sectionSub}>
              This preview matches the PDF tag design: picture on the left, form on the right, and name below.
            </p>

            <div style={S.tableWrap}>
              <table className="studentsTable">
                <thead>
                  <tr>
                    <th>TAG PREVIEW</th>
                    <th>FULL NAME</th>
                    <th>FORM</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((s, index) => (
                    <tr key={s.id ?? index}>
                      <td>
                        <TagPreview student={s} />
                      </td>

                      <td style={{ fontWeight: 950 }}>{s.name}</td>

                      <td>
                        <div className="formBadge">{formatStreamLabel(s.stream)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
              Print tip: A4 paper. Disable “Fit to page” if it shrinks too much.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";

import TagsDocument from "../pdf/TagsDocument.jsx";
import SHAMSIYE_LOGO from "../assets/images/shamsiye.jpeg";

const CURRENT_YEAR = "2026";

const BRAND = {
  green: "#3FAE3A",
  greenDark: "#2E8F2D",
  greenDeep: "#1F6F22",
  greenSoft: "#F1FBF0",

  blue: "#16B8CF",
  blueDark: "#0891B2",
  blueSoft: "#E8FAFD",

  black: "#111827",
  muted: "#64748B",
  border: "#DCE7EA",
  white: "#FFFFFF",
};

const load = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const U = (value) => {
  if (value == null) return "";
  return String(value).toUpperCase().trim();
};

const FORM_ALIASES = {
  "1": "ONE",
  "01": "ONE",
  ONE: "ONE",
  FORMONE: "ONE",
  FORM1: "ONE",

  "2": "TWO",
  "02": "TWO",
  TWO: "TWO",
  FORMTWO: "TWO",
  FORM2: "TWO",

  "3": "THREE",
  "03": "THREE",
  THREE: "THREE",
  FORMTHREE: "THREE",
  FORM3: "THREE",

  "4": "FOUR",
  "04": "FOUR",
  FOUR: "FOUR",
  FORMFOUR: "FOUR",
  FORM4: "FOUR",
};

const normalizeForm = (value) => {
  const clean = U(value).replace(/\s+/g, "");
  return FORM_ALIASES[clean] || U(value) || "ONE";
};

const normalizeStreamLetter = (value) => {
  const clean = U(value).replace(/[^A-Z]/g, "");
  return clean.charAt(0) || "A";
};

const formatClassLabel = (form, stream) => {
  return `${normalizeForm(form)} ${normalizeStreamLetter(stream)}`;
};

/**
 * Supports:
 * - { form: "ONE", stream: "B" }
 * - { form: "one", stream: "b" }
 * - { stream: "ONE B" }
 * - { form: "ONE B" }
 * - "ONE B"
 * - "1 A"
 * - "1A"
 */
const parseFormAndStream = (input, maybeStream) => {
  if (typeof input === "object" && input !== null) {
    const objectForm = input.form;
    const objectStream = input.stream;
    const objectClass =
      input.className ||
      input.classCode ||
      input.class ||
      input.selectedClass ||
      input.formStream;

    if (objectForm && objectStream) {
      const formClean = normalizeForm(objectForm);
      const streamString = U(objectStream);
      const streamCompact = streamString.replace(/\s+/g, "");

      const streamLooksCombined =
        streamString.includes(" ") ||
        /^\d+[A-Z]$/.test(streamCompact) ||
        /^(ONE|TWO|THREE|FOUR)[A-Z]$/.test(streamCompact);

      if (!streamLooksCombined && streamString.length <= 2) {
        return {
          form: formClean,
          stream: normalizeStreamLetter(objectStream),
        };
      }
    }

    if (objectClass) return parseFormAndStream(objectClass);
    if (objectStream) return parseFormAndStream(objectStream);
    if (objectForm) return parseFormAndStream(objectForm);
  }

  if (maybeStream) {
    return {
      form: normalizeForm(input),
      stream: normalizeStreamLetter(maybeStream),
    };
  }

  const raw = U(input);
  const spaced = raw.replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
  const compact = raw.replace(/\s+/g, "");

  let match = spaced.match(/^(ONE|TWO|THREE|FOUR)\s+([A-Z])$/);
  if (match) {
    return {
      form: normalizeForm(match[1]),
      stream: normalizeStreamLetter(match[2]),
    };
  }

  match = spaced.match(/^(\d+)\s+([A-Z])$/);
  if (match) {
    return {
      form: normalizeForm(match[1]),
      stream: normalizeStreamLetter(match[2]),
    };
  }

  match = compact.match(/^(ONE|TWO|THREE|FOUR)([A-Z])$/);
  if (match) {
    return {
      form: normalizeForm(match[1]),
      stream: normalizeStreamLetter(match[2]),
    };
  }

  match = compact.match(/^(\d+)([A-Z])$/);
  if (match) {
    return {
      form: normalizeForm(match[1]),
      stream: normalizeStreamLetter(match[2]),
    };
  }

  return {
    form: normalizeForm(raw || "ONE"),
    stream: "A",
  };
};

const getStudentClassParts = (student) => {
  return parseFormAndStream(student);
};

const getYear = (student) => {
  return student?.year || student?.session || CURRENT_YEAR;
};

/**
 * Converts the imported logo image into a safe PNG base64 data URL.
 * This is better for @react-pdf/renderer than passing a Vite image path directly.
 */
const convertImageToSafePngDataUrl = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");

        const maxSize = 700;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          reject(new Error("Logo has invalid dimensions"));
          return;
        }

        const ratio = Math.min(maxSize / width, maxSize / height, 1);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const pngDataUrl = canvas.toDataURL("image/png");
        resolve(pngDataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Logo failed to load"));
    };

    img.src = imageUrl;
  });
};

function TagPreview({ student }) {
  const { form, stream } = getStudentClassParts(student);
  const year = getYear(student);

  return (
    <div className="tagPreview">
      <img className="previewWatermark" src={SHAMSIYE_LOGO} alt="" />

      <div className="greenTopStrip">
        <span />
      </div>

      <div className="previewHeader">
        <div className="previewLogoCircle">
          <img src={SHAMSIYE_LOGO} alt="Shamsiye" />
        </div>

        <div className="previewHeaderText">
          <div className="previewInstitute">SHAMSIYE SCHOOLS</div>
          <div className="previewMotto">ACCESS TO SUCCESS</div>
        </div>
      </div>

      <div className="previewBody">
        <div className="previewDetails">
          <div>
            <b>FORM</b>
            <span>:</span>
            <strong>{normalizeForm(form)}</strong>
          </div>

          <div>
            <b>STREAM</b>
            <span>:</span>
            <strong>{normalizeStreamLetter(stream)}</strong>
          </div>

          <div>
            <b>YEAR</b>
            <span>:</span>
            <strong>{year}</strong>
          </div>
        </div>

        <div className="previewPhoto">
          <img src={SHAMSIYE_LOGO} alt="Profile" />
        </div>
      </div>

      <div className="previewNameBand">
        <span>{U(student?.name || "STUDENT NAME")}</span>
      </div>

      <div className="bottomAccent">
        <span className="accentGreen" />
        <span className="accentBlue" />
        <span className="accentGreenDark" />
      </div>
    </div>
  );
}

export default function Verify() {
  const nav = useNavigate();

  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoError, setLogoError] = useState("");

  useEffect(() => {
    let mounted = true;

    convertImageToSafePngDataUrl(SHAMSIYE_LOGO)
      .then((dataUrl) => {
        if (!mounted) return;

        setLogoDataUrl(dataUrl);
        setLogoError("");
      })
      .catch((error) => {
        console.error("Logo conversion error:", error);

        if (!mounted) return;

        setLogoDataUrl("");
        setLogoError(
          "Logo failed to prepare for PDF. Please check src/assets/images/shamsiye.jpeg"
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  const studentsRaw = useMemo(() => load("students", []), []);

  const students = useMemo(() => {
    if (!Array.isArray(studentsRaw)) return [];

    return studentsRaw.map((student) => {
      const parts = getStudentClassParts(student);
      const safeForm = normalizeForm(parts.form);
      const safeStream = normalizeStreamLetter(parts.stream);
      const safeYear = getYear(student);

      return {
        id: student?.id,
        name: U(student?.name || "STUDENT NAME"),

        // New separated structure
        form: safeForm,
        stream: safeStream,

        // Compatibility labels
        className: formatClassLabel(safeForm, safeStream),
        formStream: formatClassLabel(safeForm, safeStream),

        year: safeYear,
        photoDataUrl: student?.photoDataUrl || "",
      };
    });
  }, [studentsRaw]);

  /**
   * This keeps PDF compatible even if TagsDocument.jsx still expects old data like "ONE B".
   * Preview uses separated form/stream.
   * PDF receives a safe class label too.
   */
  const pdfStudents = useMemo(() => {
    return students.map((student) => {
      const classLabel = formatClassLabel(student.form, student.stream);

      return {
        ...student,
        form: classLabel,
        stream: classLabel,
        className: classLabel,
        formStream: classLabel,

        originalForm: student.form,
        originalStream: student.stream,
      };
    });
  }, [students]);

  const clearStudents = () => {
    if (!confirm("Clear all students?")) return;

    localStorage.removeItem("students");
    nav("/generator");
  };

  const S = {
    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(180deg, #f1fbf0 0%, #ffffff 42%, #f8fafc 100%)",
      padding: "24px 16px",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      color: BRAND.black,
    },

    container: {
      maxWidth: 1260,
      margin: "0 auto",
    },

    header: {
      background: BRAND.white,
      border: `1px solid ${BRAND.border}`,
      borderRadius: 22,
      padding: 20,
      boxShadow: "0 18px 42px rgba(46, 143, 45, 0.11)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
    },

    brand: {
      display: "flex",
      alignItems: "center",
      gap: 15,
      minWidth: 0,
    },

    logoWrap: {
      width: 62,
      height: 62,
      borderRadius: 18,
      background: BRAND.white,
      border: `1px solid ${BRAND.border}`,
      display: "grid",
      placeItems: "center",
      overflow: "hidden",
      flexShrink: 0,
      boxShadow: "0 10px 24px rgba(46, 143, 45, 0.13)",
      padding: 4,
    },

    logo: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },

    title: {
      margin: 0,
      fontSize: 22,
      fontWeight: 950,
      lineHeight: 1.1,
      color: BRAND.black,
    },

    sub: {
      margin: "7px 0 0",
      fontSize: 13,
      color: BRAND.muted,
      maxWidth: 760,
    },

    pill: {
      display: "inline-flex",
      gap: 8,
      alignItems: "center",
      padding: "8px 12px",
      borderRadius: 999,
      background: BRAND.greenSoft,
      border: `1px solid ${BRAND.border}`,
      color: BRAND.greenDark,
      fontSize: 12,
      fontWeight: 900,
      marginTop: 10,
    },

    actions: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center",
    },

    btn: {
      padding: "12px 16px",
      borderRadius: 14,
      border: "1px solid #e5e7eb",
      background: BRAND.white,
      cursor: "pointer",
      fontWeight: 950,
      color: BRAND.black,
    },

    btnPrimaryLink: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px 16px",
      borderRadius: 14,
      border: `1px solid ${BRAND.greenDark}`,
      background: BRAND.greenDark,
      cursor: "pointer",
      fontWeight: 950,
      color: BRAND.white,
      boxShadow: "0 12px 24px rgba(46, 143, 45, 0.22)",
      textDecoration: "none",
      minHeight: 44,
    },

    btnDisabled: {
      padding: "12px 16px",
      borderRadius: 14,
      border: "1px solid #94a3b8",
      background: "#94a3b8",
      cursor: "not-allowed",
      fontWeight: 950,
      color: BRAND.white,
    },

    btnDanger: {
      padding: "12px 16px",
      borderRadius: 14,
      border: "1px solid #fecaca",
      background: "#fff1f2",
      cursor: "pointer",
      fontWeight: 950,
      color: "#9f1239",
    },

    section: {
      background: BRAND.white,
      border: `1px solid ${BRAND.border}`,
      borderRadius: 24,
      padding: 20,
      marginTop: 18,
      boxShadow: "0 14px 34px rgba(15, 23, 42, 0.07)",
    },

    sectionTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 14,
      flexWrap: "wrap",
    },

    sectionTitle: {
      margin: 0,
      fontSize: 17,
      fontWeight: 950,
      color: BRAND.black,
    },

    sectionSub: {
      margin: "7px 0 0",
      fontSize: 13,
      color: BRAND.muted,
    },

    empty: {
      marginTop: 18,
      padding: 20,
      borderRadius: 20,
      border: "1px dashed #cbd5e1",
      background: BRAND.white,
      color: BRAND.muted,
    },

    errorBox: {
      marginTop: 18,
      padding: 14,
      borderRadius: 16,
      border: "1px solid #fecaca",
      background: "#fff1f2",
      color: "#991b1b",
      fontWeight: 800,
      fontSize: 13,
    },
  };

  return (
    <div style={S.page}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .previewGrid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 22px;
        }

        .tagPreview {
          position: relative;
          overflow: hidden;
          min-height: 260px;
          border-radius: 0;
          border: 1.5px solid ${BRAND.border};
          background: ${BRAND.white};
          box-shadow: 0 22px 46px rgba(15, 23, 42, 0.12);
          padding-bottom: 24px;
        }

        .previewWatermark {
          position: absolute;
          width: 220px;
          height: 220px;
          object-fit: contain;
          opacity: 0.04;
          left: 50%;
          top: 54%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .greenTopStrip {
          height: 8px;
          width: 100%;
          background: ${BRAND.greenDark};
          position: relative;
        }

        .greenTopStrip span {
          position: absolute;
          right: 0;
          top: 0;
          width: 18%;
          height: 100%;
          background: ${BRAND.blue};
        }

        .previewHeader {
          position: relative;
          min-height: 76px;
          background: ${BRAND.white};
          border-bottom: 1px solid ${BRAND.border};
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          overflow: hidden;
        }

        .previewHeader::after {
          content: "";
          position: absolute;
          left: 20px;
          bottom: 0;
          width: 42%;
          height: 3px;
          background: linear-gradient(90deg, ${BRAND.greenDark}, ${BRAND.blue});
        }

        .previewLogoCircle {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: ${BRAND.white};
          display: grid;
          place-items: center;
          padding: 4px;
          position: relative;
          z-index: 2;
          flex-shrink: 0;
          border: 1px solid ${BRAND.border};
          box-shadow: 0 8px 18px rgba(46, 143, 45, 0.10);
          overflow: hidden;
        }

        .previewLogoCircle img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .previewHeaderText {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .previewInstitute {
          color: ${BRAND.black};
          font-size: 20px;
          font-weight: 950;
          letter-spacing: .8px;
          line-height: 1;
          position: relative;
          z-index: 2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .previewMotto {
          margin-top: 7px;
          color: ${BRAND.greenDark};
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 1.8px;
          position: relative;
          z-index: 2;
          white-space: nowrap;
        }

        .previewBody {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 22px;
          padding: 26px 28px 14px;
        }

        .previewDetails {
          flex: 1;
          display: grid;
          gap: 12px;
        }

        .previewDetails div {
          display: grid;
          grid-template-columns: 82px 16px 1fr;
          align-items: center;
          font-size: 14px;
          color: ${BRAND.black};
        }

        .previewDetails b,
        .previewDetails strong {
          font-weight: 950;
          color: ${BRAND.black};
        }

        .previewPhoto {
          width: 98px;
          height: 98px;
          border-radius: 18px;
          border: 1.5px solid ${BRAND.border};
          background: ${BRAND.white};
          display: grid;
          place-items: center;
          padding: 10px;
          flex-shrink: 0;
          box-shadow: 0 10px 22px rgba(46, 143, 45, 0.12);
          overflow: hidden;
        }

        .previewPhoto img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .previewNameBand {
          position: relative;
          margin: 16px 28px 0;
          min-height: 46px;
          border-radius: 16px;
          background: ${BRAND.greenDark};
          color: ${BRAND.white};
          display: grid;
          place-items: center;
          padding: 10px 54px;
          box-shadow: inset 0 -2px 0 rgba(0,0,0,.08);
          overflow: hidden;
        }

        .previewNameBand::before,
        .previewNameBand::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 24px;
          height: 4px;
          background: ${BRAND.blue};
          border-radius: 999px;
          transform: translateY(-50%);
        }

        .previewNameBand::before {
          left: 18px;
        }

        .previewNameBand::after {
          right: 18px;
        }

        .previewNameBand span {
          font-size: 17px;
          font-weight: 950;
          letter-spacing: 1.4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .bottomAccent {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          height: 6px;
        }

        .bottomAccent span {
          flex: 1;
        }

        .accentGreen {
          background: ${BRAND.greenDark};
        }

        .accentBlue {
          background: ${BRAND.blue};
          max-width: 18%;
        }

        .accentGreenDark {
          background: ${BRAND.greenDeep};
        }

        @media (max-width: 620px) {
          .previewGrid {
            grid-template-columns: 1fr;
          }

          .previewInstitute {
            font-size: 16px;
          }

          .previewMotto {
            font-size: 6px;
          }

          .previewDetails div {
            grid-template-columns: 70px 12px 1fr;
            font-size: 11px;
          }

          .previewPhoto {
            width: 74px;
            height: 74px;
          }

          .previewNameBand {
            padding: 10px 42px;
          }

          .previewNameBand span {
            font-size: 13px;
          }

          .tagPreview {
            min-height: 245px;
          }
        }
      `}</style>

      <div style={S.container}>
        <div style={S.header}>
          <div style={S.brand}>
            <div style={S.logoWrap}>
              <img src={SHAMSIYE_LOGO} alt="Shamsiye Logo" style={S.logo} />
            </div>

            <div style={{ minWidth: 0 }}>
              <h2 style={S.title}>Verify & Export  Tags</h2>

              <p style={S.sub}>
                Preview your printable student tags before downloading the PDF.
                The logo is prepared safely for the PDF document.
              </p>

              <div style={S.pill}>
                ✅ No ID Number • Form & Stream separated • Logo included
              </div>
            </div>
          </div>

          <div style={S.actions}>
            <button style={S.btn} onClick={() => nav("/generator")}>
              ← Back
            </button>

            {students.length === 0 ? (
              <button style={S.btnDisabled} disabled>
                Add Students First
              </button>
            ) : logoError ? (
              <button style={S.btnDisabled} disabled>
                Logo Error
              </button>
            ) : !logoDataUrl ? (
              <button style={S.btnDisabled} disabled>
                Preparing Logo...
              </button>
            ) : (
              <PDFDownloadLink
                document={
                  <TagsDocument
                    students={pdfStudents}
                    logoDataUrl={logoDataUrl}
                  />
                }
                fileName="shamsiye-professional-student-tags.pdf"
                style={S.btnPrimaryLink}
              >
                {({ loading, error }) => {
                  if (error) {
                    console.error("PDF generation error:", error);
                    return "PDF Error";
                  }

                  return loading ? "Preparing PDF..." : "Download PDF";
                }}
              </PDFDownloadLink>
            )}

            <button style={S.btnDanger} onClick={clearStudents}>
              Clear Students
            </button>
          </div>
        </div>

        {logoError && <div style={S.errorBox}>{logoError}</div>}

        {students.length === 0 ? (
          <div style={S.empty}>
            No students found. Go back and add students first.
          </div>
        ) : (
          <section style={S.section}>
            <div style={S.sectionTop}>
              <div>
                <h3 style={S.sectionTitle}>Tag Preview ({students.length})</h3>

                <p style={S.sectionSub}>
                  Preview and PDF export both use separated form and stream
                  values.
                </p>
              </div>
            </div>

            <div className="previewGrid">
              {students.map((student, index) => (
                <TagPreview key={student?.id ?? index} student={student} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
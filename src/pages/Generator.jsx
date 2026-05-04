import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import SHAMSIYE_LOGO from "../assets/images/shamsiye.jpeg";

const FORMS = ["ONE", "TWO", "THREE", "FOUR"];
const STREAMS = ["A", "B", "C"];

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
  text: "#111827",
  muted: "#64748B",
  border: "#DCE7EA",
  white: "#FFFFFF",
  pageBg: "#F8FAFC",
};

const load = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

/**
 * General uppercase formatter.
 * This trims, so DO NOT use it directly while typing names.
 */
const U = (value) => {
  if (value == null) return "";
  return String(value).toUpperCase().trim();
};

/**
 * Use this while typing names.
 * It keeps normal spaces working.
 */
const formatNameWhileTyping = (value) => {
  if (value == null) return "";

  return String(value)
    .toUpperCase()
    .replace(/\s{2,}/g, " ");
};

/**
 * Use this only when saving or displaying final names.
 */
const sanitizeNameForSave = (value) => {
  if (value == null) return "";

  return String(value)
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
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

const cleanClassCode = (form, stream) => {
  return `${normalizeForm(form)}${normalizeStreamLetter(stream)}`;
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

      const streamLooksCombined =
        streamString.includes(" ") ||
        /^\d+[A-Z]$/.test(streamString.replace(/\s+/g, "")) ||
        /^(ONE|TWO|THREE|FOUR)[A-Z]$/.test(
          streamString.replace(/\s+/g, "")
        );

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

const formatClassLabel = (form, stream) => {
  return `${normalizeForm(form)} ${normalizeStreamLetter(stream)}`;
};

const formatClassDisplay = (form, stream) => {
  return `FORM: ${normalizeForm(form)}  •  STREAM: ${normalizeStreamLetter(
    stream
  )}`;
};

const getStudentClassParts = (student) => {
  return parseFormAndStream(student);
};

const countStudentsInClass = (students, form, stream) => {
  const targetCode = cleanClassCode(form, stream);

  return students.filter((student) => {
    const parts = getStudentClassParts(student);
    return cleanClassCode(parts.form, parts.stream) === targetCode;
  }).length;
};

const generateStudentId = (form, stream, year, students) => {
  const formCode = cleanClassCode(form, stream);
  const classCount = countStudentsInClass(students, form, stream) + 1;
  const number = String(classCount).padStart(3, "0");

  return `SHM-${year}-${formCode}-${number}`;
};

function IdCardPreview({ student }) {
  const { form, stream } = getStudentClassParts(student);
  const year = student?.year || CURRENT_YEAR;

  return (
    <div className="idCardPreview">
      <img className="watermarkLogo" src={SHAMSIYE_LOGO} alt="" />

      <div className="topGreenStrip">
        <span />
      </div>

      <div className="idHeader">
        <div className="headerLogoCircle">
          <img src={SHAMSIYE_LOGO} alt="Shamsiye" />
        </div>

        <div className="headerText">
          <div className="schoolName">SHAMSIYE SCHOOLS</div>
          <div className="schoolMotto">ACCESS TO SUCCESS</div>
        </div>
      </div>

      <div className="idBody">
        <div className="idDetails">
          <div>
            <b>FORM</b>
            <span>:</span>
            <strong>{form}</strong>
          </div>

          <div>
            <b>STREAM</b>
            <span>:</span>
            <strong>{stream}</strong>
          </div>

          <div>
            <b>YEAR</b>
            <span>:</span>
            <strong>{year}</strong>
          </div>
        </div>

        <div className="photoBox">
          <img src={SHAMSIYE_LOGO} alt="Student placeholder" />
        </div>
      </div>

      <div className="nameBand">
        <span>{sanitizeNameForSave(student?.name || "STUDENT NAME")}</span>
      </div>

      <div className="bottomAccent">
        <span className="accentGreen" />
        <span className="accentBlue" />
        <span className="accentGreenDark" />
      </div>
    </div>
  );
}

function StreamBox({ form, stream }) {
  return <div className="streamBox">{formatClassDisplay(form, stream)}</div>;
}

export default function Generator() {
  const navigate = useNavigate();

  const savedClass = parseFormAndStream(
    load("selected_class", null) ||
      {
        form: load("selected_form", FORMS[0]),
        stream: load("selected_stream_letter", STREAMS[0]),
      } ||
      "ONE A"
  );

  const [form, setForm] = useState(savedClass.form);
  const [stream, setStream] = useState(savedClass.stream);

  const [name, setName] = useState("");
  const [year, setYear] = useState(CURRENT_YEAR);

  const [students, setStudents] = useState(() => {
    const raw = load("students", []);
    if (!Array.isArray(raw)) return [];

    return raw.map((student, index) => {
      const parts = getStudentClassParts(student);
      const safeForm = normalizeForm(parts.form);
      const safeStream = normalizeStreamLetter(parts.stream);
      const safeYear = student?.year || student?.session || CURRENT_YEAR;

      const oldId =
        student?.studentId ||
        student?.student_id ||
        student?.admissionNo ||
        "";

      const generatedId =
        oldId ||
        `SHM-${safeYear}-${cleanClassCode(safeForm, safeStream)}-${String(
          index + 1
        ).padStart(3, "0")}`;

      return {
        id: student?.id ?? uuid(),
        name: sanitizeNameForSave(student?.name),
        form: safeForm,
        stream: safeStream,
        className: formatClassLabel(safeForm, safeStream),
        year: safeYear,
        studentId: generatedId,
        photoDataUrl: student?.photoDataUrl ?? "",
      };
    });
  });

  useEffect(() => {
    const cleaned = students.map((student) => {
      const parts = getStudentClassParts(student);
      const safeForm = normalizeForm(parts.form);
      const safeStream = normalizeStreamLetter(parts.stream);

      return {
        id: student?.id ?? uuid(),
        name: sanitizeNameForSave(student?.name),

        // New supported structure
        form: safeForm,
        stream: safeStream,

        // Helpful for old files / display
        className: formatClassLabel(safeForm, safeStream),

        year: student?.year || CURRENT_YEAR,
        studentId: student?.studentId,
        photoDataUrl: student?.photoDataUrl ?? "",
      };
    });

    save("students", cleaned);
  }, [students]);

  useEffect(() => {
    save("selected_form", form);
    save("selected_stream_letter", stream);
    save("selected_class", {
      form,
      stream,
      className: formatClassLabel(form, stream),
    });
  }, [form, stream]);

  const previewStudentId = generateStudentId(
    form,
    stream,
    year || CURRENT_YEAR,
    students
  );

  const previewStudent = {
    name: name || "STUDENT NAME",
    form,
    stream,
    className: formatClassLabel(form, stream),
    year: year || CURRENT_YEAR,
    studentId: previewStudentId,
  };

  const addStudent = () => {
    const NAME = sanitizeNameForSave(name);
    const FORM = normalizeForm(form);
    const STREAM = normalizeStreamLetter(stream);
    const YEAR = String(year || CURRENT_YEAR).trim();

    if (!NAME) return alert("ENTER FULL NAME");

    const STUDENT_ID = generateStudentId(FORM, STREAM, YEAR, students);

    setStudents((previous) => [
      {
        id: uuid(),
        name: NAME,

        // New supported structure
        form: FORM,
        stream: STREAM,

        // Helpful for compatibility/display
        className: formatClassLabel(FORM, STREAM),

        year: YEAR,
        studentId: STUDENT_ID,
        photoDataUrl: "",
      },
      ...previous,
    ]);

    setName("");
  };

  const removeStudent = (id) => {
    setStudents((previous) => previous.filter((student) => student.id !== id));
  };

  const clearAll = () => {
    if (!confirm("CLEAR ALL STUDENTS?")) return;

    setStudents([]);
    localStorage.removeItem("students");
  };

  const stats = useMemo(() => {
    const byClass = new Map();

    for (const student of students) {
      const parts = getStudentClassParts(student);
      const key = formatClassLabel(parts.form, parts.stream);
      byClass.set(key, (byClass.get(key) || 0) + 1);
    }

    return {
      total: students.length,
      byClass,
    };
  }, [students]);

  const S = {
    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(180deg, #f1fbf0 0%, #ffffff 42%, #f8fafc 100%)",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      color: BRAND.text,
      paddingBottom: 30,
    },

    header: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(255, 255, 255, .96)",
      backdropFilter: "blur(14px)",
      borderBottom: `1px solid ${BRAND.border}`,
      boxShadow: "0 12px 28px rgba(46, 143, 45, 0.10)",
    },

    headerInner: {
      maxWidth: 1500,
      margin: "0 auto",
      padding: "16px 26px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16,
      flexWrap: "wrap",
    },

    brand: {
      display: "flex",
      alignItems: "center",
      gap: 14,
    },

    logoBox: {
      width: 54,
      height: 54,
      borderRadius: 18,
      background: BRAND.white,
      border: `1px solid ${BRAND.border}`,
      display: "grid",
      placeItems: "center",
      overflow: "hidden",
      boxShadow: "0 10px 24px rgba(46, 143, 45, 0.14)",
      padding: 4,
    },

    logo: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },

    title: {
      margin: 0,
      fontSize: 18,
      fontWeight: 950,
      color: BRAND.black,
    },

    sub: {
      margin: "5px 0 0",
      fontSize: 12,
      color: BRAND.muted,
    },

    actions: {
      display: "flex",
      gap: 9,
      flexWrap: "wrap",
    },

    btn: {
      padding: "11px 15px",
      borderRadius: 14,
      border: "1px solid #e5e7eb",
      background: BRAND.white,
      cursor: "pointer",
      fontWeight: 950,
      color: BRAND.black,
    },

    btnPrimary: {
      padding: "11px 15px",
      borderRadius: 14,
      border: `1px solid ${BRAND.greenDark}`,
      background: BRAND.greenDark,
      cursor: "pointer",
      fontWeight: 950,
      color: BRAND.white,
      boxShadow: "0 10px 22px rgba(46, 143, 45, 0.22)",
    },

    btnDanger: {
      padding: "11px 15px",
      borderRadius: 14,
      border: "1px solid #fecaca",
      background: "#fff1f2",
      cursor: "pointer",
      fontWeight: 950,
      color: "#9f1239",
    },

    container: {
      maxWidth: 1500,
      margin: "0 auto",
      padding: "24px 26px 0",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "minmax(380px, 520px) 1fr",
      gap: 22,
      alignItems: "start",
    },

    section: {
      background: BRAND.white,
      border: `1px solid ${BRAND.border}`,
      borderRadius: 26,
      padding: 24,
      boxShadow: "0 16px 38px rgba(15, 23, 42, 0.07)",
    },

    full: {
      gridColumn: "1 / -1",
    },

    sectionTitle: {
      margin: 0,
      fontSize: 18,
      fontWeight: 950,
      color: BRAND.black,
    },

    sectionSub: {
      margin: "7px 0 0",
      fontSize: 13,
      color: BRAND.muted,
    },

    formGrid: {
      marginTop: 20,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },

    fullField: {
      gridColumn: "1 / -1",
    },

    label: {
      fontSize: 13,
      fontWeight: 950,
      color: BRAND.black,
      marginBottom: 9,
    },

    input: {
      width: "100%",
      padding: "15px 17px",
      borderRadius: 16,
      border: `1px solid ${BRAND.border}`,
      outline: "none",
      textTransform: "uppercase",
      fontSize: 15,
      boxSizing: "border-box",
      background: BRAND.white,
      color: BRAND.black,
    },

    select: {
      width: "100%",
      padding: "15px 17px",
      borderRadius: 16,
      border: `1px solid ${BRAND.border}`,
      outline: "none",
      textTransform: "uppercase",
      fontWeight: 900,
      fontSize: 15,
      boxSizing: "border-box",
      background: BRAND.white,
      color: BRAND.black,
    },

    addBtn: {
      marginTop: 18,
      width: "100%",
      padding: "16px 18px",
      borderRadius: 16,
      border: `1px solid ${BRAND.greenDark}`,
      background: BRAND.greenDark,
      cursor: "pointer",
      fontWeight: 950,
      color: BRAND.white,
      fontSize: 15,
      boxShadow: "0 12px 24px rgba(46, 143, 45, 0.22)",
    },

    stats: {
      marginTop: 18,
      paddingTop: 18,
      borderTop: `1px dashed ${BRAND.border}`,
      display: "flex",
      justifyContent: "space-between",
      gap: 14,
      flexWrap: "wrap",
      fontSize: 13,
      color: BRAND.muted,
    },

    chips: {
      display: "flex",
      gap: 9,
      flexWrap: "wrap",
    },

    chip: {
      padding: "7px 12px",
      borderRadius: 999,
      background: BRAND.greenSoft,
      border: `1px solid ${BRAND.border}`,
      fontSize: 13,
      fontWeight: 900,
      color: BRAND.greenDark,
    },

    tableWrap: {
      marginTop: 18,
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
          min-width: 190px;
          min-height: 52px;
          padding: 12px 16px;
          border: 2px solid ${BRAND.greenDark};
          border-radius: 16px;
          background: ${BRAND.greenSoft};
          display: inline-grid;
          place-items: center;
          font-size: 15px;
          font-weight: 950;
          letter-spacing: .3px;
          color: ${BRAND.black};
          font-family: Arial, Helvetica, sans-serif;
          white-space: nowrap;
        }

        .idCardPreview {
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 590px;
          min-height: 260px;
          border-radius: 0;
          border: 1.5px solid ${BRAND.border};
          background: ${BRAND.white};
          box-shadow: 0 22px 46px rgba(15, 23, 42, 0.12);
          padding-bottom: 24px;
        }

        .watermarkLogo {
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

        .topGreenStrip {
          height: 8px;
          width: 100%;
          background: ${BRAND.greenDark};
          position: relative;
        }

        .topGreenStrip span {
          position: absolute;
          right: 0;
          top: 0;
          width: 18%;
          height: 100%;
          background: ${BRAND.blue};
        }

        .idHeader {
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

        .idHeader::after {
          content: "";
          position: absolute;
          left: 20px;
          bottom: 0;
          width: 42%;
          height: 3px;
          background: linear-gradient(90deg, ${BRAND.greenDark}, ${BRAND.blue});
        }

        .headerLogoCircle {
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

        .headerLogoCircle img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .headerText {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .schoolName {
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

        .schoolMotto {
          margin-top: 7px;
          color: ${BRAND.greenDark};
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 1.8px;
          position: relative;
          z-index: 2;
          white-space: nowrap;
        }

        .idBody {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 22px;
          padding: 26px 28px 14px;
        }

        .idDetails {
          flex: 1;
          display: grid;
          gap: 12px;
        }

        .idDetails div {
          display: grid;
          grid-template-columns: 82px 16px 1fr;
          align-items: center;
          font-size: 14px;
          color: ${BRAND.black};
        }

        .idDetails b,
        .idDetails strong {
          font-weight: 950;
          color: ${BRAND.black};
        }

        .photoBox {
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

        .photoBox img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .nameBand {
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

        .nameBand::before,
        .nameBand::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 24px;
          height: 4px;
          background: ${BRAND.blue};
          border-radius: 999px;
          transform: translateY(-50%);
        }

        .nameBand::before {
          left: 18px;
        }

        .nameBand::after {
          right: 18px;
        }

        .nameBand span {
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

        .studentsTable {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 720px;
        }

        .studentsTable th {
          background: ${BRAND.greenSoft};
          padding: 15px 13px;
          border-bottom: 1px solid ${BRAND.border};
          font-size: 13px;
          text-align: left;
          white-space: nowrap;
          color: ${BRAND.black};
        }

        .studentsTable td {
          padding: 15px 13px;
          border-bottom: 1px solid #eef2f7;
          font-size: 14px;
          vertical-align: middle;
          white-space: nowrap;
          color: ${BRAND.black};
        }

        .studentsTable tbody tr:nth-child(even) td {
          background: #fcfffd;
        }

        .studentsTable tbody tr:hover td {
          background: #f1fbf0;
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

        @media (max-width: 900px) {
          .generatorGridFix {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 620px) {
          .schoolName {
            font-size: 16px;
          }

          .schoolMotto {
            font-size: 6px;
          }

          .idDetails div {
            grid-template-columns: 70px 12px 1fr;
            font-size: 11px;
          }

          .photoBox {
            width: 74px;
            height: 74px;
          }

          .nameBand {
            padding: 10px 42px;
          }

          .nameBand span {
            font-size: 13px;
          }

          .streamBox {
            min-width: 160px;
            min-height: 46px;
            font-size: 13px;
          }

          .idCardPreview {
            min-height: 245px;
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
              <h2 style={S.title}>SHAMSIYE • PROFESSIONAL TAG GENERATOR</h2>
              <p style={S.sub}>
                Create premium student tags with separated form and stream,
                soft green branding, and clean printable design.
              </p>
            </div>
          </div>

          <div style={S.actions}>
            <button style={S.btnPrimary} onClick={() => navigate("/verify")}>
              Verify & Download PDF
            </button>

            <button style={S.btnDanger} onClick={clearAll}>
              Clear
            </button>

            <button
              style={S.btn}
              onClick={() => {
                localStorage.removeItem("auth_ok");
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={S.container}>
        <div className="generatorGridFix" style={S.grid}>
          <section style={S.section}>
            <h3 style={S.sectionTitle}>Add Student Tag</h3>
            <p style={S.sectionSub}>
              Enter student name, form, and stream. The saved structure is now
              form and stream separately.
            </p>

            <div style={S.formGrid}>
              <div style={S.fullField}>
                <div style={S.label}>FULL NAME</div>
                <input
                  value={name}
                  onChange={(e) =>
                    setName(formatNameWhileTyping(e.target.value))
                  }
                  placeholder='e.g. "SALUM KHALIB GERMANY"'
                  style={S.input}
                />
              </div>

              <div>
                <div style={S.label}>FORM</div>
                <select
                  value={form}
                  onChange={(e) => setForm(normalizeForm(e.target.value))}
                  style={S.select}
                >
                  {FORMS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={S.label}>STREAM</div>
                <select
                  value={stream}
                  onChange={(e) =>
                    setStream(normalizeStreamLetter(e.target.value))
                  }
                  style={S.select}
                >
                  {STREAMS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div style={S.fullField}>
                <div style={S.label}>YEAR</div>
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder={CURRENT_YEAR}
                  style={S.input}
                />
              </div>
            </div>

            <button style={S.addBtn} onClick={addStudent}>
              ✨ Add Student Tag
            </button>

            <div style={S.stats}>
              <span>
                Total Students: <b>{stats.total}</b>
              </span>

              <div style={S.chips}>
                {[...stats.byClass.entries()]
                  .slice(0, 6)
                  .map(([klass, number]) => {
                    const parts = parseFormAndStream(klass);

                    return (
                      <span key={klass} style={S.chip}>
                        {formatClassDisplay(parts.form, parts.stream)}:{" "}
                        {number}
                      </span>
                    );
                  })}
              </div>
            </div>
          </section>

          <section style={S.section}>
            <h3 style={S.sectionTitle}>Live Tag Preview</h3>
            <p style={S.sectionSub}>
              No ID number, no top student ID badge, separated form and stream,
              rounded logo container, and padded name tag.
            </p>

            <div style={{ marginTop: 20 }}>
              <IdCardPreview student={previewStudent} />
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={S.label}>Selected Class</div>
              <StreamBox form={form} stream={stream} />
            </div>
          </section>

          <section style={{ ...S.section, ...S.full }}>
            <h3 style={S.sectionTitle}>Student List</h3>
            <p style={S.sectionSub}>
              These students will be exported in the PDF using separate form and
              stream values.
            </p>

            <div style={S.tableWrap}>
              <table className="studentsTable">
                <thead>
                  <tr>
                    <th>FULL NAME</th>
                    <th>FORM</th>
                    <th>STREAM</th>
                    <th>YEAR</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => {
                    const parts = getStudentClassParts(student);

                    return (
                      <tr key={student.id}>
                        <td style={{ fontWeight: 950 }}>
                          {sanitizeNameForSave(student.name)}
                        </td>

                        <td>
                          <StreamBox form={parts.form} stream={parts.stream} />
                        </td>

                        <td style={{ fontWeight: 950 }}>{parts.stream}</td>

                        <td>{student.year || CURRENT_YEAR}</td>

                        <td>
                          <button
                            className="dangerBtn"
                            onClick={() => removeStudent(student.id)}
                          >
                            ✖ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {students.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: 20,
                          color: BRAND.muted,
                          textAlign: "center",
                        }}
                      >
                        No students yet. Add your first student above.
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
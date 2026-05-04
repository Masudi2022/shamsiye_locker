import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import SHAMSIYE_LOGO from "../assets/images/shamsiye.jpeg";

const FORMS = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX"];

const FORM_STREAM_OPTIONS = {
  ONE: ["A", "B", "C"],
  TWO: ["A", "B", "C"],
  THREE: ["A", "B", "C"],
  FOUR: ["A", "B", "C"],
  FIVE: ["HGE", "EGM", "PCM", "PCB", "CBG"],
  SIX: ["HGE", "EGM", "PCM", "PCB", "CBG"],
};

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

const U = (value) => {
  if (value == null) return "";
  return String(value).toUpperCase().trim();
};

const formatNameWhileTyping = (value) => {
  if (value == null) return "";

  return String(value)
    .toUpperCase()
    .replace(/\s{2,}/g, " ");
};

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

  "5": "FIVE",
  "05": "FIVE",
  FIVE: "FIVE",
  FORMFIVE: "FIVE",
  FORM5: "FIVE",

  "6": "SIX",
  "06": "SIX",
  SIX: "SIX",
  FORMSIX: "SIX",
  FORM6: "SIX",
};

const normalizeForm = (value) => {
  const clean = U(value).replace(/\s+/g, "");
  return FORM_ALIASES[clean] || U(value) || "ONE";
};

const isAdvancedForm = (form) => {
  const cleanForm = normalizeForm(form);
  return cleanForm === "FIVE" || cleanForm === "SIX";
};

const getStreamLabel = (form) => {
  return isAdvancedForm(form) ? "COMBINATION" : "STREAM";
};

const getStreamsForForm = (form) => {
  const cleanForm = normalizeForm(form);
  return FORM_STREAM_OPTIONS[cleanForm] || ["A", "B", "C"];
};

const normalizeStream = (value, form = "ONE") => {
  const clean = U(value).replace(/[^A-Z0-9]/g, "");
  const availableStreams = getStreamsForForm(form);

  if (!clean) return availableStreams[0] || "A";

  return clean;
};

const cleanClassCode = (form, stream) => {
  return `${normalizeForm(form)}${normalizeStream(stream, form)}`;
};

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

      return {
        form: formClean,
        stream: normalizeStream(objectStream, formClean),
      };
    }

    if (objectClass) return parseFormAndStream(objectClass);
    if (objectStream) return parseFormAndStream(objectStream);
    if (objectForm) return parseFormAndStream(objectForm);
  }

  if (maybeStream) {
    const formClean = normalizeForm(input);

    return {
      form: formClean,
      stream: normalizeStream(maybeStream, formClean),
    };
  }

  const raw = U(input);
  const spaced = raw
    .replace(/[-_/]+/g, " ")
    .replace(/\bFORM\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const compact = spaced.replace(/\s+/g, "");

  let match = spaced.match(
    /^(ONE|TWO|THREE|FOUR|FIVE|SIX)\s+([A-Z0-9]{1,5})$/
  );
  if (match) {
    const formClean = normalizeForm(match[1]);

    return {
      form: formClean,
      stream: normalizeStream(match[2], formClean),
    };
  }

  match = spaced.match(/^(\d+)\s+([A-Z0-9]{1,5})$/);
  if (match) {
    const formClean = normalizeForm(match[1]);

    return {
      form: formClean,
      stream: normalizeStream(match[2], formClean),
    };
  }

  match = compact.match(/^(ONE|TWO|THREE|FOUR|FIVE|SIX)([A-Z0-9]{1,5})$/);
  if (match) {
    const formClean = normalizeForm(match[1]);

    return {
      form: formClean,
      stream: normalizeStream(match[2], formClean),
    };
  }

  match = compact.match(/^(\d+)([A-Z0-9]{1,5})$/);
  if (match) {
    const formClean = normalizeForm(match[1]);

    return {
      form: formClean,
      stream: normalizeStream(match[2], formClean),
    };
  }

  const formClean = normalizeForm(spaced || "ONE");

  return {
    form: formClean,
    stream: getStreamsForForm(formClean)[0] || "A",
  };
};

const formatClassLabel = (form, stream) => {
  return `${normalizeForm(form)} ${normalizeStream(stream, form)}`;
};

const formatClassDisplay = (form, stream) => {
  const cleanForm = normalizeForm(form);

  return `FORM: ${cleanForm}  •  ${getStreamLabel(cleanForm)}: ${normalizeStream(
    stream,
    cleanForm
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
            <b>{getStreamLabel(form)}</b>
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
        stream: load("selected_stream_letter", getStreamsForForm(FORMS[0])[0]),
      } ||
      "ONE A"
  );

  const [form, setForm] = useState(savedClass.form);
  const [stream, setStream] = useState(savedClass.stream);

  const [name, setName] = useState("");
  const [year, setYear] = useState(CURRENT_YEAR);

  const availableStreams = useMemo(() => getStreamsForForm(form), [form]);

  const [students, setStudents] = useState(() => {
    const raw = load("students", []);
    if (!Array.isArray(raw)) return [];

    return raw.map((student, index) => {
      const parts = getStudentClassParts(student);
      const safeForm = normalizeForm(parts.form);
      const safeStream = normalizeStream(parts.stream, safeForm);
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
    const allowedStreams = getStreamsForForm(form);

    if (!allowedStreams.includes(stream)) {
      setStream(allowedStreams[0] || "A");
    }
  }, [form, stream]);

  useEffect(() => {
    const cleaned = students.map((student) => {
      const parts = getStudentClassParts(student);
      const safeForm = normalizeForm(parts.form);
      const safeStream = normalizeStream(parts.stream, safeForm);

      return {
        id: student?.id ?? uuid(),
        name: sanitizeNameForSave(student?.name),
        form: safeForm,
        stream: safeStream,
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
    const STREAM = normalizeStream(stream, FORM);
    const YEAR = String(year || CURRENT_YEAR).trim();

    if (!NAME) return alert("ENTER FULL NAME");

    const STUDENT_ID = generateStudentId(FORM, STREAM, YEAR, students);

    setStudents((previous) => [
      {
        id: uuid(),
        name: NAME,
        form: FORM,
        stream: STREAM,
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
      width: "100%",
      overflowX: "hidden",
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
      width: "100%",
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
      minWidth: 0,
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
      flexShrink: 0,
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
      lineHeight: 1.2,
    },

    sub: {
      margin: "5px 0 0",
      fontSize: 12,
      color: BRAND.muted,
      lineHeight: 1.5,
      maxWidth: 760,
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
      minHeight: 44,
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
      minHeight: 44,
    },

    btnDanger: {
      padding: "11px 15px",
      borderRadius: 14,
      border: "1px solid #fecaca",
      background: "#fff1f2",
      cursor: "pointer",
      fontWeight: 950,
      color: "#9f1239",
      minHeight: 44,
    },

    container: {
      width: "100%",
      maxWidth: 1500,
      margin: "0 auto",
      padding: "24px 26px 0",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "minmax(360px, 520px) minmax(0, 1fr)",
      gap: 22,
      alignItems: "start",
      width: "100%",
    },

    section: {
      background: BRAND.white,
      border: `1px solid ${BRAND.border}`,
      borderRadius: 26,
      padding: 24,
      boxShadow: "0 16px 38px rgba(15, 23, 42, 0.07)",
      minWidth: 0,
      width: "100%",
    },

    full: {
      gridColumn: "1 / -1",
    },

    sectionTitle: {
      margin: 0,
      fontSize: 18,
      fontWeight: 950,
      color: BRAND.black,
      lineHeight: 1.25,
    },

    sectionSub: {
      margin: "7px 0 0",
      fontSize: 13,
      color: BRAND.muted,
      lineHeight: 1.5,
    },

    formGrid: {
      marginTop: 20,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },

    fullField: {
      gridColumn: "1 / -1",
      minWidth: 0,
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
      minHeight: 50,
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
      minHeight: 50,
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
      minHeight: 52,
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
      width: "100%",
    },
  };

  return (
    <div style={S.page}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          min-height: 100%;
          margin: 0;
        }

        body {
          overflow-x: hidden;
        }

        button,
        input,
        select {
          font: inherit;
          max-width: 100%;
        }

        button {
          touch-action: manipulation;
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
          text-align: center;
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
          min-width: 0;
        }

        .idDetails div {
          display: grid;
          grid-template-columns: 112px 16px 1fr;
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
          min-height: 42px;
        }

        @media (max-width: 1200px) {
          .generatorGridFix {
            grid-template-columns: minmax(320px, 460px) minmax(0, 1fr) !important;
            gap: 18px !important;
          }

          .generatorSection {
            padding: 22px !important;
          }
        }

        @media (max-width: 980px) {
          .generatorGridFix {
            grid-template-columns: 1fr !important;
          }

          .idCardPreview {
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .generatorHeaderInner {
            padding: 14px 16px !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .generatorBrand {
            width: 100% !important;
            align-items: flex-start !important;
          }

          .generatorBrandText {
            min-width: 0 !important;
          }

          .generatorTitle {
            font-size: 16px !important;
          }

          .generatorSub {
            font-size: 12px !important;
          }

          .generatorActions {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }

          .generatorActions button {
            width: 100% !important;
            padding: 12px 10px !important;
          }

          .verifyPdfBtn {
            grid-column: 1 / -1 !important;
          }

          .generatorContainer {
            padding: 18px 14px 0 !important;
          }

          .generatorSection {
            padding: 18px !important;
            border-radius: 22px !important;
          }

          .generatorFormGrid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          .mobileFullField {
            grid-column: 1 / -1 !important;
          }

          .statsBox {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .classChips {
            width: 100% !important;
          }

          .classChips span {
            max-width: 100% !important;
          }

          .tableWrapResponsive {
            overflow-x: visible !important;
          }

          .studentsTable {
            min-width: 0 !important;
            width: 100% !important;
            border-spacing: 0 12px !important;
          }

          .studentsTable thead {
            display: none !important;
          }

          .studentsTable,
          .studentsTable tbody,
          .studentsTable tr,
          .studentsTable td {
            display: block !important;
            width: 100% !important;
          }

          .studentsTable tr {
            border: 1px solid ${BRAND.border};
            border-radius: 18px;
            overflow: hidden;
            background: ${BRAND.white};
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
            margin-bottom: 12px;
          }

          .studentsTable td {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 12px !important;
            white-space: normal !important;
            padding: 13px 14px !important;
            border-bottom: 1px solid #eef2f7 !important;
            text-align: right !important;
          }

          .studentsTable td::before {
            content: attr(data-label);
            flex: 0 0 120px;
            text-align: left;
            font-size: 12px;
            font-weight: 950;
            color: ${BRAND.muted};
          }

          .studentsTable td:last-child {
            border-bottom: none !important;
          }

          .studentsTable tbody tr:nth-child(even) td {
            background: ${BRAND.white};
          }

          .studentsTable tbody tr:hover td {
            background: ${BRAND.white};
          }

          .studentsTable td .streamBox {
            min-width: 0;
            width: auto;
            max-width: calc(100% - 130px);
            white-space: normal;
            font-size: 12px;
            padding: 10px 12px;
          }

          .emptyRowCell {
            display: block !important;
            text-align: center !important;
          }

          .emptyRowCell::before {
            display: none !important;
            content: "" !important;
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
            grid-template-columns: 96px 12px 1fr;
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

        @media (max-width: 480px) {
          .generatorHeaderInner {
            padding: 12px 12px !important;
          }

          .generatorLogoBox {
            width: 46px !important;
            height: 46px !important;
            border-radius: 15px !important;
          }

          .generatorTitle {
            font-size: 14px !important;
            line-height: 1.25 !important;
          }

          .generatorSub {
            display: none !important;
          }

          .generatorActions {
            grid-template-columns: 1fr !important;
          }

          .generatorContainer {
            padding: 14px 10px 0 !important;
          }

          .generatorSection {
            padding: 15px !important;
            border-radius: 18px !important;
          }

          .sectionTitleMobile {
            font-size: 16px !important;
          }

          .sectionSubMobile {
            font-size: 12px !important;
          }

          .idHeader {
            min-height: 66px;
            padding: 12px 14px;
            gap: 10px;
          }

          .idHeader::after {
            left: 14px;
            width: 56%;
          }

          .headerLogoCircle {
            width: 44px;
            height: 44px;
            border-radius: 13px;
          }

          .schoolName {
            font-size: 14px;
            letter-spacing: .4px;
          }

          .schoolMotto {
            margin-top: 5px;
            font-size: 6px;
            letter-spacing: 1.2px;
          }

          .idBody {
            padding: 18px 16px 10px;
            gap: 12px;
          }

          .idDetails {
            gap: 9px;
          }

          .idDetails div {
            grid-template-columns: 90px 10px 1fr;
            font-size: 10.5px;
          }

          .photoBox {
            width: 68px;
            height: 68px;
            border-radius: 15px;
            padding: 8px;
          }

          .nameBand {
            margin: 12px 16px 0;
            min-height: 42px;
            border-radius: 14px;
            padding: 9px 34px;
          }

          .nameBand::before,
          .nameBand::after {
            width: 18px;
            height: 3px;
          }

          .nameBand::before {
            left: 11px;
          }

          .nameBand::after {
            right: 11px;
          }

          .nameBand span {
            font-size: 12px;
            letter-spacing: .7px;
          }

          .watermarkLogo {
            width: 170px;
            height: 170px;
          }

          .dangerBtn {
            width: 100%;
          }
        }

        @media (max-width: 360px) {
          .generatorBrand {
            gap: 10px !important;
          }

          .generatorTitle {
            font-size: 13px !important;
          }

          .idBody {
            align-items: flex-start;
          }

          .photoBox {
            width: 60px;
            height: 60px;
          }

          .idDetails div {
            grid-template-columns: 82px 8px 1fr;
            font-size: 10px;
          }

          .streamBox {
            min-width: 0;
            width: 100%;
            white-space: normal;
          }
        }
      `}</style>

      <header style={S.header}>
        <div className="generatorHeaderInner" style={S.headerInner}>
          <div className="generatorBrand" style={S.brand}>
            <div className="generatorLogoBox" style={S.logoBox}>
              <img src={SHAMSIYE_LOGO} alt="Shamsiye Logo" style={S.logo} />
            </div>

            <div className="generatorBrandText">
              <h2 className="generatorTitle" style={S.title}>
                SHAMSIYE • LOCKER TAG GENERATOR
              </h2>
              <p className="generatorSub" style={S.sub}>
                
              </p>
            </div>
          </div>

          <div className="generatorActions" style={S.actions}>
            <button
              className="verifyPdfBtn"
              style={S.btnPrimary}
              onClick={() => navigate("/verify")}
            >
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

      <main className="generatorContainer" style={S.container}>
        <div className="generatorGridFix" style={S.grid}>
          <section className="generatorSection" style={S.section}>
            <h3 className="sectionTitleMobile" style={S.sectionTitle}>
              Add Student Tag
            </h3>
            <p className="sectionSubMobile" style={S.sectionSub}>
              Enter student name, form, and stream. The saved structure is now
              form and stream separately.
            </p>

            <div className="generatorFormGrid" style={S.formGrid}>
              <div className="mobileFullField" style={S.fullField}>
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

              <div className="mobileFullField">
                <div style={S.label}>FORM</div>
                <select
                  value={form}
                  onChange={(e) => {
                    const selectedForm = normalizeForm(e.target.value);
                    setForm(selectedForm);
                    setStream(getStreamsForForm(selectedForm)[0] || "A");
                  }}
                  style={S.select}
                >
                  {FORMS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mobileFullField">
                <div style={S.label}>{getStreamLabel(form)}</div>
                <select
                  value={stream}
                  onChange={(e) =>
                    setStream(normalizeStream(e.target.value, form))
                  }
                  style={S.select}
                >
                  {availableStreams.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mobileFullField" style={S.fullField}>
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
              Add Student Tag
            </button>

            <div className="statsBox" style={S.stats}>
              <span>
                Total Students: <b>{stats.total}</b>
              </span>

              <div className="classChips" style={S.chips}>
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

          <section className="generatorSection" style={S.section}>
            <h3 className="sectionTitleMobile" style={S.sectionTitle}>
              Live Tag Preview
            </h3>
            <p className="sectionSubMobile" style={S.sectionSub}>
              No ID number, no top student ID badge, separated form and stream,
              rounded logo container, and padded name tag.
            </p>

            <div style={{ marginTop: 20, width: "100%" }}>
              <IdCardPreview student={previewStudent} />
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={S.label}>Selected Class</div>
              <StreamBox form={form} stream={stream} />
            </div>
          </section>

          <section
            className="generatorSection"
            style={{ ...S.section, ...S.full }}
          >
            <h3 className="sectionTitleMobile" style={S.sectionTitle}>
              Student List
            </h3>
            <p style={S.sectionSub}>
              These students will be exported in the PDF using separate form,
              stream or combination, and year values.
            </p>

            <div className="tableWrapResponsive" style={S.tableWrap}>
              <table className="studentsTable">
                <thead>
                  <tr>
                    <th>FULL NAME</th>
                    <th>FORM</th>
                    <th>STREAM / COMBINATION</th>
                    <th>YEAR</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => {
                    const parts = getStudentClassParts(student);

                    return (
                      <tr key={student.id}>
                        <td data-label="FULL NAME" style={{ fontWeight: 950 }}>
                          {sanitizeNameForSave(student.name)}
                        </td>

                        <td data-label="FORM">
                          <StreamBox form={parts.form} stream={parts.stream} />
                        </td>

                        <td
                          data-label={getStreamLabel(parts.form)}
                          style={{ fontWeight: 950 }}
                        >
                          {parts.stream}
                        </td>

                        <td data-label="YEAR">
                          {student.year || CURRENT_YEAR}
                        </td>

                        <td data-label="ACTION">
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
                        className="emptyRowCell"
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
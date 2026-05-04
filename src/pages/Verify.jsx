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

const FORM_STREAM_OPTIONS = {
  ONE: ["A", "B", "C"],
  TWO: ["A", "B", "C"],
  THREE: ["A", "B", "C"],
  FOUR: ["A", "B", "C"],
  FIVE: ["HGE", "EGM", "PCM", "PCB", "CBG"],
  SIX: ["HGE", "EGM", "PCM", "PCB", "CBG"],
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

const formatClassLabel = (form, stream) => {
  const safeForm = normalizeForm(form);
  const safeStream = normalizeStream(stream, safeForm);

  return `${safeForm} ${safeStream}`;
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
      const streamString = U(objectStream);
      const streamCompact = streamString.replace(/\s+/g, "");

      const streamLooksCombined =
        streamString.includes(" ") ||
        /^\d+[A-Z0-9]{1,5}$/.test(streamCompact) ||
        /^(ONE|TWO|THREE|FOUR|FIVE|SIX)[A-Z0-9]{1,5}$/.test(streamCompact);

      if (streamLooksCombined) {
        return parseFormAndStream(objectStream);
      }

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

const getStudentClassParts = (student) => {
  return parseFormAndStream(student);
};

const getYear = (student) => {
  return student?.year || student?.session || CURRENT_YEAR;
};

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
            <b>{getStreamLabel(form)}</b>
            <span>:</span>
            <strong>{normalizeStream(stream, form)}</strong>
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
      const safeStream = normalizeStream(parts.stream, safeForm);
      const safeYear = getYear(student);
      const classLabel = formatClassLabel(safeForm, safeStream);

      return {
        id: student?.id,
        name: U(student?.name || "STUDENT NAME"),

        form: safeForm,
        stream: safeStream,

        className: classLabel,
        formStream: classLabel,

        year: safeYear,
        photoDataUrl: student?.photoDataUrl || "",
      };
    });
  }, [studentsRaw]);

  const pdfStudents = useMemo(() => {
    return students.map((student) => {
      const classLabel = formatClassLabel(student.form, student.stream);

      return {
        ...student,

        form: student.form,
        stream: student.stream,

        className: classLabel,
        formStream: classLabel,

        originalForm: student.form,
        originalStream: student.stream,
        streamLabel: getStreamLabel(student.form),
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
      padding: "clamp(12px, 2.5vw, 24px)",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      color: BRAND.black,
      overflowX: "hidden",
    },

    container: {
      width: "100%",
      maxWidth: 1320,
      margin: "0 auto",
    },

    header: {
      background: BRAND.white,
      border: `1px solid ${BRAND.border}`,
      borderRadius: 22,
      padding: "clamp(14px, 2.4vw, 20px)",
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
      flex: "1 1 360px",
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
      fontSize: "clamp(18px, 2.4vw, 22px)",
      fontWeight: 950,
      lineHeight: 1.1,
      color: BRAND.black,
    },

    sub: {
      margin: "7px 0 0",
      fontSize: "clamp(12px, 1.8vw, 13px)",
      color: BRAND.muted,
      maxWidth: 760,
      lineHeight: 1.5,
    },

    actions: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "flex-end",
      flex: "0 1 auto",
    },

    btn: {
      padding: "12px 16px",
      borderRadius: 14,
      border: "1px solid #e5e7eb",
      background: BRAND.white,
      cursor: "pointer",
      fontWeight: 950,
      color: BRAND.black,
      minHeight: 44,
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
      minHeight: 44,
    },

    btnDanger: {
      padding: "12px 16px",
      borderRadius: 14,
      border: "1px solid #fecaca",
      background: "#fff1f2",
      cursor: "pointer",
      fontWeight: 950,
      color: "#9f1239",
      minHeight: 44,
    },

    section: {
      background: BRAND.white,
      border: `1px solid ${BRAND.border}`,
      borderRadius: 24,
      padding: "clamp(14px, 2.4vw, 20px)",
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
      fontSize: "clamp(15px, 2vw, 17px)",
      fontWeight: 950,
      color: BRAND.black,
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

        html,
        body {
          overflow-x: hidden;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        .verifyHeader {
          width: 100%;
        }

        .verifyActions button,
        .verifyActions a {
          white-space: nowrap;
          transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
        }

        .verifyActions button:hover,
        .verifyActions a:hover {
          transform: translateY(-1px);
        }

        .previewGrid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 370px), 1fr));
          gap: clamp(14px, 2.2vw, 22px);
          align-items: stretch;
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
          width: 100%;
        }

        .previewWatermark {
          position: absolute;
          width: clamp(150px, 32vw, 220px);
          height: clamp(150px, 32vw, 220px);
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
          gap: clamp(10px, 1.7vw, 14px);
          padding: clamp(12px, 2vw, 14px) clamp(14px, 2.4vw, 20px);
          overflow: hidden;
        }

        .previewHeader::after {
          content: "";
          position: absolute;
          left: clamp(14px, 2.4vw, 20px);
          bottom: 0;
          width: 42%;
          height: 3px;
          background: linear-gradient(90deg, ${BRAND.greenDark}, ${BRAND.blue});
        }

        .previewLogoCircle {
          width: clamp(44px, 7vw, 52px);
          height: clamp(44px, 7vw, 52px);
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
          font-size: clamp(15px, 2.3vw, 20px);
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
          font-size: clamp(6px, 1vw, 8px);
          font-weight: 950;
          letter-spacing: clamp(1px, .28vw, 1.8px);
          position: relative;
          z-index: 2;
          white-space: nowrap;
        }

        .previewBody {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: clamp(12px, 2.4vw, 22px);
          padding: clamp(18px, 2.8vw, 26px) clamp(16px, 3vw, 28px) 14px;
        }

        .previewDetails {
          flex: 1;
          display: grid;
          gap: clamp(8px, 1.6vw, 12px);
          min-width: 0;
        }

        .previewDetails div {
          display: grid;
          grid-template-columns: clamp(86px, 21vw, 112px) 14px minmax(0, 1fr);
          align-items: center;
          font-size: clamp(10.5px, 1.5vw, 14px);
          color: ${BRAND.black};
          min-width: 0;
        }

        .previewDetails b,
        .previewDetails strong {
          font-weight: 950;
          color: ${BRAND.black};
        }

        .previewDetails strong {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .previewPhoto {
          width: clamp(66px, 12vw, 98px);
          height: clamp(66px, 12vw, 98px);
          border-radius: clamp(14px, 2vw, 18px);
          border: 1.5px solid ${BRAND.border};
          background: ${BRAND.white};
          display: grid;
          place-items: center;
          padding: clamp(7px, 1.4vw, 10px);
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
          margin: clamp(12px, 2vw, 16px) clamp(16px, 3vw, 28px) 0;
          min-height: clamp(42px, 6vw, 46px);
          border-radius: 16px;
          background: ${BRAND.greenDark};
          color: ${BRAND.white};
          display: grid;
          place-items: center;
          padding: 10px clamp(36px, 8vw, 54px);
          box-shadow: inset 0 -2px 0 rgba(0,0,0,.08);
          overflow: hidden;
        }

        .previewNameBand::before,
        .previewNameBand::after {
          content: "";
          position: absolute;
          top: 50%;
          width: clamp(16px, 4vw, 24px);
          height: 4px;
          background: ${BRAND.blue};
          border-radius: 999px;
          transform: translateY(-50%);
        }

        .previewNameBand::before {
          left: clamp(12px, 3vw, 18px);
        }

        .previewNameBand::after {
          right: clamp(12px, 3vw, 18px);
        }

        .previewNameBand span {
          font-size: clamp(12px, 2vw, 17px);
          font-weight: 950;
          letter-spacing: clamp(.6px, .22vw, 1.4px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          text-align: center;
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

        @media (min-width: 1180px) {
          .previewGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (min-width: 760px) and (max-width: 1179px) {
          .previewGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 759px) {
          .previewGrid {
            grid-template-columns: 1fr;
          }

          .verifyHeader {
            align-items: stretch !important;
          }

          .verifyActions {
            width: 100% !important;
            justify-content: stretch !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 10px !important;
          }

          .verifyActions button,
          .verifyActions a {
            width: 100% !important;
            text-align: center;
          }
        }

        @media (max-width: 560px) {
          .verifyBrand {
            align-items: flex-start !important;
          }

          .verifyLogoWrap {
            width: 52px !important;
            height: 52px !important;
            border-radius: 15px !important;
          }

          .verifyActions {
            grid-template-columns: 1fr !important;
          }

          .tagPreview {
            min-height: 238px;
          }

          .previewHeader {
            min-height: 68px;
          }

          .previewBody {
            align-items: flex-start;
          }

          .previewNameBand span {
            white-space: normal;
            line-height: 1.15;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }

        @media (max-width: 390px) {
          .previewBody {
            padding-left: 12px;
            padding-right: 12px;
            gap: 10px;
          }

          .previewDetails div {
            grid-template-columns: 80px 9px minmax(0, 1fr);
            font-size: 10px;
          }

          .previewPhoto {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            padding: 6px;
          }

          .previewNameBand {
            margin-left: 12px;
            margin-right: 12px;
            padding-left: 30px;
            padding-right: 30px;
          }

          .previewInstitute {
            font-size: 14px;
          }

          .previewMotto {
            font-size: 5.8px;
          }
        }
      `}</style>

      <div style={S.container}>
        <div style={S.header} className="verifyHeader">
          <div style={S.brand} className="verifyBrand">
            <div style={S.logoWrap} className="verifyLogoWrap">
              <img src={SHAMSIYE_LOGO} alt="Shamsiye Logo" style={S.logo} />
            </div>

            <div style={{ minWidth: 0 }}>
              <h2 style={S.title}>Verify & Export Tags</h2>

              <p style={S.sub}>
                Preview your printable student tags before downloading the PDF.
                The logo is prepared safely for the PDF document.
              </p>
            </div>
          </div>

          <div style={S.actions} className="verifyActions">
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
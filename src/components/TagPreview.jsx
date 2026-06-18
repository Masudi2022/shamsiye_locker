import React from "react";

const BRAND = {
  // Primary blue picked from the Shamsiye logo
  primary: "#0F90CA",
  primaryDark: "#0879A8",
  primaryDeep: "#075F86",
  primarySoft: "#E8F6FC",

  // Secondary green accent from the logo
  accent: "#4F9637",
  accentDark: "#3F7F2E",
  accentSoft: "#EEF8EA",

  black: "#111827",
  muted: "#64748B",
  border: "#111827",
  white: "#FFFFFF",
};

const cleanText = (value, fallback = "") => {
  if (value == null) return fallback;
  const text = String(value).toUpperCase().replace(/\s+/g, " ").trim();
  return text || fallback;
};

export default function TagPreview({ student = {}, logoDataUrl = "" }) {
  const name = cleanText(student.name, "STUDENT NAME");
  const form = cleanText(student.form, "FORM");
  const room = cleanText(student.room || student.roomNumber || student.roomNo, "ROOM");
  const stream = cleanText(student.stream, "STREAM");

  return (
    <div
      style={{
        width: 360,
        height: 150,
        border: `2px solid ${BRAND.primaryDeep}`,
        display: "grid",
        gridTemplateColumns: "1.12fr 1fr",
        fontFamily: "Arial, Helvetica, sans-serif",
        background: BRAND.white,
        overflow: "hidden",
        boxShadow: "0 10px 24px rgba(15, 144, 202, 0.14)",
      }}
    >
      {/* LEFT SIDE */}
      <div
        style={{
          borderRight: `2px solid ${BRAND.primaryDeep}`,
          display: "grid",
          gridTemplateRows: "1fr 1fr",
          minWidth: 0,
        }}
      >
        {/* LOGO AREA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 7,
            background: BRAND.white,
          }}
        >
          {logoDataUrl ? (
            <img
              src={logoDataUrl}
              alt="logo"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: BRAND.muted,
              }}
            >
              No logo
            </div>
          )}
        </div>

        {/* STUDENT DETAILS */}
        <div
          style={{
            borderTop: `2px solid ${BRAND.primaryDeep}`,
            padding: "6px 8px",
            background: BRAND.primarySoft,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: 12,
              textAlign: "center",
              color: BRAND.primaryDeep,
              letterSpacing: 0.7,
              marginBottom: 3,
            }}
          >
            STUDENT
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: 15,
              fontWeight: 900,
              color: BRAND.black,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={name}
          >
            {name}
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: 14,
              fontWeight: 800,
              color: BRAND.accentDark,
              marginTop: 3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={stream}
          >
            {stream}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: "34px 54px 1fr",
          minWidth: 0,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            borderBottom: `2px solid ${BRAND.primaryDeep}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 0.7,
            color: BRAND.white,
            background: BRAND.primary,
            textAlign: "center",
            padding: "0 6px",
          }}
        >
          SHAMSIYE
        </div>

        {/* FORM */}
        <div
          style={{
            borderBottom: `2px solid ${BRAND.primaryDeep}`,
            display: "grid",
            gridTemplateColumns: "54px 1fr",
            alignItems: "stretch",
            background: BRAND.white,
          }}
        >
          <div
            style={{
              borderRight: `2px solid ${BRAND.primaryDeep}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 900,
              color: BRAND.primaryDeep,
              background: BRAND.primarySoft,
            }}
          >
            FORM
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 29,
              fontWeight: 950,
              color: BRAND.black,
              lineHeight: 1,
            }}
          >
            {form}
          </div>
        </div>

        {/* ROOM */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "54px 1fr",
            alignItems: "stretch",
            background: BRAND.white,
          }}
        >
          <div
            style={{
              borderRight: `2px solid ${BRAND.primaryDeep}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 900,
              color: BRAND.white,
              background: BRAND.accent,
            }}
          >
            ROOM
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 43,
              fontWeight: 950,
              color: BRAND.primaryDeep,
              lineHeight: 1,
              padding: "0 6px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={room}
          >
            {room}
          </div>
        </div>
      </div>
    </div>
  );
}
import React from "react";

export default function TagPreview({ student, logoDataUrl }) {
  const { name, form, room, stream } = student;

  return (
    <div
      style={{
        width: 360,
        height: 150,
        border: "2px solid #111",
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        fontFamily: "Arial",
        background: "white",
      }}
    >
      {/* LEFT */}
      <div style={{ borderRight: "2px solid #111", display: "grid", gridTemplateRows: "1fr 1fr" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 6 }}>
          {logoDataUrl ? (
            <img src={logoDataUrl} alt="logo" style={{ maxWidth: "100%", maxHeight: "100%" }} />
          ) : (
            <div style={{ fontSize: 12 }}>No logo</div>
          )}
        </div>

        <div style={{ borderTop: "2px solid #111", padding: 8 }}>
          <div style={{ fontWeight: "700", fontSize: 18, textAlign: "center" }}>Student</div>
          <div style={{ textAlign: "center", fontSize: 18 }}>{name}</div>
          <div style={{ textAlign: "center", fontSize: 18 }}>{stream}</div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: "grid", gridTemplateRows: "1fr 1fr 1fr" }}>
        <div style={{ borderBottom: "2px solid #111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          Student
        </div>
        <div style={{ borderBottom: "2px solid #111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, fontWeight: 800 }}>
          {form}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, fontWeight: 900 }}>
          {room}
        </div>
      </div>
    </div>
  );
}

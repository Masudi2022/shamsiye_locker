import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const BORDER = 2;
const INCH = 72;

/**
 * ✅ PDF Layout:
 * Row 1: Picture | Form
 * Row 2: Student Name
 * ✅ 3 columns × 7 rows = 21 tags
 */

const TAG_W = 2.4 * INCH;
const TAG_H = 1.35 * INCH;

const PICTURE_W = 0.95 * INCH;
const TOP_H = 0.88 * INCH;
const NAME_H = TAG_H - TOP_H;

const LOGO_SIZE = 0.72 * INCH;

const U = (v) => (v == null ? "" : String(v).toUpperCase());

const formatStreamLabel = (stream) => {
  if (!stream) return "";
  const s = String(stream).replace(/\s+/g, "");
  return s.replace(/^([A-Za-z])(\d.*)$/, "$1 $2").toUpperCase();
};

const getStudentStream = (s) => s?.stream ?? s?.form ?? "";

const styles = StyleSheet.create({
  page: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 9,
    paddingRight: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  cell: {
    width: "33.3333%",
    padding: 3.5,
    alignItems: "center",
  },

  tag: {
    width: TAG_W,
    height: TAG_H,
    borderWidth: BORDER,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
    flexDirection: "column",
  },

  firstRow: {
    height: TOP_H,
    flexDirection: "row",
    borderBottomWidth: BORDER,
    borderBottomColor: "#000000",
  },

  pictureColumn: {
    width: PICTURE_W,
    borderRightWidth: BORDER,
    borderRightColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },

  pictureBox: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },

  picture: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  formColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  formText: {
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 1.5,
    textAlign: "center",
    lineHeight: 1,
  },

  secondRow: {
    height: NAME_H,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  nameText: {
    fontSize: 9.5,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 1.15,
  },
});

function TagPDF({ student, logoDataUrl }) {
  const formLabel = formatStreamLabel(getStudentStream(student));

  return (
    <View style={styles.tag}>
      <View style={styles.firstRow}>
        <View style={styles.pictureColumn}>
          <View style={styles.pictureBox}>
            {logoDataUrl ? <Image style={styles.picture} src={logoDataUrl} /> : null}
          </View>
        </View>

        <View style={styles.formColumn}>
          <Text style={styles.formText} wrap={false}>
            {formLabel}
          </Text>
        </View>
      </View>

      <View style={styles.secondRow}>
        <Text style={styles.nameText}>{U(student?.name)}</Text>
      </View>
    </View>
  );
}

function chunk(arr, size) {
  const out = [];

  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }

  return out;
}

export default function TagsDocument({ students, logoDataUrl }) {
  const safeStudents = Array.isArray(students) ? students : [];

  const PER_PAGE = 21;
  const pages = chunk(safeStudents, PER_PAGE);

  return (
    <Document>
      {pages.map((pageStudents, pageIndex) => (
        <Page key={`page-${pageIndex}`} size="A4" style={styles.page}>
          <View style={styles.grid}>
            {pageStudents.map((s, idx) => (
              <View key={s?.id ?? `student-${idx}`} style={styles.cell}>
                <TagPDF student={s} logoDataUrl={logoDataUrl} />
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}
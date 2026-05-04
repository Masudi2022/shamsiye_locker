import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

/**
 * SHAMSIYE PROFESSIONAL TAG PDF
 * A4 portrait
 * 2 columns × 5 rows = 10 tags per page
 * No ID number
 * No STUDENT ID badge
 * No Authorized Signature
 * No Official Tag
 * Bottom contains only student name
 * FORM and STREAM/COMBINATION separated
 * Real logo restored using logoDataUrl from Verify.jsx
 * Header: left logo + centered school name + right logo
 *
 * Supports:
 * - Form ONE, TWO, THREE, FOUR with streams A, B, C
 * - Form FIVE and SIX with combinations HGE, EGM, PCM, PCB, CBG
 * - old values like "1A", "1 A", "ONEB", "ONE B"
 * - new values like "6PCM", "6 PCM", "SIXPCM", "SIX PCM"
 */

const A4_W = 595.28;
const A4_H = 841.89;

const PAGE_PADDING_X = 20;
const PAGE_PADDING_Y = 18;
const COL_GAP = 15;
const ROW_GAP = 10;

const COLUMNS = 2;
const ROWS = 5;
const PER_PAGE = COLUMNS * ROWS;

const CARD_W = (A4_W - PAGE_PADDING_X * 2 - COL_GAP) / COLUMNS;
const CARD_H = (A4_H - PAGE_PADDING_Y * 2 - ROW_GAP * (ROWS - 1)) / ROWS;

const CURRENT_YEAR = "2026";

const BRAND = {
  greenDark: "#2E8F2D",
  greenDeep: "#1F6F22",
  greenSoft: "#F1FBF0",
  greenVerySoft: "#F8FFF7",
  blue: "#16B8CF",
  blueSoft: "#E8FAFD",
  black: "#111827",
  muted: "#64748B",
  border: "#DCE7EA",
  borderSoft: "#EEF6F0",
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

const U = (value) => {
  if (value == null) return "";
  return String(value).toUpperCase().trim();
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
  if (maybeStream) {
    const formClean = normalizeForm(input);

    return {
      form: formClean,
      stream: normalizeStream(maybeStream, formClean),
    };
  }

  if (typeof input === "object" && input !== null) {
    const objectForm =
      input.originalForm ||
      input.formValue ||
      input.form_number ||
      input.formNumber ||
      input.form;

    const objectStream =
      input.originalStream ||
      input.streamValue ||
      input.stream_letter ||
      input.streamLetter ||
      input.stream;

    const objectClass =
      input.className ||
      input.classCode ||
      input.class ||
      input.selectedClass ||
      input.formStream ||
      input.class_label ||
      input.classLabel;

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

const prepareStudents = (students) => {
  return students.map((student) => {
    const parts = getStudentClassParts(student);
    const safeForm = normalizeForm(parts.form);
    const safeStream = normalizeStream(parts.stream, safeForm);
    const safeClassLabel = formatClassLabel(safeForm, safeStream);

    return {
      ...student,
      name: U(student?.name || "STUDENT NAME"),
      form: safeForm,
      stream: safeStream,
      streamLabel: getStreamLabel(safeForm),
      className: safeClassLabel,
      formStream: safeClassLabel,
      year: getYear(student),
    };
  });
};

const chunk = (arr, size) => {
  const out = [];

  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }

  return out;
};

const isValidImageSrc = (src) => {
  return (
    typeof src === "string" &&
    src.length > 0 &&
    src.startsWith("data:image/")
  );
};

const getCellStyle = (index, totalOnPage) => {
  const isRightColumn = index % COLUMNS === 1;
  const currentRow = Math.floor(index / COLUMNS);
  const lastRow = Math.floor((totalOnPage - 1) / COLUMNS);

  return {
    width: CARD_W,
    height: CARD_H,
    marginRight: isRightColumn ? 0 : COL_GAP,
    marginBottom: currentRow === lastRow ? 0 : ROW_GAP,
  };
};

const styles = StyleSheet.create({
  page: {
    paddingTop: PAGE_PADDING_Y,
    paddingBottom: PAGE_PADDING_Y,
    paddingLeft: PAGE_PADDING_X,
    paddingRight: PAGE_PADDING_X,
    backgroundColor: BRAND.white,
    fontFamily: "Helvetica",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: BRAND.white,
    borderWidth: 1,
    borderColor: BRAND.border,
    position: "relative",
    overflow: "hidden",
  },

  innerBorder: {
    position: "absolute",
    left: 5,
    top: 8,
    width: CARD_W - 10,
    height: CARD_H - 14,
    borderWidth: 0.7,
    borderColor: BRAND.borderSoft,
    borderRadius: 9,
  },

  softGreenCircle: {
    position: "absolute",
    right: -25,
    top: 18,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: BRAND.greenSoft,
    opacity: 0.8,
  },

  softBlueCircle: {
    position: "absolute",
    left: -26,
    bottom: 15,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: BRAND.blueSoft,
    opacity: 0.75,
  },

  sideAccent: {
    position: "absolute",
    left: 0,
    top: 5,
    width: 3,
    height: CARD_H - 9,
    backgroundColor: BRAND.greenDark,
  },

  watermarkWrap: {
    position: "absolute",
    left: 68,
    top: 22,
    width: 135,
    height: 135,
    opacity: 0.085,
  },

  watermarkImage: {
    width: 135,
    height: 135,
  },

  topStrip: {
    height: 5,
    width: CARD_W,
    backgroundColor: BRAND.greenDark,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  blueStrip: {
    width: 50,
    height: 5,
    backgroundColor: BRAND.blue,
  },

  header: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
    backgroundColor: BRAND.white,
    position: "relative",
  },

  headerLogoSlot: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  logoBox: {
    width: 29,
    height: 29,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 2.5,
  },

  logo: {
    width: 24,
    height: 24,
  },

  headerText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
    paddingRight: 4,
  },

  schoolName: {
    color: BRAND.black,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },

  motto: {
    marginTop: 3,
    color: BRAND.greenDark,
    fontSize: 4.8,
    fontWeight: "bold",
    letterSpacing: 0.7,
    textAlign: "center",
  },

  headerGreenLine: {
    position: "absolute",
    left: (CARD_W - 126) / 2,
    bottom: 0,
    width: 94,
    height: 2,
    backgroundColor: BRAND.greenDark,
  },

  headerBlueLine: {
    position: "absolute",
    left: (CARD_W - 126) / 2 + 94,
    bottom: 0,
    width: 31,
    height: 2,
    backgroundColor: BRAND.blue,
  },

  body: {
    height: 56,
    flexDirection: "row",
    paddingTop: 6,
    paddingLeft: 14,
    paddingRight: 14,
  },

  details: {
    flex: 1,
    paddingRight: 8,
    justifyContent: "center",
  },

  detailRow: {
    height: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: BRAND.borderSoft,
    backgroundColor: BRAND.white,
  },

  detailLabel: {
    width: 58,
    fontSize: 5.6,
    color: BRAND.black,
    fontWeight: "bold",
  },

  detailColon: {
    width: 6,
    fontSize: 6.4,
    color: BRAND.greenDark,
    fontWeight: "bold",
  },

  detailValue: {
    flex: 1,
    fontSize: 7.4,
    color: BRAND.black,
    fontWeight: "bold",
  },

  photoColumn: {
    width: 58,
    alignItems: "center",
    justifyContent: "center",
  },

  photoFrameOuter: {
    width: 53,
    height: 53,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND.greenSoft,
    backgroundColor: BRAND.greenVerySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  photoFrame: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },

  photo: {
    width: 38,
    height: 38,
  },

  fallbackLogoText: {
    color: BRAND.greenDark,
    fontSize: 15,
    fontWeight: "bold",
  },

  fallbackPhotoText: {
    color: BRAND.greenDark,
    fontSize: 18,
    fontWeight: "bold",
  },

  nameArea: {
    position: "absolute",
    left: 16,
    bottom: 10,
    width: CARD_W - 32,
    height: 28,
    justifyContent: "center",
  },

  nameShadow: {
    position: "absolute",
    left: 2,
    top: 4,
    width: CARD_W - 36,
    height: 22,
    borderRadius: 9,
    backgroundColor: BRAND.greenDeep,
    opacity: 0.18,
  },

  nameBand: {
    height: 24,
    borderRadius: 9,
    backgroundColor: BRAND.greenDark,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 30,
    paddingRight: 30,
    position: "relative",
    borderWidth: 0.6,
    borderColor: BRAND.greenDeep,
  },

  nameTopHighlight: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 2,
    height: 1,
    backgroundColor: BRAND.white,
    opacity: 0.35,
  },

  nameBlueLeft: {
    position: "absolute",
    left: 9,
    top: 10.5,
    width: 14,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: BRAND.blue,
  },

  nameBlueRight: {
    position: "absolute",
    right: 9,
    top: 10.5,
    width: 14,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: BRAND.blue,
  },

  nameText: {
    color: BRAND.white,
    fontSize: 8.2,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  bottomAccent: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: CARD_W,
    height: 4,
    flexDirection: "row",
  },

  bottomGreen: {
    flex: 1,
    backgroundColor: BRAND.greenDark,
  },

  bottomBlue: {
    width: 50,
    backgroundColor: BRAND.blue,
  },

  bottomGreenDark: {
    flex: 1,
    backgroundColor: BRAND.greenDeep,
  },

  cornerDotOne: {
    position: "absolute",
    right: 9,
    top: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: BRAND.blue,
    opacity: 0.9,
  },

  cornerDotTwo: {
    position: "absolute",
    right: 16,
    top: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: BRAND.greenDark,
    opacity: 0.9,
  },

  emptyText: {
    fontSize: 14,
    color: BRAND.black,
  },
});

function SafeLogo({ src, style, fallbackStyle }) {
  if (isValidImageSrc(src)) {
    return <Image src={src} style={style} />;
  }

  return <Text style={fallbackStyle}>S</Text>;
}

function StudentTag({ student, logoDataUrl }) {
  const { form, stream } = getStudentClassParts(student);

  const safeForm = normalizeForm(form);
  const safeStream = normalizeStream(stream, safeForm);
  const year = getYear(student);
  const streamLabel = getStreamLabel(safeForm);

  return (
    <View style={styles.card}>
      <View style={styles.softGreenCircle} />
      <View style={styles.softBlueCircle} />
      <View style={styles.innerBorder} />
      <View style={styles.sideAccent} />
      <View style={styles.cornerDotOne} />
      <View style={styles.cornerDotTwo} />

      {isValidImageSrc(logoDataUrl) && (
        <View style={styles.watermarkWrap}>
          <Image src={logoDataUrl} style={styles.watermarkImage} />
        </View>
      )}

      <View style={styles.topStrip}>
        <View style={styles.blueStrip} />
      </View>

      <View style={styles.header}>
        <View style={styles.headerLogoSlot}>
          <View style={styles.logoBox}>
            <SafeLogo
              src={logoDataUrl}
              style={styles.logo}
              fallbackStyle={styles.fallbackLogoText}
            />
          </View>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.schoolName} wrap={false}>
            SHAMSIYE SCHOOLS
          </Text>

          <Text style={styles.motto} wrap={false}>
            ACCESS TO SUCCESS
          </Text>
        </View>

        <View style={styles.headerLogoSlot}>
          <View style={styles.logoBox}>
            <SafeLogo
              src={logoDataUrl}
              style={styles.logo}
              fallbackStyle={styles.fallbackLogoText}
            />
          </View>
        </View>

        <View style={styles.headerGreenLine} />
        <View style={styles.headerBlueLine} />
      </View>

      <View style={styles.body}>
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel} wrap={false}>
              FORM
            </Text>

            <Text style={styles.detailColon} wrap={false}>
              :
            </Text>

            <Text style={styles.detailValue} wrap={false}>
              {safeForm}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel} wrap={false}>
              {streamLabel}
            </Text>

            <Text style={styles.detailColon} wrap={false}>
              :
            </Text>

            <Text style={styles.detailValue} wrap={false}>
              {safeStream}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel} wrap={false}>
              YEAR
            </Text>

            <Text style={styles.detailColon} wrap={false}>
              :
            </Text>

            <Text style={styles.detailValue} wrap={false}>
              {year}
            </Text>
          </View>
        </View>

        <View style={styles.photoColumn}>
          <View style={styles.photoFrameOuter}>
            <View style={styles.photoFrame}>
              <SafeLogo
                src={logoDataUrl}
                style={styles.photo}
                fallbackStyle={styles.fallbackPhotoText}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.nameArea}>
        <View style={styles.nameShadow} />

        <View style={styles.nameBand}>
          <View style={styles.nameTopHighlight} />
          <View style={styles.nameBlueLeft} />

          <Text style={styles.nameText} wrap={false}>
            {U(student?.name || "STUDENT NAME")}
          </Text>

          <View style={styles.nameBlueRight} />
        </View>
      </View>

      <View style={styles.bottomAccent}>
        <View style={styles.bottomGreen} />
        <View style={styles.bottomBlue} />
        <View style={styles.bottomGreenDark} />
      </View>
    </View>
  );
}

export default function TagsDocument({ students, logoDataUrl }) {
  const safeStudents = Array.isArray(students) ? students : [];
  const preparedStudents = prepareStudents(safeStudents);
  const pages = chunk(preparedStudents, PER_PAGE);

  return (
    <Document>
      {pages.length === 0 ? (
        <Page size="A4" style={styles.page}>
          <Text style={styles.emptyText}>No students found.</Text>
        </Page>
      ) : (
        pages.map((pageStudents, pageIndex) => (
          <Page key={`page-${pageIndex}`} size="A4" style={styles.page}>
            <View style={styles.grid}>
              {pageStudents.map((student, index) => {
                const globalIndex = pageIndex * PER_PAGE + index;

                return (
                  <View
                    key={student?.id || `student-${globalIndex}`}
                    style={getCellStyle(index, pageStudents.length)}
                  >
                    <StudentTag student={student} logoDataUrl={logoDataUrl} />
                  </View>
                );
              })}
            </View>
          </Page>
        ))
      )}
    </Document>
  );
}
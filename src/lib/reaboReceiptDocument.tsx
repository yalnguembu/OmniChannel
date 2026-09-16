import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import type { ReceiptData } from "./reaboReceipt";

/**
 * The réabonnement receipt, transcribed from `admin-web`'s `ReceiptDocument`.
 *
 * Same A7 ticket, same lines in the same order, same wording — a customer who
 * has already been handed one of these at a point of sale must recognise the
 * one that arrives on WhatsApp. The only addition is our logo beside Canal's.
 *
 * `@react-pdf/renderer` weighs about a megabyte, so nothing may import this
 * module statically: the single entry point is the dynamic import in
 * {@link ./reaboReceipt}'s `buildReceiptBlob`.
 */

/** Served from `public/` — react-pdf fetches them at render time. */
const CANAL_LOGO = "/canal.png";
const OUR_LOGO = "/logo.png";

const styles = StyleSheet.create({
  page: {
    padding: 10,
    backgroundColor: "white",
    color: "black",
    fontSize: 10,
  },
  logos: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  logoCanal: {
    width: "58%",
    height: 30,
    objectFit: "contain",
  },
  logoOurs: {
    width: "22%",
    height: 30,
    marginLeft: 8,
    objectFit: "contain",
  },
  header: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
    fontSize: 11,
  },
  footer: {
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 10,
  },
  label: {
    fontWeight: "bold",
  },
  line: {
    marginBottom: 2,
    display: "flex",
    flexDirection: "row",
    rowGap: 8,
  },
});

const Line: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <View style={styles.line}>
    <Text style={styles.label}>{label}</Text>
    <Text>{value || "—"}</Text>
  </View>
);

const ReceiptDocument: React.FC<{ data: ReceiptData }> = ({ data }) => (
  <Document>
    <Page size="A7" style={styles.page}>
      <View style={styles.logos}>
        <Image src={CANAL_LOGO} style={styles.logoCanal} />
        <Image src={OUR_LOGO} style={styles.logoOurs} />
      </View>

      <Text style={styles.header}>
        REABONNEMENT CANAL+ N°{`${data.subscriberId}/${data.id}`}
      </Text>

      <Line label="Date: " value={data.date} />
      <Line label="N° d'abonné: " value={data.subscriberId} />
      <Line label="N° Dec. : " value={data.deviceNumber} />
      <Line label="Abonné : " value={data.customerName} />
      <Line label="Offre: " value={data.plan} />
      <Line label="Montant:  " value={`${data.amount} F.CFA`} />
      <Line label="Début: " value={data.startDate} />
      <Line label="Fin: " value={data.endDate} />
      <Line label="Edité le : " value={data.issuedAt} />
      <Line label="Par: " value={data.issuedBy} />

      <View style={styles.footer}>
        <Text style={styles.line}>FUJISAT REABO</Text>
        <Text style={styles.line}>{data.contact}</Text>
        <Text style={styles.line}>support-reabo@fujisat.cm</Text>
      </View>
    </Page>
  </Document>
);

export async function renderReceipt(data: ReceiptData): Promise<Blob> {
  return pdf(<ReceiptDocument data={data} />).toBlob();
}

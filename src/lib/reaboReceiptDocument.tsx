import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import type { ReceiptData } from "./reaboReceipt";

/**
 * The receipt's actual rendering — isolated in its own module for one reason:
 * `@react-pdf/renderer` weighs about a megabyte, and it is only ever needed by
 * an agent who prints a receipt.
 *
 * Nothing outside {@link ./reaboReceipt} may import this file statically, or
 * the library lands in the main bundle and every agent pays for it on first
 * load. The only entry point is the dynamic import in `buildReceiptBlob`.
 */

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, color: "#111b21", backgroundColor: "#ffffff" },
  brand: { fontSize: 15, marginBottom: 2 },
  kicker: { fontSize: 9, color: "#6f6e69", marginBottom: 16 },
  title: { fontSize: 12, marginBottom: 10 },
  rule: { borderBottomWidth: 1, borderBottomColor: "#e5e0d9", marginVertical: 10 },
  row: { flexDirection: "row", marginBottom: 5 },
  label: { width: 130, color: "#6f6e69" },
  value: { flex: 1 },
  total: { flexDirection: "row", marginTop: 6 },
  totalLabel: { width: 130 },
  totalValue: { flex: 1, fontSize: 12 },
  footer: { marginTop: 24, fontSize: 8, color: "#6f6e69", textAlign: "center" },
});

const Line: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "—"}</Text>
  </View>
);

const ReceiptDocument: React.FC<{ data: ReceiptData }> = ({ data }) => (
  <Document title={`Reçu ${data.reference}`}>
    <Page size="A5" style={styles.page}>
      <Text style={styles.brand}>My Reabo</Text>
      <Text style={styles.kicker}>Reçu de paiement</Text>

      <Text style={styles.title}>Référence {data.reference}</Text>
      <Line label="Date" value={data.date} />

      <View style={styles.rule} />

      <Line label="Abonné" value={data.customerName} />
      <Line label="N° abonné" value={data.subscriberNumber} />
      <Line label="N° décodeur" value={data.decoder} />
      <Line label="Contrat" value={data.contract} />

      <View style={styles.rule} />

      <Line label="Formule" value={data.plan} />
      <Line
        label="Période"
        value={
          data.periodStart || data.periodEnd
            ? `${data.periodStart || "?"} → ${data.periodEnd || "?"}`
            : ""
        }
      />

      <View style={styles.rule} />

      <Line label="Moyen de paiement" value={data.paymentMethod} />
      <Line label="Numéro payeur" value={data.payer} />
      <Line label="Frais" value={data.fees} />

      <View style={styles.total}>
        <Text style={styles.totalLabel}>Montant</Text>
        <Text style={styles.totalValue}>{data.amount}</Text>
      </View>

      {!!data.issuedBy && (
        <>
          <View style={styles.rule} />
          <Line label="Établi par" value={data.issuedBy} />
        </>
      )}

      <Text style={styles.footer}>
        Document généré automatiquement — conservez-le comme preuve de paiement.
      </Text>
    </Page>
  </Document>
);

export async function renderReceipt(data: ReceiptData): Promise<Blob> {
  return pdf(<ReceiptDocument data={data} />).toBlob();
}

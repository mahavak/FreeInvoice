import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

/**
 * InvoicePDF Template: FreeInvoice
 * Author: Senior AI Engineering Collaborator
 * Features: Professional Typography, Clean Spacing, High-Impact Branding.
 */

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 60,
  },
  logoSection: {
    flexDirection: 'column',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5', // Indigo-600
    letterSpacing: -1,
  },
  logoSubtext: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
  },
  metaSection: {
    textAlign: 'right',
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 8,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold',
  },
  table: {
    marginTop: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 12,
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  colDesc: { flex: 6, fontSize: 10, color: '#111827' },
  colQty: { flex: 2, fontSize: 10, textAlign: 'right', color: '#4b5563' },
  colRate: { flex: 2, fontSize: 10, textAlign: 'right', color: '#4b5563' },
  colTotal: { flex: 2, fontSize: 10, textAlign: 'right', color: '#111827', fontWeight: 'bold' },
  headerLabel: {
    fontSize: 8,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    marginTop: 60,
    borderTopWidth: 2,
    borderTopColor: '#4f46e5',
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  thankYouSection: {
    flex: 1,
  },
  thankYouTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  thankYouText: {
    fontSize: 9,
    color: '#6b7280',
    maxWidth: 200,
    lineHeight: 1.5,
  },
  totalSection: {
    textAlign: 'right',
  },
  totalLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
  },
  grandTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  impactStamp: {
    marginTop: 40,
    padding: 15,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
    textAlign: 'center',
  },
  impactText: {
    fontSize: 8,
    color: '#166534',
    fontWeight: 'bold',
  }
});

export const InvoicePDF = ({ items, invoiceNumber, date }: any) => {
  const subtotal = items.reduce((acc: any, item: any) => acc + (Number(item.quantity) * Number(item.price)), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Text style={styles.logoText}>FreeInvoice</Text>
            <Text style={styles.logoSubtext}>Freelancer Freedom</Text>
          </View>
          <View style={styles.metaSection}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.metaLabel}>Invoice Number</Text>
            <Text style={styles.metaValue}>{invoiceNumber || 'INV-001'}</Text>
            <Text style={[styles.metaLabel, { marginTop: 10 }]}>Date Issued</Text>
            <Text style={styles.metaValue}>{date || new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.headerLabel]}>Description</Text>
            <Text style={[styles.colQty, styles.headerLabel]}>Quantity/Hrs</Text>
            <Text style={[styles.colRate, styles.headerLabel]}>Rate</Text>
            <Text style={[styles.colTotal, styles.headerLabel]}>Total</Text>
          </View>

          {items.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colRate}>${Number(item.price).toFixed(2)}</Text>
              <Text style={styles.colTotal}>${(Number(item.quantity) * Number(item.price)).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Footer & Totals */}
        <View style={styles.footer}>
          <View style={styles.thankYouSection}>
            <Text style={styles.thankYouTitle}>Payment Instructions</Text>
            <Text style={styles.thankYouText}>
              Please process the payment within 14 days of receiving this invoice. 
              Thank you for your business!
            </Text>
          </View>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Grand Total (USD)</Text>
            <Text style={styles.grandTotal}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        {/* Social Impact Stamp */}
        <View style={styles.impactStamp}>
          <Text style={styles.impactText}>
            GENERATED WITH FREEINVOICE 1-FOR-3 SOCIAL IMPACT MODEL
          </Text>
          <Text style={[styles.impactText, { marginTop: 4, fontWeight: 'normal' }]}>
            Your partnership helps fund 3 free accounts for freelancers in developing countries.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

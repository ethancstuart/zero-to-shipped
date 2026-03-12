"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CertificateDownloadProps {
  name: string;
  date: string;
}

export function CertificateDownload({ name, date }: CertificateDownloadProps) {
  const handleDownload = async () => {
    // Dynamic import to keep bundle size down
    const { pdf, Document, Page, Text, View, StyleSheet } = await import(
      "@react-pdf/renderer"
    );

    const styles = StyleSheet.create({
      page: {
        padding: 60,
        backgroundColor: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "Helvetica",
      },
      header: {
        fontSize: 12,
        letterSpacing: 4,
        color: "#3b82f6",
        textTransform: "uppercase" as const,
        marginBottom: 20,
        textAlign: "center" as const,
      },
      title: {
        fontSize: 36,
        fontWeight: "bold" as const,
        textAlign: "center" as const,
        marginBottom: 8,
      },
      subtitle: {
        fontSize: 14,
        color: "#a3a3a3",
        textAlign: "center" as const,
        marginBottom: 40,
      },
      name: {
        fontSize: 24,
        fontWeight: "bold" as const,
        textAlign: "center" as const,
        marginBottom: 8,
      },
      description: {
        fontSize: 12,
        color: "#a3a3a3",
        textAlign: "center" as const,
        marginBottom: 40,
      },
      date: {
        fontSize: 10,
        color: "#737373",
        textAlign: "center" as const,
      },
      border: {
        borderWidth: 1,
        borderColor: "#3b82f6",
        borderRadius: 8,
        padding: 40,
      },
    });

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const CertDoc = () => (
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.border}>
            <Text style={styles.header}>Certificate of Completion</Text>
            <Text style={styles.title}>Zero to Shipped</Text>
            <Text style={styles.subtitle}>
              Build with AI, No Engineering Degree Required
            </Text>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.description}>
              has successfully completed all 16 modules of the Zero to Shipped
              curriculum, including the capstone project.
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(<CertDoc />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zero-to-shipped-certificate-${name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleDownload} size="lg" className="gap-2">
      <Download className="size-4" />
      Download Certificate (PDF)
    </Button>
  );
}

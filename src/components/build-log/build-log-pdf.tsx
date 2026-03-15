"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RoleTrack, ModuleTier } from "@/types";

const ROLE_LABELS: Record<RoleTrack, string> = {
  pm: "Product Manager",
  pjm: "Project Manager",
  ba: "Business Analyst",
  bi: "Business Intelligence",
};

interface BuildLogPDFProps {
  displayName: string;
  roleTrack: RoleTrack | null;
  modules: {
    number: number;
    title: string;
    tier: string;
    checkpoints: string[];
    completedAt: string | null;
  }[];
  xp: number;
  level: string;
}

export function BuildLogPDF({
  displayName,
  roleTrack,
  modules,
  xp,
  level,
}: BuildLogPDFProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      const ReactPDF = await import("@react-pdf/renderer");
      const { Document, Page, Text, View, StyleSheet, pdf } = ReactPDF;

      const styles = StyleSheet.create({
        page: { padding: 40, fontFamily: "Helvetica", fontSize: 10 },
        header: { marginBottom: 20 },
        title: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
        subtitle: { fontSize: 12, color: "#666" },
        stats: {
          flexDirection: "row",
          gap: 20,
          marginBottom: 20,
          padding: 12,
          backgroundColor: "#f5f5f5",
          borderRadius: 4,
        },
        stat: { fontSize: 10 },
        moduleCard: {
          marginBottom: 12,
          padding: 12,
          border: "1px solid #e5e5e5",
          borderRadius: 4,
        },
        moduleTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
        moduleMeta: { fontSize: 9, color: "#666", marginBottom: 6 },
        checkpoint: { fontSize: 9, color: "#444", marginBottom: 2 },
        footer: {
          position: "absolute",
          bottom: 30,
          left: 40,
          right: 40,
          fontSize: 8,
          color: "#999",
          textAlign: "center",
        },
      });

      const doc = (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>{displayName}</Text>
              <Text style={styles.subtitle}>
                Zero to Ship Build Log
                {roleTrack ? ` · ${ROLE_LABELS[roleTrack]} Track` : ""}
              </Text>
            </View>

            <View style={styles.stats}>
              <Text style={styles.stat}>
                {modules.length} Modules Completed
              </Text>
              <Text style={styles.stat}>{xp} XP</Text>
              <Text style={styles.stat}>Level: {level}</Text>
            </View>

            {modules.map((mod) => (
              <View key={mod.number} style={styles.moduleCard}>
                <Text style={styles.moduleTitle}>
                  Module {mod.number}: {mod.title}
                </Text>
                <Text style={styles.moduleMeta}>
                  {mod.tier}
                  {mod.completedAt
                    ? ` · Completed ${new Date(mod.completedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`
                    : ""}
                </Text>
                {mod.checkpoints.map((cp, i) => (
                  <Text key={i} style={styles.checkpoint}>
                    ✓ {cp}
                  </Text>
                ))}
              </View>
            ))}

            <Text style={styles.footer}>
              Generated from zerotoship.app ·{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `build-log-${displayName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // PDF generation failed
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleDownload} disabled={loading}>
      <Download className="mr-1.5 size-4" />
      {loading ? "Generating..." : "Export PDF"}
    </Button>
  );
}

/**
 * AddFilePage.jsx
 *
 * Upload zone that is BIG before a file is loaded and SHRINKS after.
 * The animation is a smooth CSS transition on height + padding.
 * Uses the shared Button component.
 *
 * Props:
 *   onNavigate(page) — called with "graph" or "details" to switch page
 */

import { useRef } from "react";
import { useTransactions } from "../hooks/useTransactions";
import Button from "../components/Button";

export default function AddFilePage({ onNavigate }) {
  const { loadCSV, fileName, nodes, edges, loading, error } = useTransactions();
  const fileRef = useRef(null);
  const hasFile = !!fileName;

  function handleFile(file) {
    if (file) loadCSV(file);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "white",
        fontFamily: "'Fira Code', monospace",
      }}
    >
      {/* ── HEADER ── */}
      <header
        style={{
          height: 50,
          flexShrink: 0,
          background: "#14532d",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: "#4ade80",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 10, color: "#14532d",
            }}
          >
            FE
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em" }}>
            FORENSICS ENGINE
          </span>
          <span style={{ color: "#166534" }}>·</span>
          <span style={{ color: "#4ade80", fontSize: 10, letterSpacing: "0.08em" }}>
            ADD FILE
          </span>
        </div>

        {/* Nav buttons — only show graph/details if file is loaded */}
        <div style={{ display: "flex", gap: 10 }}>
          {hasFile && (
            <>
              <Button success rounded onClick={() => onNavigate("graph")}>
                View Graph
              </Button>
              <Button outline success rounded onClick={() => onNavigate("details")}>
                View Details
              </Button>
            </>
          )}
        </div>
      </header>

      {/* ── BODY ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          gap: 32,
          backgroundImage: "radial-gradient(#bbf7d0 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      >
        {/* ── UPLOAD ZONE — animates from big to small ── */}
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
          onDragOver={e => e.preventDefault()}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "#16a34a";
            e.currentTarget.style.background  = "#dcfce7";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = hasFile ? "#4ade80" : "#86efac";
            e.currentTarget.style.background  = "white";
          }}
          style={{
            border: `2px dashed ${hasFile ? "#4ade80" : "#86efac"}`,
            borderRadius: 20,
            background: "white",
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
            // ── THE ANIMATION ──
            // Big (no file): 480px wide, generous padding
            // Small (file loaded): 320px wide, compact padding
            width:   hasFile ? 320 : 480,
            padding: hasFile ? "20px 28px" : "60px 48px",
            overflow: "hidden",
          }}
        >
          {/* Icon */}
          <div
            style={{
              fontSize: hasFile ? 32 : 64,
              marginBottom: hasFile ? 8 : 16,
              transition: "all 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
              lineHeight: 1,
            }}
          >
            {loading ? "⏳" : hasFile ? "✅" : "📂"}
          </div>

          {/* Primary text */}
          <p
            style={{
              fontSize: hasFile ? 12 : 18,
              fontWeight: 700,
              color: "#14532d",
              marginBottom: 6,
              transition: "font-size 0.45s ease",
            }}
          >
            {loading
              ? "Parsing file…"
              : hasFile
              ? fileName
              : "Drop your CSV here"}
          </p>

          {/* Secondary text */}
          {!hasFile && !loading && (
            <p style={{ fontSize: 11, color: "#86efac", lineHeight: 1.6 }}>
              or click to browse
              <br />
              <span style={{ fontSize: 9, color: "#bbf7d0" }}>
                Required columns: transaction_id · sender_id · receiver_id · amount · timestamp
              </span>
            </p>
          )}

          {/* Stats shown after load */}
          {hasFile && !loading && (
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 6 }}>
              <span style={{ fontSize: 10, color: "#15803d" }}>
                <b style={{ color: "#14532d" }}>{nodes.length}</b> nodes
              </span>
              <span style={{ fontSize: 10, color: "#15803d" }}>
                <b style={{ color: "#14532d" }}>{edges.length}</b> edges
              </span>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={e => handleFile(e.target.files?.[0])}
        />

        {/* Error */}
        {error && (
          <p
            style={{
              fontSize: 11,
              color: "#dc2626",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "8px 16px",
              maxWidth: 480,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        {/* Action buttons once file is loaded */}
        {hasFile && !loading && (
          <div style={{ display: "flex", gap: 14 }}>
            <Button success rounded onClick={() => onNavigate("graph")}>
              🔍 &nbsp; View Transaction Graph
            </Button>
            <Button outline success rounded onClick={() => onNavigate("details")}>
              📋 &nbsp; View Account Details
            </Button>
            <Button
              outline
              secondary
              rounded
              onClick={() => fileRef.current?.click()}
            >
              🔄 &nbsp; Replace File
            </Button>
          </div>
        )}

        {/* Format reminder */}
        {!hasFile && !loading && (
          <div
            style={{
              maxWidth: 480,
              background: "#f0fdf4",
              border: "1px solid #dcfce7",
              borderRadius: 12,
              padding: "16px 20px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "#15803d",
                fontWeight: 700,
                marginBottom: 10,
                letterSpacing: "0.1em",
              }}
            >
              EXPECTED CSV FORMAT
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9, color: "#166534" }}>
              <thead>
                <tr>
                  {["transaction_id","sender_id","receiver_id","amount","timestamp"].map(h => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "4px 8px",
                        borderBottom: "1px solid #bbf7d0",
                        fontWeight: 700,
                        color: "#14532d",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["T001", "ACC_A", "ACC_B", "5000", "2024-01-15 10:30:00"],
                  ["T002", "ACC_B", "ACC_C", "3200", "2024-01-15 11:00:00"],
                ].map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        style={{
                          padding: "4px 8px",
                          borderBottom: "1px solid #f0fdf4",
                          color: "#374151",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
/**
 * ShowDetailsPage.jsx
 *
 * Two-tab layout — tabs sit below the header, content never overlaps:
 *
 *   [ Summary ]  [ Transactions ]
 *
 *   Summary tab:
 *     - Grid of account cards (click to filter)
 *     - Each card shows: sent/received totals + counterparty relationships
 *     - Fraud badge on suspicious accounts
 *
 *   Transactions tab:
 *     - Full sortable table: TX ID · Sender → Receiver · Amount · Date
 *     - Filtered by selected accounts (if any) OR the card clicked in Summary
 *     - Total row at bottom
 *
 * Props:
 *   selectedIds  — Set<string> passed from GraphPage
 *   onNavigate(page)
 */

import { useState, useMemo } from "react";
import { useTransactions } from "../hooks/useTransactions";
import Button from "../components/Button";

// ─── Fraud maps ──────────────────────────────────────────────────────────────
const RING_PALETTE = [
  { node: "#dc2626", stroke: "#fca5a5", label: "#fca5a5" },
  { node: "#ea580c", stroke: "#fdba74", label: "#fdba74" },
  { node: "#7c3aed", stroke: "#c4b5fd", label: "#c4b5fd" },
  { node: "#0891b2", stroke: "#67e8f9", label: "#67e8f9" },
  { node: "#be185d", stroke: "#f9a8d4", label: "#f9a8d4" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ShowDetailsPage({ selectedIds = new Set(), onNavigate }) {
  const { nodes, edges, fileName, fraudData } = useTransactions();

  const [activeTab,     setActiveTab]     = useState("summary");
  const [filterAccount, setFilterAccount] = useState("all");
  const [sortKey,       setSortKey]       = useState("date");
  const [sortDir,       setSortDir]       = useState("desc");
  const [ringSort,      setRingSort]      = useState("risk_score");

  const hasSelection = selectedIds.size > 0;

  // Download JSON function
  const downloadJSON = () => {
    if (!fraudData) {
      alert('No fraud analysis data available to download');
      return;
    }

    const dataStr = JSON.stringify(fraudData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fraud-analysis-${fileName || 'results'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Build fraud maps from backend data
  const { ringColorMap, suspiciousMap, accountRingMap } = useMemo(() => {
    const ringColorMap   = {};
    const suspiciousMap  = {};
    const accountRingMap = {};
    
    if (fraudData) {
      fraudData.fraud_rings?.forEach((ring, i) => {
        ringColorMap[ring.ring_id] = RING_PALETTE[i % RING_PALETTE.length];
        ring.member_accounts.forEach(id => { accountRingMap[id] = ring; });
      });
      fraudData.suspicious_accounts?.forEach(a => { suspiciousMap[a.account_id] = a; });
    }
    
    return { ringColorMap, suspiciousMap, accountRingMap };
  }, [fraudData]);

  function getNodeColor(id) {
    const ring = accountRingMap[id];
    const susp = suspiciousMap[id];
    if (ring) return ringColorMap[ring.ring_id].node;
    if (susp) return "#991b1b";
    return "#16a34a";
  }

  // Accounts to show in summary (selected, or all)
  const accountIds = hasSelection ? [...selectedIds] : nodes.map(n => n.id);

  // Per-account summary data
  const summaries = useMemo(() => accountIds.map(id => {
    const sent     = edges.filter(e => e.source === id);
    const received = edges.filter(e => e.target === id);
    return {
      id,
      sentCount:     sent.length,
      receivedCount: received.length,
      totalSent:     sent.reduce((s, e) => s + e.amount, 0),
      totalReceived: received.reduce((s, e) => s + e.amount, 0),
      sentTo:        [...new Set(sent.map(e => e.target))],
      receivedFrom:  [...new Set(received.map(e => e.source))],
      suspicious:    suspiciousMap[id],
      ring:          accountRingMap[id],
    };
  }), [accountIds, edges]);

  // Transactions to show in table
  const visibleEdges = useMemo(() => {
    let result = edges.filter(e => {
      const inSelection = !hasSelection || selectedIds.has(e.source) || selectedIds.has(e.target);
      const inFilter    = filterAccount === "all" || e.source === filterAccount || e.target === filterAccount;
      return inSelection && inFilter;
    });
    result = [...result].sort((a, b) => {
      let av, bv;
      if      (sortKey === "amount")   { av = a.amount;    bv = b.amount; }
      else if (sortKey === "sender")   { av = a.source;    bv = b.source; }
      else if (sortKey === "receiver") { av = a.target;    bv = b.target; }
      else                             { av = a.timestamp; bv = b.timestamp; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [edges, selectedIds, filterAccount, sortKey, sortDir]);

  const totalAmount = visibleEdges.reduce((s, e) => s + e.amount, 0);

  // Sorted fraud rings
  const sortedRings = useMemo(() => {
    if (!fraudData?.fraud_rings) return [];
    const rings = [...fraudData.fraud_rings];
    rings.sort((a, b) => {
      if (ringSort === "risk_score") return b.risk_score - a.risk_score;
      if (ringSort === "member_count") return b.member_accounts.length - a.member_accounts.length;
      if (ringSort === "ring_id") return a.ring_id.localeCompare(b.ring_id);
      return 0;
    });
    return rings;
  }, [fraudData, ringSort]);

  function handleSortClick(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function handleCardClick(id) {
    // Clicking a card sets the filter AND switches to Transactions tab
    if (filterAccount === id) {
      setFilterAccount("all");
    } else {
      setFilterAccount(id);
      setActiveTab("transactions");
    }
  }

  const sortArrow = (key) => sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "white", fontFamily: "'Fira Code', monospace" }}>

      {/* ── HEADER ── */}
      <header style={{ height: 54, flexShrink: 0, background: "#14532d", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", borderBottom: "1px solid #166534" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10, color: "#14532d" }}>FE</div>
          <span style={{ color: "white", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em" }}>FORENSICS ENGINE</span>
          <span style={{ color: "#166534" }}>·</span>
          <span style={{ color: "#4ade80", fontSize: 10 }}>
            {hasSelection ? `${selectedIds.size} ACCOUNT${selectedIds.size > 1 ? "S" : ""} SELECTED` : `ALL ${nodes.length} ACCOUNTS`}
          </span>
          {fileName && <span style={{ color: "#4ade80", fontSize: 10 }}>· 📄 {fileName}</span>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {fraudData && <Button outline success rounded onClick={downloadJSON}>Download JSON</Button>}
          <Button outline success rounded onClick={() => onNavigate("graph")}>View Graph</Button>
          <Button outline secondary rounded onClick={() => onNavigate("addfile")}>Add File</Button>
        </div>
      </header>

      {/* ── TAB BAR ── */}
      <div style={{ flexShrink: 0, background: "#f0fdf4", borderBottom: "2px solid #dcfce7", display: "flex", alignItems: "stretch", padding: "0 22px", gap: 4 }}>
        {[
          { key: "summary",      label: "Account Summary",  count: accountIds.length },
          { key: "rings",        label: "Fraud Rings",      count: fraudData?.fraud_rings?.length || 0 },
          { key: "transactions", label: "Transactions",     count: visibleEdges.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background:    "none",
              border:        "none",
              borderBottom:  activeTab === tab.key ? "3px solid #16a34a" : "3px solid transparent",
              padding:       "12px 18px 10px",
              cursor:        "pointer",
              fontSize:      11,
              fontWeight:    activeTab === tab.key ? 800 : 500,
              color:         activeTab === tab.key ? "#14532d" : "#6b7280",
              fontFamily:    "'Fira Code', monospace",
              letterSpacing: "0.06em",
              display:       "flex",
              alignItems:    "center",
              gap:           7,
              transition:    "all 0.15s",
              marginBottom:  -2,
            }}
          >
            {tab.label}
            <span style={{ fontSize: 9, background: activeTab === tab.key ? "#16a34a" : "#e5e7eb", color: activeTab === tab.key ? "white" : "#6b7280", borderRadius: 10, padding: "1px 7px", fontWeight: 700 }}>
              {tab.count}
            </span>
          </button>
        ))}

        {/* Active filter pill */}
        {filterAccount !== "all" && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "0 4px" }}>
            <span style={{ fontSize: 9, color: "#15803d" }}>Filtered by:</span>
            <div style={{ background: getNodeColor(filterAccount), borderRadius: 12, padding: "3px 10px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>{filterAccount}</span>
              <button onClick={() => setFilterAccount("all")}
                style={{ background: "rgba(255,255,255,0.25)", border: "none", color: "white", width: 14, height: 14, borderRadius: "50%", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>✕</button>
            </div>
          </div>
        )}
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>

        {/* ══ SUMMARY TAB ══════════════════════════════════════════════════ */}
        <div style={{
          position: "absolute", inset: 0,
          opacity:    activeTab === "summary" ? 1 : 0,
          pointerEvents: activeTab === "summary" ? "auto" : "none",
          transform: activeTab === "summary" ? "translateX(0)" : "translateX(-18px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          overflow: "auto",
          padding: "20px 22px",
        }}>

          {summaries.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 12 }}>
              No accounts to display. Upload a CSV first.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {summaries.map(s => {
              const nodeColor  = getNodeColor(s.id);
              const isFiltered = filterAccount === s.id;
              const isSusp     = !!s.suspicious;
              const ringData   = s.ring;

              return (
                <div
                  key={s.id}
                  onClick={() => handleCardClick(s.id)}
                  style={{
                    border:       `2px solid ${isFiltered ? nodeColor : isSusp ? nodeColor + "55" : "#dcfce7"}`,
                    borderRadius: 14,
                    background:   isFiltered ? nodeColor + "10" : "white",
                    cursor:       "pointer",
                    transition:   "all 0.15s",
                    overflow:     "hidden",
                    boxShadow:    isFiltered ? `0 0 0 3px ${nodeColor}33` : "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={e => { if (!isFiltered) e.currentTarget.style.borderColor = nodeColor + "88"; }}
                  onMouseLeave={e => { if (!isFiltered) e.currentTarget.style.borderColor = isSusp ? nodeColor + "55" : "#dcfce7"; }}
                >
                  {/* Card header */}
                  <div style={{ background: nodeColor, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", letterSpacing: "0.14em", marginBottom: 3 }}>
                        {ringData ? `${ringData.ring_id} · ${ringData.pattern_type}` : isSusp ? "SUSPICIOUS" : "ACCOUNT"}
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 800, color: "white", wordBreak: "break-all", lineHeight: 1.3 }}>{s.id}</p>
                    </div>
                    {isSusp && (
                      <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: "4px 8px", flexShrink: 0, marginLeft: 8 }}>
                        <p style={{ fontSize: 7, color: "rgba(255,255,255,0.8)", marginBottom: 1 }}>SCORE</p>
                        <p style={{ fontSize: 13, fontWeight: 900, color: "white" }}>{s.suspicious.suspicion_score}</p>
                      </div>
                    )}
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ padding: "10px 14px", borderRight: "1px solid #f3f4f6" }}>
                      <p style={{ fontSize: 8, color: "#9ca3af", marginBottom: 2 }}>SENT</p>
                      <p style={{ fontSize: 16, fontWeight: 900, color: "#111827", lineHeight: 1 }}>
                        {s.sentCount}<span style={{ fontSize: 8, color: "#9ca3af", marginLeft: 3 }}>tx</span>
                      </p>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", marginTop: 2 }}>₹{s.totalSent.toLocaleString("en-IN")}</p>
                    </div>
                    <div style={{ padding: "10px 14px" }}>
                      <p style={{ fontSize: 8, color: "#9ca3af", marginBottom: 2 }}>RECEIVED</p>
                      <p style={{ fontSize: 16, fontWeight: 900, color: "#111827", lineHeight: 1 }}>
                        {s.receivedCount}<span style={{ fontSize: 8, color: "#9ca3af", marginLeft: 3 }}>tx</span>
                      </p>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", marginTop: 2 }}>₹{s.totalReceived.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  {/* Counterparties */}
                  <div style={{ padding: "10px 14px" }}>
                    {s.sentTo.length > 0 && (
                      <div style={{ marginBottom: s.receivedFrom.length > 0 ? 8 : 0 }}>
                        <p style={{ fontSize: 7, letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 4 }}>SENDS TO</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {s.sentTo.slice(0, 4).map(t => (
                            <span key={t} style={{ fontSize: 8, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>{t}</span>
                          ))}
                          {s.sentTo.length > 4 && <span style={{ fontSize: 8, color: "#9ca3af" }}>+{s.sentTo.length - 4} more</span>}
                        </div>
                      </div>
                    )}
                    {s.receivedFrom.length > 0 && (
                      <div>
                        <p style={{ fontSize: 7, letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 4 }}>RECEIVES FROM</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {s.receivedFrom.slice(0, 4).map(src => (
                            <span key={src} style={{ fontSize: 8, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>{src}</span>
                          ))}
                          {s.receivedFrom.length > 4 && <span style={{ fontSize: 8, color: "#9ca3af" }}>+{s.receivedFrom.length - 4} more</span>}
                        </div>
                      </div>
                    )}
                    {s.sentTo.length === 0 && s.receivedFrom.length === 0 && (
                      <p style={{ fontSize: 9, color: "#d1d5db" }}>No transactions</p>
                    )}
                  </div>

                  {/* Click hint */}
                  <div style={{ padding: "6px 14px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
                    <p style={{ fontSize: 8, color: isFiltered ? nodeColor : "#9ca3af", textAlign: "center" }}>
                      {isFiltered ? "✓ Filtered in Transactions tab" : "Click to filter transactions →"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ FRAUD RINGS TAB ══════════════════════════════════════════════ */}
        <div style={{
          position: "absolute", inset: 0,
          opacity:    activeTab === "rings" ? 1 : 0,
          pointerEvents: activeTab === "rings" ? "auto" : "none",
          transform: activeTab === "rings" ? "translateX(0)" : "translateX(-18px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>

          {/* Sort controls */}
          <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 22px", background: "#f0fdf4", borderBottom: "1px solid #dcfce7" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#14532d", letterSpacing: "0.1em" }}>
              {sortedRings.length} FRAUD RING{sortedRings.length !== 1 ? "S" : ""} DETECTED
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "#6b7280" }}>Sort by:</span>
              {[
                { key: "risk_score", label: "Risk Score" },
                { key: "member_count", label: "Members" },
                { key: "ring_id", label: "Ring ID" },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setRingSort(opt.key)}
                  style={{
                    background: ringSort === opt.key ? "#16a34a" : "white",
                    color: ringSort === opt.key ? "white" : "#6b7280",
                    border: `1px solid ${ringSort === opt.key ? "#16a34a" : "#d1d5db"}`,
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 9,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Fira Code', monospace",
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table container */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
            {sortedRings.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 12 }}>
                No fraud rings detected in the current dataset.
              </div>
            )}

            {sortedRings.length > 0 && (
              <div style={{ background: "white", borderRadius: 12, border: "2px solid #dcfce7", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                {/* Table header */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "120px 140px 100px 110px 1fr",
                  gap: "0 12px",
                  padding: "12px 18px",
                  background: "#14532d",
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "#86efac",
                }}>
                  <span>RING ID</span>
                  <span>PATTERN TYPE</span>
                  <span style={{ textAlign: "center" }}>MEMBERS</span>
                  <span style={{ textAlign: "right" }}>RISK SCORE</span>
                  <span>MEMBER ACCOUNT IDs</span>
                </div>

                {/* Table rows */}
                {sortedRings.map((ring, i) => {
                  const ringColor = ringColorMap[ring.ring_id] || RING_PALETTE[0];
                  
                  return (
                    <div
                      key={ring.ring_id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "120px 140px 100px 110px 1fr",
                        gap: "0 12px",
                        padding: "14px 18px",
                        borderBottom: i < sortedRings.length - 1 ? "1px solid #f3f4f6" : "none",
                        background: i % 2 === 0 ? "white" : "#fafffe",
                        alignItems: "center",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={el => el.currentTarget.style.background = "#f0fdf4"}
                      onMouseLeave={el => el.currentTarget.style.background = i % 2 === 0 ? "white" : "#fafffe"}
                    >
                      {/* Ring ID */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: ringColor.node, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: ringColor.node }}>{ring.ring_id}</span>
                      </div>

                      {/* Pattern Type */}
                      <div style={{ background: ringColor.node + "15", border: `1px solid ${ringColor.node}40`, borderRadius: 6, padding: "4px 10px", display: "inline-block" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: ringColor.node, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {ring.pattern_type.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* Member Count */}
                      <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>{ring.member_accounts.length}</span>
                      </div>

                      {/* Risk Score */}
                      <div style={{ textAlign: "right" }}>
                        <div style={{ 
                          display: "inline-block",
                          background: ring.risk_score >= 90 ? "#dc2626" : ring.risk_score >= 70 ? "#ea580c" : "#f59e0b",
                          borderRadius: 8,
                          padding: "6px 12px",
                        }}>
                          <span style={{ fontSize: 14, fontWeight: 900, color: "white" }}>{ring.risk_score.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Member Account IDs */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {ring.member_accounts.map(accId => (
                          <span
                            key={accId}
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              background: ringColor.node + "20",
                              color: ringColor.node,
                              border: `1px solid ${ringColor.node}50`,
                              borderRadius: 5,
                              padding: "3px 8px",
                            }}
                          >
                            {accId}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary stats */}
            {sortedRings.length > 0 && (
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                <div style={{ background: "white", border: "2px solid #dcfce7", borderRadius: 10, padding: "14px 16px" }}>
                  <p style={{ fontSize: 8, color: "#9ca3af", letterSpacing: "0.12em", marginBottom: 6 }}>TOTAL RINGS</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: "#dc2626" }}>{sortedRings.length}</p>
                </div>
                <div style={{ background: "white", border: "2px solid #dcfce7", borderRadius: 10, padding: "14px 16px" }}>
                  <p style={{ fontSize: 8, color: "#9ca3af", letterSpacing: "0.12em", marginBottom: 6 }}>TOTAL MEMBERS</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: "#ea580c" }}>
                    {sortedRings.reduce((sum, r) => sum + r.member_accounts.length, 0)}
                  </p>
                </div>
                <div style={{ background: "white", border: "2px solid #dcfce7", borderRadius: 10, padding: "14px 16px" }}>
                  <p style={{ fontSize: 8, color: "#9ca3af", letterSpacing: "0.12em", marginBottom: 6 }}>AVG RISK SCORE</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: "#7c3aed" }}>
                    {(sortedRings.reduce((sum, r) => sum + r.risk_score, 0) / sortedRings.length).toFixed(1)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ TRANSACTIONS TAB ═════════════════════════════════════════════ */}
        <div style={{
          position: "absolute", inset: 0,
          opacity:    activeTab === "transactions" ? 1 : 0,
          pointerEvents: activeTab === "transactions" ? "auto" : "none",
          transform: activeTab === "transactions" ? "translateX(0)" : "translateX(18px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>

          {/* Totals bar */}
          <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 22px", background: "#f0fdf4", borderBottom: "1px solid #dcfce7" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#14532d", letterSpacing: "0.1em" }}>
              {visibleEdges.length} TRANSACTION{visibleEdges.length !== 1 ? "S" : ""}
              {filterAccount !== "all" && <span style={{ fontWeight: 400, color: "#6b7280" }}> · filtered by {filterAccount}</span>}
            </span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#16a34a" }}>
              Total ₹{totalAmount.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Table header */}
          <div style={{
            flexShrink: 0,
            display: "grid",
            gridTemplateColumns: "150px 1fr 36px 1fr 130px 120px",
            gap: "0 10px",
            padding: "8px 22px",
            background: "#14532d",
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.12em",
          }}>
            {[
              { key: "id",       label: "TX ID",    align: "left"  },
              { key: "sender",   label: "SENDER",   align: "left"  },
              { key: null,       label: "",         align: "center"},
              { key: "receiver", label: "RECEIVER", align: "left"  },
              { key: "amount",   label: "AMOUNT",   align: "right" },
              { key: "date",     label: "DATE",     align: "right" },
            ].map(({ key, label, align }, ci) => (
              <span
                key={ci}
                onClick={key ? () => handleSortClick(key) : undefined}
                style={{ color: key && sortKey === key ? "#4ade80" : "#86efac", textAlign: align, cursor: key ? "pointer" : "default", userSelect: "none" }}
              >
                {label}{key ? sortArrow(key) : ""}
              </span>
            ))}
          </div>

          {/* Table body */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {visibleEdges.length === 0 && (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#9ca3af", fontSize: 11 }}>
                No transactions match the current filter.
              </div>
            )}

            {visibleEdges.map((e, i) => {
              const srcColor    = getNodeColor(e.source);
              const tgtColor    = getNodeColor(e.target);
              const srcSusp     = !!suspiciousMap[e.source];
              const tgtSusp     = !!suspiciousMap[e.target];

              return (
                <div
                  key={e.id}
                  style={{
                    display:         "grid",
                    gridTemplateColumns: "150px 1fr 36px 1fr 130px 120px",
                    gap:             "0 10px",
                    padding:         "9px 22px",
                    borderBottom:    "1px solid #f3f4f6",
                    background:      i % 2 === 0 ? "white" : "#fafffe",
                    alignItems:      "center",
                    transition:      "background 0.1s",
                  }}
                  onMouseEnter={el => el.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={el => el.currentTarget.style.background = i % 2 === 0 ? "white" : "#fafffe"}
                >
                  {/* TX ID */}
                  <span style={{ fontSize: 9, fontWeight: 600, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.id}
                  </span>

                  {/* Sender */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: srcColor, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: srcSusp ? srcColor : "#dc2626", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.source}
                    </span>
                    {srcSusp && <span style={{ fontSize: 8, flexShrink: 0 }}>⚠</span>}
                  </div>

                  {/* Arrow */}
                  <span style={{ fontSize: 16, color: "#16a34a", textAlign: "center" }}>→</span>

                  {/* Receiver */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: tgtColor, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: tgtSusp ? tgtColor : "#16a34a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.target}
                    </span>
                    {tgtSusp && <span style={{ fontSize: 8, flexShrink: 0 }}>⚠</span>}
                  </div>

                  {/* Amount */}
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#111827", textAlign: "right" }}>
                    ₹{e.amount.toLocaleString("en-IN")}
                  </span>

                  {/* Date */}
                  <span style={{ fontSize: 9, color: "#6b7280", textAlign: "right", whiteSpace: "nowrap" }}>
                    {(e.timestamp || "").slice(0, 10)}
                  </span>
                </div>
              );
            })}

            {/* Grand total footer */}
            {visibleEdges.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 36px 1fr 130px 120px", gap: "0 10px", padding: "10px 22px", background: "#f0fdf4", borderTop: "2px solid #14532d", position: "sticky", bottom: 0 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#14532d", letterSpacing: "0.1em", gridColumn: "1 / 5" }}>TOTAL ({visibleEdges.length} transactions)</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: "#16a34a", textAlign: "right" }}>₹{totalAmount.toLocaleString("en-IN")}</span>
                <span />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
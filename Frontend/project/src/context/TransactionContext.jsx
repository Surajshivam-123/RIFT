import { createContext, useState, useCallback } from "react";
import Papa from "papaparse";

// Backend API URL
const API_URL = "http://localhost:3001";

// ─── 1. Create the context ───────────────────────────────────────────────────
export const TransactionContext = createContext(null);

// ─── 2. Helper: turn raw CSV rows into nodes + edges ────────────────────────
/*
  RAW ROW shape (from CSV):
    { transaction_id, sender_id, receiver_id, amount, timestamp }

  We produce:
    nodes → [{ id, x, y, sentCount, receivedCount, totalSent, totalReceived }]
    edges → [{ id, source, target, amount, timestamp }]
*/
function buildGraphData(rows) {
  // --- collect every unique account id ---
  const accountSet = new Set();
  rows.forEach(({ sender_id, receiver_id }) => {
    if (sender_id)   accountSet.add(sender_id.trim());
    if (receiver_id) accountSet.add(receiver_id.trim());
  });

  const nodeList = [...accountSet];
  const total    = nodeList.length;

  // --- position nodes in a circle so arrows don't overlap badly ---
  // Centre of the SVG canvas (GraphPage uses viewBox 0 0 1200 800)
  const CX     = 600;
  const CY     = 400;
  // Radius grows with node count but is capped so nodes stay visible
  const RADIUS = Math.max(150, Math.min(340, total * 22));

  const nodes = nodeList.map((id, i) => {
    const angle = (2 * Math.PI * i) / total - Math.PI / 2; // start from top
    return {
      id,
      x: Math.round(CX + RADIUS * Math.cos(angle)),
      y: Math.round(CY + RADIUS * Math.sin(angle)),
      // stats — filled in below
      sentCount:     0,
      receivedCount: 0,
      totalSent:     0,
      totalReceived: 0,
    };
  });

  // quick lookup  id → node object
  const nodeMap = {};
  nodes.forEach((n) => (nodeMap[n.id] = n));

  // --- build edges and accumulate per-node stats ---
  const edges = rows
    .filter((r) => r.sender_id && r.receiver_id)
    .map((r, i) => {
      const src = r.sender_id.trim();
      const tgt = r.receiver_id.trim();
      const amt = parseFloat(r.amount) || 0;

      // update node stats
      if (nodeMap[src]) {
        nodeMap[src].sentCount    += 1;
        nodeMap[src].totalSent    += amt;
      }
      if (nodeMap[tgt]) {
        nodeMap[tgt].receivedCount += 1;
        nodeMap[tgt].totalReceived += amt;
      }

      return {
        id:        r.transaction_id?.trim() || `edge-${i}`,
        source:    src,
        target:    tgt,
        amount:    amt,
        timestamp: r.timestamp?.trim() || "",
      };
    });

  return { nodes, edges, nodeMap };
}

// ─── 3. Provider component ───────────────────────────────────────────────────
export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]); // raw CSV rows
  const [nodes,        setNodes]        = useState([]);
  const [edges,        setEdges]        = useState([]);
  const [nodeMap,      setNodeMap]      = useState({});
  const [fileName,     setFileName]     = useState("");
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [fraudData,    setFraudData]    = useState(null); // Backend fraud analysis results

  // Called when the user picks a CSV file
  const loadCSV = useCallback(async (file) => {
    if (!file) return;
    setLoading(true);
    setError("");
    setFileName(file.name);

    // First, parse CSV locally for graph visualization
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
      complete: async (result) => {
        const rows = result.data;

        // Basic validation
        const required = ["transaction_id", "sender_id", "receiver_id", "amount", "timestamp"];
        const headers  = Object.keys(rows[0] || {});
        const missing  = required.filter((c) => !headers.includes(c));

        if (missing.length > 0) {
          setError(`CSV is missing columns: ${missing.join(", ")}`);
          setLoading(false);
          return;
        }

        const graph = buildGraphData(rows);

        setTransactions(rows);
        setNodes(graph.nodes);
        setEdges(graph.edges);
        setNodeMap(graph.nodeMap);

        // Now send to backend for fraud analysis
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`${API_URL}/api/analyze`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
          }

          const result = await response.json();
          
          if (result.success) {
            setFraudData(result.data);
          } else {
            setError(result.error || 'Failed to analyze fraud patterns');
          }
        } catch (err) {
          console.error('Backend analysis error:', err);
          setError(`Backend analysis failed: ${err.message}. Make sure backend server is running on port 3001.`);
        }

        setLoading(false);
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
        setLoading(false);
      },
    });
  }, []);

  const value = {
    // data
    transactions,
    nodes,
    edges,
    nodeMap,
    fraudData,    // NEW: fraud detection results from backend
    // meta
    fileName,
    error,
    loading,
    // action
    loadCSV,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}


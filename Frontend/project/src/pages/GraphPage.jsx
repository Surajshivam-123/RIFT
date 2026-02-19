/**
 * GraphPage.jsx  —  Fraud Ring Detection Overlay
 *
 * KEY FIX: Colors are applied inside the RAF tick loop every frame using refs,
 * NOT via React useEffect + setState. This guarantees the SVG elements exist
 * when colors are written, and that highlight/selection changes are instant.
 *
 * Visual encoding:
 *   RING_001 → RED   nodes + dashed red edges
 *   RING_002 → ORANGE nodes + dashed orange edges
 *   RING_003 → PURPLE nodes + dashed purple edges
 *   Solo suspicious (ACC_H) → dark crimson + ⚠ + pulsing ring
 *   Normal → green
 */

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3-force";
import { useTransactions } from "../hooks/useTransactions";
import Button from "../components/Button";
import fraudAnalysis from "../data/fraudAnalysis.json";

// ─── Physics constants (D3 handles forces now — these are unused) ─────────────
const NODE_R_NORMAL     = 38;
const NODE_R_SUSPICIOUS = 46;
const NS                = "http://www.w3.org/2000/svg";

// ─── Color palette ────────────────────────────────────────────────────────────
const RING_PALETTE = [
  { node: "#dc2626", stroke: "#fca5a5", edge: "#ef4444", label: "#fca5a5" }, // red
  { node: "#ea580c", stroke: "#fdba74", edge: "#f97316", label: "#fdba74" }, // orange
  { node: "#7c3aed", stroke: "#c4b5fd", edge: "#8b5cf6", label: "#c4b5fd" }, // purple
  { node: "#0891b2", stroke: "#67e8f9", edge: "#06b6d4", label: "#67e8f9" }, // cyan
  { node: "#be185d", stroke: "#f9a8d4", edge: "#ec4899", label: "#f9a8d4" }, // pink
];
const SOLO_COLOR   = { node: "#991b1b", stroke: "#fca5a5", edge: "#ef4444" };
const NORMAL_COLOR = { node: "#16a34a", stroke: "#bbf7d0" };

// ─── Build lookup maps ────────────────────────────────────────────────────────
function buildFraudMaps(analysis) {
  const ringColorMap = {};
  analysis.fraud_rings.forEach((ring, i) => {
    ringColorMap[ring.ring_id] = RING_PALETTE[i % RING_PALETTE.length];
  });
  const suspiciousMap = {};
  analysis.suspicious_accounts.forEach(a => {
    suspiciousMap[a.account_id] = a;
  });
  const accountRingMap = {};
  analysis.fraud_rings.forEach(ring => {
    ring.member_accounts.forEach(id => { accountRingMap[id] = ring; });
  });
  return { ringColorMap, suspiciousMap, accountRingMap };
}

const { ringColorMap, suspiciousMap, accountRingMap } = buildFraudMaps(fraudAnalysis);

function getNodeR(id) {
  return suspiciousMap[id] ? NODE_R_SUSPICIOUS : NODE_R_NORMAL;
}

function getNodeColors(id) {
  const ring = accountRingMap[id];
  const susp = suspiciousMap[id];
  if (ring)       return { fill: ringColorMap[ring.ring_id].node, stroke: ringColorMap[ring.ring_id].stroke };
  if (susp)       return { fill: SOLO_COLOR.node,   stroke: SOLO_COLOR.stroke };
  return              { fill: NORMAL_COLOR.node, stroke: NORMAL_COLOR.stroke };
}

// ─── Core DOM paint function — called every RAF tick ─────────────────────────
// Takes refs (not state) so it never triggers re-renders
function paintGraph(bodies, springs, edgeMids, selectedIdsRef, highlightedRingIdRef, activeEdgeIdxRef) {
  const selectedIds      = selectedIdsRef.current;
  const highlightedRingId = highlightedRingIdRef.current;
  const activeIdx        = activeEdgeIdxRef.current;

  // ── Paint nodes ────────────────────────────────────────────────────────────
  bodies.forEach((b, i) => {
    const ring   = accountRingMap[b.id];
    const susp   = suspiciousMap[b.id];
    const sel    = selectedIds.has(b.id);
    const dimmed = highlightedRingId
      ? !(ring && ring.ring_id === highlightedRingId)
      : false;

    const nc = document.getElementById(`nc-${i}`);
    if (nc) {
      if (dimmed) {
        nc.setAttribute("fill",            "#166534");
        nc.setAttribute("stroke",          "#14532d");
        nc.setAttribute("fill-opacity",    "0.3");
        nc.setAttribute("stroke-opacity",  "0.3");
      } else {
        const c = getNodeColors(b.id);
        nc.setAttribute("fill",           c.fill);
        nc.setAttribute("stroke",         c.stroke);
        nc.setAttribute("fill-opacity",   "1");
        nc.setAttribute("stroke-opacity", "1");
      }
    }

    // Selection ring
    const sr = document.getElementById(`sel-${i}`);
    if (sr) sr.setAttribute("opacity", sel ? "1" : "0");

    // Pulse ring (suspicious only)
    const pr = document.getElementById(`pulse-${i}`);
    if (pr) pr.setAttribute("opacity", (susp && !dimmed) ? "1" : "0");

    // Score badge
    const bd = document.getElementById(`badge-${i}`);
    if (bd) bd.setAttribute("opacity", (susp && !dimmed) ? "1" : "0");

    // Text opacity
    const nt = document.getElementById(`nt-${i}`);
    if (nt) nt.setAttribute("opacity", dimmed ? "0.25" : "1");
  });

  // ── Paint edges ────────────────────────────────────────────────────────────
  springs.forEach((s, i) => {
    const ep = document.getElementById(`ep-${i}`);
    if (!ep) return;

    // D3 mutates source/target from string IDs → body objects after simulation starts
    const srcId   = s.source?.id  ?? s.source;
    const tgtId   = s.target?.id  ?? s.target;
    const srcRing  = accountRingMap[srcId];
    const tgtRing  = accountRingMap[tgtId];
    const sameRing = srcRing && tgtRing && srcRing.ring_id === tgtRing.ring_id;
    const dimmed   = highlightedRingId
      ? !(sameRing && srcRing.ring_id === highlightedRingId)
      : false;

    if (i === activeIdx) {
      ep.setAttribute("stroke",           "#facc15");
      ep.setAttribute("stroke-width",     "3");
      ep.setAttribute("opacity",          "1");
      ep.setAttribute("stroke-dasharray", "none");
      ep.setAttribute("marker-end",       "url(#arr-yellow)");
    } else if (sameRing && !dimmed) {
      const color = ringColorMap[srcRing.ring_id];
      ep.setAttribute("stroke",           color.edge);
      ep.setAttribute("stroke-width",     "2.8");
      ep.setAttribute("opacity",          "1");
      ep.setAttribute("stroke-dasharray", "8 4");
      ep.setAttribute("marker-end",       `url(#arr-${srcRing.ring_id})`);
    } else if (dimmed) {
      ep.setAttribute("stroke",           "#16a34a");
      ep.setAttribute("stroke-width",     "1");
      ep.setAttribute("opacity",          "0.06");
      ep.setAttribute("stroke-dasharray", "none");
      ep.setAttribute("marker-end",       "url(#arr-green)");
    } else if (selectedIds.has(srcId) && selectedIds.has(tgtId)) {
      ep.setAttribute("stroke",           "#4ade80");
      ep.setAttribute("stroke-width",     "2.5");
      ep.setAttribute("opacity",          "1");
      ep.setAttribute("stroke-dasharray", "none");
      ep.setAttribute("marker-end",       "url(#arr-green)");
    } else if (selectedIds.has(srcId) || selectedIds.has(tgtId)) {
      ep.setAttribute("stroke",           "#16a34a");
      ep.setAttribute("stroke-width",     "1.8");
      ep.setAttribute("opacity",          "1");
      ep.setAttribute("stroke-dasharray", "none");
      ep.setAttribute("marker-end",       "url(#arr-green)");
    } else {
      ep.setAttribute("stroke",           "#16a34a");
      ep.setAttribute("stroke-width",     "1.2");
      ep.setAttribute("opacity",          "0.18");
      ep.setAttribute("stroke-dasharray", "none");
      ep.setAttribute("marker-end",       "url(#arr-green)");
    }
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GraphPage({ onNavigate, onSelectionChange }) {
  const { nodes, edges, loadCSV, fileName, loading, error } = useTransactions();

  const [selectedIds,       setSelectedIds]       = useState(new Set());
  const [edgeTooltip,       setEdgeTooltip]       = useState(null);
  const [highlightedRingId, setHighlightedRingId] = useState(null);
  const [nodePopup,         setNodePopup]         = useState(null);

  // ── Refs read by the tick loop ────────────────────────────────────────────
  const selectedIdsRef       = useRef(new Set());
  const highlightedRingIdRef = useRef(null);
  const activeEdgeIdxRef     = useRef(-1);

  // Keep refs in sync with state — tick loop reads refs, never state
  useEffect(() => { selectedIdsRef.current = selectedIds; },         [selectedIds]);
  useEffect(() => { highlightedRingIdRef.current = highlightedRingId; }, [highlightedRingId]);
  useEffect(() => { activeEdgeIdxRef.current = edgeTooltip?.springIdx ?? -1; }, [edgeTooltip]);

  useEffect(() => { onSelectionChange?.(selectedIds); }, [selectedIds]);

  const fileRef    = useRef(null);
  const wrapperRef = useRef(null);
  const svgEl      = useRef(null);
  const layerEdges = useRef(null);
  const layerNodes = useRef(null);
  const layerNText = useRef(null);
  const sim        = useRef({ bodies: [], springs: [], CW: 900, CH: 600 });
  const edgeMids   = useRef([]);

  // ── Zoom / pan ────────────────────────────────────────────────────────────
  const [zoom,    setZoom]    = useState(1);
  const zoomRef               = useRef(1);
  const panRef                = useRef({ x: 0, y: 0 });
  const isPanningRef          = useRef(false);
  const panStartRef           = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  function applyTransform(z, p) {
    const g = svgEl.current?.querySelector("g.viewport");
    if (g) g.setAttribute("transform", `translate(${p.x.toFixed(2)},${p.y.toFixed(2)}) scale(${z.toFixed(4)})`);
  }

  function doZoom(delta, cx, cy) {
    const oldZ = zoomRef.current;
    const newZ = Math.min(5, Math.max(0.2, oldZ * (delta > 0 ? 1.12 : 0.893)));
    const p    = panRef.current;
    panRef.current  = { x: cx - (cx - p.x) * (newZ / oldZ), y: cy - (cy - p.y) * (newZ / oldZ) };
    zoomRef.current = newZ;
    setZoom(newZ);
    applyTransform(newZ, panRef.current);
  }

  function resetZoom() {
    zoomRef.current = 1;
    panRef.current  = { x: 0, y: 0 };
    setZoom(1);
    applyTransform(1, { x: 0, y: 0 });
  }

  // ── Rebuild SVG when CSV data changes ─────────────────────────────────────
  useEffect(() => {
    [layerEdges, layerNodes, layerNText].forEach(r => { if (r.current) r.current.innerHTML = ""; });
    setSelectedIds(new Set());
    selectedIdsRef.current = new Set();
    setEdgeTooltip(null);
    activeEdgeIdxRef.current = -1;
    setNodePopup(null);
    if (nodes.length === 0) return;

    const rect = wrapperRef.current?.getBoundingClientRect?.() ?? { width: 900, height: 600 };
    const CW   = Math.max(600, rect.width);
    const CH   = Math.max(400, rect.height);
    svgEl.current?.setAttribute("width",   CW);
    svgEl.current?.setAttribute("height",  CH);
    svgEl.current?.setAttribute("viewBox", `0 0 ${CW} ${CH}`);
    // Reset zoom/pan on new data
    zoomRef.current = 1;
    panRef.current  = { x: 0, y: 0 };
    setZoom(1);

    // ── Arrowhead markers in <defs> ──────────────────────────────────────────
    const oldDefs = svgEl.current?.querySelector("defs");
    if (oldDefs) oldDefs.remove();
    const defs = document.createElementNS(NS, "defs");

    function makeArrow(id, color) {
      const m = document.createElementNS(NS, "marker");
      m.setAttribute("id",           id);
      m.setAttribute("markerWidth",  "8");
      m.setAttribute("markerHeight", "6");
      m.setAttribute("refX",         "8");
      m.setAttribute("refY",         "3");
      m.setAttribute("orient",       "auto");
      const p = document.createElementNS(NS, "polygon");
      p.setAttribute("points", "0 0, 8 3, 0 6");
      p.setAttribute("fill",   color);
      m.appendChild(p);
      defs.appendChild(m);
    }
    makeArrow("arr-green",  "#16a34a");
    makeArrow("arr-yellow", "#facc15");
    fraudAnalysis.fraud_rings.forEach(ring => {
      makeArrow(`arr-${ring.ring_id}`, ringColorMap[ring.ring_id].edge);
    });
    svgEl.current.insertBefore(defs, svgEl.current.firstChild);

    // ── Viewport group (zoom/pan target) ────────────────────────────────────
    let vp = svgEl.current.querySelector("g.viewport");
    if (!vp) {
      vp = document.createElementNS(NS, "g");
      vp.setAttribute("class", "viewport");
      svgEl.current.appendChild(vp);
    } else {
      vp.innerHTML = "";
    }
    // Re-attach layer refs inside viewport
    const le = document.createElementNS(NS, "g");
    const ln = document.createElementNS(NS, "g");
    const lt = document.createElementNS(NS, "g");
    vp.appendChild(le); vp.appendChild(ln); vp.appendChild(lt);
    layerEdges.current = le;
    layerNodes.current = ln;
    layerNText.current = lt;
    applyTransform(1, { x: 0, y: 0 });

    // ── Build physics bodies ─────────────────────────────────────────────────
    const degree = {};
    nodes.forEach(n => { degree[n.id] = 0; });
    edges.forEach(e => {
      if (degree[e.source] !== undefined) degree[e.source]++;
      if (degree[e.target]  !== undefined) degree[e.target]++;
    });

    const cols  = Math.max(2, Math.ceil(Math.sqrt(nodes.length * (CW / CH))));
    const PAD   = NODE_R_NORMAL * 5;
    const cellW = (CW - PAD * 2) / cols;
    const cellH = (CH - PAD * 2) / Math.ceil(nodes.length / cols);

    const bodies = nodes.map((n, i) => ({
      id: n.id,
      x:  PAD + (i % cols) * cellW + cellW / 2 + (Math.random() - 0.5) * 20,
      y:  PAD + Math.floor(i / cols) * cellH + cellH / 2 + (Math.random() - 0.5) * 20,
    }));

    const idx = {};
    bodies.forEach((b, i) => { idx[b.id] = i; });

    const springs = edges
      .filter(e => e.source !== e.target && idx[e.source] !== undefined && idx[e.target] !== undefined)
      .map(e => ({
        source:    e.source,   // D3 forceLink uses these as IDs, then mutates to object refs
        target:    e.target,
        edgeId:    e.id,
        amount:    e.amount,
        timestamp: e.timestamp || "",
        date:      (e.timestamp || "").slice(0, 10),
      }));

    sim.current      = { bodies, springs, CW, CH };
    edgeMids.current = springs.map(() => ({ mx: 0, my: 0 }));

    // ── Edge SVG elements ────────────────────────────────────────────────────
    springs.forEach((_, i) => {
      const p = document.createElementNS(NS, "path");
      p.id = `ep-${i}`;
      p.setAttribute("fill",         "none");
      p.setAttribute("stroke",       "#16a34a");
      p.setAttribute("stroke-width", "1.2");
      p.setAttribute("marker-end",   "url(#arr-green)");
      p.setAttribute("opacity",      "0.18");
      layerEdges.current.appendChild(p);

      const hit = document.createElementNS(NS, "path");
      hit.id = `eh-${i}`;
      hit.setAttribute("fill",         "none");
      hit.setAttribute("stroke",       "transparent");
      hit.setAttribute("stroke-width", "16");
      hit.style.cursor = "pointer";
      layerEdges.current.appendChild(hit);
    });

    // ── Node SVG elements ────────────────────────────────────────────────────
    bodies.forEach((b, i) => {
      const susp  = suspiciousMap[b.id];
      const r     = getNodeR(b.id);
      const color = getNodeColors(b.id);

      const g = document.createElementNS(NS, "g");
      g.id = `ng-${i}`;
      g.style.cursor = "pointer";

      // Shadow
      const shadow = document.createElementNS(NS, "circle");
      shadow.setAttribute("r",       r + 3);
      shadow.setAttribute("cx",      "0");
      shadow.setAttribute("cy",      "4");
      shadow.setAttribute("fill",    susp ? "#450a0a" : "#bbf7d0");
      shadow.setAttribute("opacity", "0.4");
      g.appendChild(shadow);

      // Pulse ring (always present, opacity toggled by paintGraph)
      const pulse = document.createElementNS(NS, "circle");
      pulse.id = `pulse-${i}`;
      pulse.setAttribute("r",            r + 18);
      pulse.setAttribute("fill",         "none");
      pulse.setAttribute("stroke",       color.fill);
      pulse.setAttribute("stroke-width", "2");
      pulse.setAttribute("opacity",      susp ? "1" : "0");
      pulse.style.animation = "pulse-ring 2s ease-out infinite";
      g.appendChild(pulse);

      // Main circle — color set here initially, repainted every tick by paintGraph
      const circle = document.createElementNS(NS, "circle");
      circle.id = `nc-${i}`;
      circle.setAttribute("r",            r);
      circle.setAttribute("fill",         color.fill);
      circle.setAttribute("stroke",       color.stroke);
      circle.setAttribute("stroke-width", susp ? "3.5" : "2.5");
      g.appendChild(circle);

      // Selection ring
      const selRing = document.createElementNS(NS, "circle");
      selRing.id = `sel-${i}`;
      selRing.setAttribute("r",               r + 11);
      selRing.setAttribute("fill",            "none");
      selRing.setAttribute("stroke",          "#facc15");
      selRing.setAttribute("stroke-width",    "3");
      selRing.setAttribute("stroke-dasharray","7 3");
      selRing.setAttribute("opacity",         "0");
      g.appendChild(selRing);

      // ⚠ warning icon (suspicious only)
      if (susp) {
        const warn = document.createElementNS(NS, "text");
        warn.setAttribute("text-anchor",       "middle");
        warn.setAttribute("dominant-baseline", "middle");
        warn.setAttribute("font-size",         "14");
        warn.setAttribute("y",                 `${-r + 16}`);
        warn.setAttribute("fill",              "white");
        warn.setAttribute("pointer-events",    "none");
        warn.textContent = "⚠";
        g.appendChild(warn);
      }

      // Score badge (suspicious only, opacity toggled by paintGraph)
      if (susp) {
        const badgeG = document.createElementNS(NS, "g");
        badgeG.id = `badge-${i}`;
        badgeG.setAttribute("transform", `translate(${r - 2},${-r + 2})`);
        badgeG.setAttribute("opacity", "1");

        const badgeBg = document.createElementNS(NS, "circle");
        badgeBg.setAttribute("r",            "14");
        badgeBg.setAttribute("fill",         "#111827");
        badgeBg.setAttribute("stroke",       color.fill);
        badgeBg.setAttribute("stroke-width", "1.8");
        badgeG.appendChild(badgeBg);

        const scoreText = document.createElementNS(NS, "text");
        scoreText.setAttribute("text-anchor",       "middle");
        scoreText.setAttribute("dominant-baseline", "middle");
        scoreText.setAttribute("font-size",         "8.5");
        scoreText.setAttribute("font-weight",       "900");
        scoreText.setAttribute("fill",              "#ef4444");
        scoreText.setAttribute("font-family",       "monospace");
        scoreText.textContent = Math.round(susp.suspicion_score);
        badgeG.appendChild(scoreText);
        g.appendChild(badgeG);
      } else {
        // Placeholder so paintGraph can always reference badge-${i}
        const badgeG = document.createElementNS(NS, "g");
        badgeG.id = `badge-${i}`;
        badgeG.setAttribute("opacity", "0");
        g.appendChild(badgeG);
      }

      layerNodes.current.appendChild(g);
    });

    // ── Label layer ──────────────────────────────────────────────────────────
    bodies.forEach((b, i) => {
      const susp = suspiciousMap[b.id];
      const g = document.createElementNS(NS, "g");
      g.id = `nt-${i}`;
      g.setAttribute("pointer-events", "none");

      const t = document.createElementNS(NS, "text");
      t.setAttribute("text-anchor",       "middle");
      t.setAttribute("dominant-baseline", "middle");
      t.setAttribute("font-size",         "10");
      t.setAttribute("font-weight",       "800");
      t.setAttribute("font-family",       "monospace");
      t.setAttribute("fill",              "white");
      t.setAttribute("y",                 susp ? "7" : "0");
      t.textContent = b.id.length > 9 ? b.id.slice(-8) : b.id;
      g.appendChild(t);

      layerNText.current.appendChild(g);
    });

    // ── D3 Force Simulation (replaces hand-rolled physics) ───────────────────
    // D3 mutates bodies[i].x / .y directly — springs use object refs after init
    const simulation = d3.forceSimulation(bodies)
      .force("link",
        d3.forceLink(springs)
          .id(d => d.id)
          .distance(d => {
            const srcRing = accountRingMap[d.source?.id ?? d.source];
            const tgtRing = accountRingMap[d.target?.id ?? d.target];
            const sameRing = srcRing && tgtRing && srcRing.ring_id === tgtRing.ring_id;
            return sameRing ? 160 : 60;
          })
          .strength(0.6)
      )
      .force("charge", d3.forceManyBody().strength(-1100))
      .force("center",    d3.forceCenter(CW / 2, CH / 2))
      .force("collision", d3.forceCollide().radius(d => getNodeR(d.id) + 32))
      .alphaDecay(0.03)
      .velocityDecay(0.35);

    simulation.on("tick", () => {
      bodies.forEach((b, i) => {
        const t = `translate(${b.x.toFixed(1)},${b.y.toFixed(1)})`;
        document.getElementById(`ng-${i}`)?.setAttribute("transform", t);
        document.getElementById(`nt-${i}`)?.setAttribute("transform", t);
      });

      springs.forEach((s, i) => {
        // After D3 link force runs, s.source / s.target are mutated to body objects
        const a = s.source;
        const b = s.target;
        if (!a || !b || a.x == null) return;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const curvature = 0.28;
        const cx = a.x + dx / 2 - dy * curvature;
        const cy = a.y + dy / 2 + dx * curvature;

        // Store midpoint for click hit-testing
        edgeMids.current[i] = { mx: cx, my: cy };

        const pathData = `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
        document.getElementById(`ep-${i}`)?.setAttribute("d", pathData);
        document.getElementById(`eh-${i}`)?.setAttribute("d", pathData);
      });

      paintGraph(
        bodies, springs, edgeMids.current,
        selectedIdsRef, highlightedRingIdRef, activeEdgeIdxRef
      );
    });

    return () => { simulation.stop(); };
  }, [nodes, edges]);

  // ── Click handler (accounts for zoom/pan) ────────────────────────────────
  function handleSvgClick(e) {
    if (!svgEl.current) return;
    // Convert screen coords → world coords (undo pan + zoom)
    const rect = wrapperRef.current.getBoundingClientRect();
    const sx   = e.clientX - rect.left;
    const sy   = e.clientY - rect.top;
    const x    = (sx - panRef.current.x) / zoomRef.current;
    const y    = (sy - panRef.current.y) / zoomRef.current;
    const { bodies, springs } = sim.current;

    for (let i = 0; i < bodies.length; i++) {
      if (Math.hypot(x - bodies[i].x, y - bodies[i].y) <= getNodeR(bodies[i].id) + 6) {
        const id = bodies[i].id;
        setEdgeTooltip(null);
        activeEdgeIdxRef.current = -1;
        setNodePopup(prev => prev?.id === id ? null : {
          id,
          svgX: bodies[i].x, svgY: bodies[i].y,
          suspicious: suspiciousMap[id],
          ring: accountRingMap[id],
        });
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.has(id) ? next.delete(id) : next.add(id);
          selectedIdsRef.current = next;    // sync ref immediately
          return next;
        });
        return;
      }
    }

    const HIT = 28;
    for (let i = 0; i < springs.length; i++) {
      const m = edgeMids.current[i];
      if (!m) continue;
      if (Math.hypot(x - m.mx, y - m.my) <= HIT) {
        const s      = springs[i];
        // After D3 runs, s.source and s.target are body objects with .id
        const srcId  = s.source?.id  ?? s.source;
        const tgtId  = s.target?.id  ?? s.target;
        setNodePopup(null);
        activeEdgeIdxRef.current = i;
        setEdgeTooltip(prev => prev?.springIdx === i ? null : {
          springIdx: i, source: srcId, target: tgtId,
          id: s.edgeId, amount: s.amount, date: s.date, timestamp: s.timestamp,
        });
        return;
      }
    }

    setEdgeTooltip(null);
    setNodePopup(null);
    activeEdgeIdxRef.current = -1;
    setSelectedIds(new Set());
    selectedIdsRef.current = new Set();
  }

  function toggleNodeSidebar(nodeId) {
    setEdgeTooltip(null);
    setNodePopup(null);
    activeEdgeIdxRef.current = -1;
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
      selectedIdsRef.current = next;
      return next;
    });
  }

  function handleRingClick(ringId) {
    const next = highlightedRingId === ringId ? null : ringId;
    setHighlightedRingId(next);
    highlightedRingIdRef.current = next;   // sync ref immediately
  }

  function getEdgeTooltipPos() {
    if (!edgeTooltip || !wrapperRef.current) return { display: "none" };
    const m    = edgeMids.current[edgeTooltip.springIdx];
    if (!m) return { display: "none" };
    // Map world → screen
    const sx   = m.mx * zoomRef.current + panRef.current.x;
    const sy   = m.my * zoomRef.current + panRef.current.y;
    const maxL = (wrapperRef.current.offsetWidth  ?? 900) - 235;
    const maxT = (wrapperRef.current.offsetHeight ?? 600) - 200;
    return { position: "absolute", left: Math.max(8, Math.min(sx + 16, maxL)), top: Math.max(8, Math.min(sy + 16, maxT)) };
  }

  function getNodePopupPos() {
    if (!nodePopup || !wrapperRef.current) return { display: "none" };
    // Map world coords → screen coords using current pan/zoom
    const sx   = nodePopup.svgX * zoomRef.current + panRef.current.x;
    const sy   = nodePopup.svgY * zoomRef.current + panRef.current.y;
    const maxL = (wrapperRef.current.offsetWidth  ?? 900) - 244;
    const maxT = (wrapperRef.current.offsetHeight ?? 600) - 250;
    return { position: "absolute", left: Math.max(8, Math.min(sx + 55, maxL)), top: Math.max(8, Math.min(sy - 80, maxT)) };
  }

  const hasData    = nodes.length > 0;
  const totalFlags = fraudAnalysis.summary.suspicious_accounts_flagged;
  const totalRings = fraudAnalysis.summary.fraud_rings_detected;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "white", fontFamily: "'Fira Code', monospace" }}>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header style={{ height: 54, flexShrink: 0, background: "#14532d", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", borderBottom: "1px solid #166534" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10, color: "#14532d" }}>FE</div>
          <span style={{ color: "white", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em" }}>FORENSICS ENGINE</span>
          <span style={{ color: "#166534" }}>·</span>
          <span style={{ color: "#4ade80", fontSize: 10, letterSpacing: "0.08em" }}>TRANSACTION GRAPH</span>
          <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
            <div style={{ background: "#7f1d1d", border: "1px solid #ef4444", borderRadius: 6, padding: "3px 9px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 9, color: "#ef4444" }}>⚠</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#fca5a5" }}>{totalFlags} SUSPICIOUS</span>
            </div>
            <div style={{ background: "#1c1917", border: "1px solid #f97316", borderRadius: 6, padding: "3px 9px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 9, color: "#f97316" }}>◉</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#fdba74" }}>{totalRings} RINGS</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 11, alignItems: "center" }}>
          <span style={{ color: "#86efac" }}>NODES <b style={{ color: "white" }}>{nodes.length}</b></span>
          <span style={{ color: "#86efac" }}>EDGES <b style={{ color: "white" }}>{edges.length}</b></span>
          {selectedIds.size > 0 && <span style={{ color: "#4ade80", fontSize: 10 }}>{selectedIds.size} selected</span>}
          {fileName && <span style={{ color: "#4ade80", fontSize: 10 }}>📄 {fileName}</span>}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: hasData ? "#4ade80" : "#166534", boxShadow: hasData ? "0 0 8px #4ade80" : "none" }} />
            <span style={{ color: hasData ? "#4ade80" : "#166534", fontSize: 10 }}>{hasData ? "ACTIVE" : "IDLE"}</span>
          </div>
          <Button outline success rounded onClick={() => onNavigate("details")}>Show Details</Button>
          <Button outline secondary rounded onClick={() => onNavigate("addfile")}>Add File</Button>
        </div>
      </header>

      {/* ══ BODY ════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
        <aside style={{ width: 224, flexShrink: 0, borderRight: "1px solid #dcfce7", background: "#f0fdf4", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Upload zone */}
          <div style={{ padding: 14, borderBottom: "1px solid #dcfce7", flexShrink: 0 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.18em", color: "#15803d", marginBottom: 9, textTransform: "uppercase" }}>Data Source</p>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) loadCSV(f); }}
              onDragOver={e => e.preventDefault()}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#16a34a"; e.currentTarget.style.background = "#dcfce7"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#86efac"; e.currentTarget.style.background = "white"; }}
              style={{ border: "2px dashed #86efac", borderRadius: 10, padding: "14px 10px", textAlign: "center", cursor: "pointer", background: "white", transition: "all 0.15s" }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>⬆</div>
              <p style={{ fontSize: 10, color: "#15803d", lineHeight: 1.5 }}>{loading ? "Parsing…" : "Drop CSV or click"}</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
              onChange={e => { const f = e.target.files?.[0]; if (f) loadCSV(f); }} />
            {error && <p style={{ marginTop: 7, fontSize: 9, color: "#dc2626", lineHeight: 1.5 }}>{error}</p>}
          </div>

          {/* Accounts list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", borderBottom: "1px solid #dcfce7" }}>
            <p style={{ fontSize: 9, letterSpacing: "0.18em", color: "#15803d", marginBottom: 9, textTransform: "uppercase" }}>Accounts ({nodes.length})</p>
            {!hasData && <p style={{ fontSize: 10, color: "#86efac", lineHeight: 1.6 }}>Upload a CSV to begin.</p>}
            {nodes.map(n => {
              const sel   = selectedIds.has(n.id);
              const susp  = suspiciousMap[n.id];
              const color = getNodeColors(n.id);
              return (
                <div key={n.id} onClick={() => toggleNodeSidebar(n.id)}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", borderRadius: 7, marginBottom: 3, cursor: "pointer", background: sel ? color.fill : "white", border: `1px solid ${sel ? "transparent" : susp ? color.fill + "66" : "#bbf7d0"}`, transition: "all 0.12s" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: sel ? "white" : color.fill }} />
                  <span style={{ fontSize: 10, color: sel ? "white" : "#15803d", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.id}</span>
                  {susp
                    ? <span style={{ fontSize: 8, color: sel ? "white" : color.fill, flexShrink: 0, fontWeight: 700 }}>{Math.round(susp.suspicion_score)}</span>
                    : <span style={{ fontSize: 9, color: sel ? "#bbf7d0" : "#86efac", flexShrink: 0 }}>{n.sentCount + n.receivedCount}</span>
                  }
                </div>
              );
            })}
          </div>

          {/* ── Fraud rings panel ─────────────────────────────────────── */}
          <div style={{ flexShrink: 0, padding: 12, background: "#fff7ed", overflowY: "auto", maxHeight: 260 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.18em", color: "#c2410c", marginBottom: 10, textTransform: "uppercase", fontWeight: 700 }}>
              ⚠ Fraud Rings ({fraudAnalysis.fraud_rings.length})
            </p>

            {fraudAnalysis.fraud_rings.map((ring, ri) => {
              const color    = RING_PALETTE[ri % RING_PALETTE.length];
              const isActive = highlightedRingId === ring.ring_id;
              return (
                <div key={ring.ring_id} onClick={() => handleRingClick(ring.ring_id)}
                  style={{ border: `1.5px solid ${isActive ? color.node : color.edge + "55"}`, borderRadius: 9, padding: "9px 11px", marginBottom: 7, background: isActive ? color.node + "18" : "white", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color.node }} />
                      <span style={{ fontSize: 10, fontWeight: 800, color: color.node }}>{ring.ring_id}</span>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: ring.risk_score > 90 ? "#ef4444" : "#f97316" }}>{ring.risk_score}%</span>
                  </div>
                  <div style={{ fontSize: 8, color: "#78716c", marginBottom: 3 }}>
                    <span style={{ textTransform: "uppercase", letterSpacing: "0.08em", background: color.node + "22", color: color.node, padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>{ring.pattern_type}</span>
                    <span style={{ marginLeft: 5 }}>{ring.member_accounts.length} members</span>
                  </div>
                  <div style={{ fontSize: 8, color: "#a8a29e" }}>₹{(ring.total_amount_cycled).toLocaleString("en-IN")} cycled</div>
                  {isActive && <div style={{ marginTop: 5, fontSize: 8, color: color.node, fontWeight: 600 }}>✓ Isolated · click to clear</div>}
                </div>
              );
            })}

            {/* Solo suspicious */}
            {fraudAnalysis.suspicious_accounts.filter(a => !a.ring_id).length > 0 && (
              <div style={{ borderTop: "1px solid #fed7aa", paddingTop: 8, marginTop: 4 }}>
                <p style={{ fontSize: 8, color: "#c2410c", letterSpacing: "0.1em", marginBottom: 6 }}>SOLO FLAGGED</p>
                {fraudAnalysis.suspicious_accounts.filter(a => !a.ring_id).map(a => (
                  <div key={a.account_id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 6px", borderRadius: 5, background: "#fef2f2", marginBottom: 3, border: "1px solid #fecaca" }}>
                    <span style={{ fontSize: 9, color: "#991b1b", fontWeight: 700 }}>{a.account_id}</span>
                    <span style={{ fontSize: 9, color: "#ef4444", fontWeight: 700 }}>{a.suspicion_score}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ── CANVAS ───────────────────────────────────────────────────── */}
        <main ref={wrapperRef} style={{ flex: 1, position: "relative", overflow: "hidden", background: "white" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(#bbf7d0 1px, transparent 1px)", backgroundSize: "26px 26px" }} />

          {/* Zoom controls */}
          {hasData && (
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", flexDirection: "column", gap: 4, zIndex: 10 }}>
              {[
                { label: "+", title: "Zoom in",   fn: () => { const r = wrapperRef.current.getBoundingClientRect(); doZoom(1, r.width/2, r.height/2); } },
                { label: "−", title: "Zoom out",  fn: () => { const r = wrapperRef.current.getBoundingClientRect(); doZoom(-1, r.width/2, r.height/2); } },
                { label: "⊙", title: "Reset view", fn: resetZoom },
              ].map(({ label, title, fn }) => (
                <button key={label} title={title} onClick={fn}
                  style={{ width: 32, height: 32, background: "#14532d", border: "1px solid #166534", borderRadius: 8, color: "#4ade80", fontSize: label === "⊙" ? 14 : 18, fontFamily: "monospace", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#166534"}
                  onMouseLeave={e => e.currentTarget.style.background = "#14532d"}
                >{label}</button>
              ))}
              <div style={{ background: "#14532d", border: "1px solid #166534", borderRadius: 6, padding: "4px 0", textAlign: "center" }}>
                <span style={{ fontSize: 8, color: "#4ade80", fontFamily: "monospace" }}>{Math.round(zoom * 100)}%</span>
              </div>
            </div>
          )}
          {hasData && (
            <div style={{ position: "absolute", bottom: 14, left: 14, display: "flex", flexWrap: "wrap", gap: 7, zIndex: 5, pointerEvents: "none", maxWidth: 500 }}>
              <LegendBubble color={NORMAL_COLOR.node} label="Normal" />
              {fraudAnalysis.fraud_rings.map((ring, i) => (
                <LegendBubble key={ring.ring_id} color={RING_PALETTE[i].node} label={`${ring.ring_id} · ${ring.pattern_type}`} />
              ))}
              <LegendBubble color={SOLO_COLOR.node} label="Solo suspect" />
            </div>
          )}

          {!hasData && !loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, pointerEvents: "none" }}>
              <div style={{ fontSize: 60, opacity: 0.08 }}>◎</div>
              <p style={{ fontSize: 12, color: "#bbf7d0", letterSpacing: "0.18em" }}>UPLOAD A CSV TO START</p>
            </div>
          )}
          {loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 34, height: 34, border: "3px solid #dcfce7", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            </div>
          )}

          <svg
            ref={svgEl}
            style={{ display: hasData ? "block" : "none", position: "absolute", top: 0, left: 0, cursor: "grab" }}
            onClick={handleSvgClick}
            onWheel={e => {
              e.preventDefault();
              const rect = wrapperRef.current.getBoundingClientRect();
              doZoom(-e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
            }}
            onMouseDown={e => {
              isPanningRef.current = true;
              panStartRef.current  = { mx: e.clientX, my: e.clientY, px: panRef.current.x, py: panRef.current.y };
              e.currentTarget.style.cursor = "grabbing";
            }}
            onMouseMove={e => {
              if (!isPanningRef.current) return;
              panRef.current = {
                x: panStartRef.current.px + (e.clientX - panStartRef.current.mx),
                y: panStartRef.current.py + (e.clientY - panStartRef.current.my),
              };
              applyTransform(zoomRef.current, panRef.current);
            }}
            onMouseUp={e   => { isPanningRef.current = false; e.currentTarget.style.cursor = "grab"; }}
            onMouseLeave={() => { isPanningRef.current = false; }}
          >
            {/* layers are injected imperatively inside g.viewport by the rebuild useEffect */}
          </svg>

          {/* Node popup */}
          {nodePopup && (
            <NodePopup nodePopup={nodePopup} style={getNodePopupPos()} onClose={() => setNodePopup(null)} />
          )}

          {/* Edge tooltip */}
          {edgeTooltip && (
            <div style={{ ...getEdgeTooltipPos(), width: 218, background: "white", border: "1.5px solid #86efac", borderRadius: 12, boxShadow: "0 4px 28px rgba(22,163,74,0.20)", fontFamily: "monospace", overflow: "hidden", zIndex: 20 }}>
              <div style={{ background: "#14532d", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 8, color: "#4ade80", letterSpacing: "0.15em", marginBottom: 2 }}>TRANSACTION</p>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "white", wordBreak: "break-all" }}>{edgeTooltip.id}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setEdgeTooltip(null); activeEdgeIdxRef.current = -1; }}
                  style={{ background: "#166534", border: "none", color: "#4ade80", cursor: "pointer", borderRadius: 6, width: 22, height: 22, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8 }}>✕</button>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, padding: "7px 10px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                  <span style={{ fontSize: 9, color: "#15803d", fontWeight: 700, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{edgeTooltip.source}</span>
                  <span style={{ fontSize: 14, color: "#16a34a" }}>→</span>
                  <span style={{ fontSize: 9, color: "#15803d", fontWeight: 700, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{edgeTooltip.target}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>AMOUNT</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "#16a34a" }}>₹{Number(edgeTooltip.amount).toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>DATE</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#374151" }}>{edgeTooltip.date}</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right detail panel */}
        <DetailPanel
          selectedIds={selectedIds}
          nodes={nodes}
          edges={edges}
          onClose={() => {
            setSelectedIds(new Set());
            selectedIdsRef.current = new Set();
            setEdgeTooltip(null);
            activeEdgeIdxRef.current = -1;
            setNodePopup(null);
          }}
        />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-ring {
          0%   { transform: scale(1);    opacity: 0.9; }
          70%  { transform: scale(1.4);  opacity: 0;   }
          100% { transform: scale(1.4);  opacity: 0;   }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LegendBubble({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.9)", border: `1px solid ${color}55`, borderRadius: 20, padding: "4px 10px" }}>
      <div style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 8, color: "#374151", fontFamily: "monospace", whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

function NodePopup({ nodePopup, style, onClose }) {
  const { id, suspicious, ring } = nodePopup;
  const ringColor = ring ? ringColorMap[ring.ring_id] : null;
  const headerBg  = ringColor ? ringColor.node : suspicious ? "#7f1d1d" : "#14532d";

  return (
    <div style={{ ...style, width: 234, background: "white", border: `1.5px solid ${ringColor ? ringColor.edge : suspicious ? "#ef4444" : "#86efac"}`, borderRadius: 12, boxShadow: "0 6px 32px rgba(0,0,0,0.18)", fontFamily: "monospace", overflow: "hidden", zIndex: 25 }}>
      <div style={{ background: headerBg, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 8, color: ringColor ? ringColor.label : suspicious ? "#fca5a5" : "#4ade80", letterSpacing: "0.15em", marginBottom: 3 }}>
            {ring ? `${ring.ring_id} MEMBER` : suspicious ? "SUSPICIOUS ACCOUNT" : "ACCOUNT"}
          </p>
          <p style={{ fontSize: 11, fontWeight: 800, color: "white", wordBreak: "break-all" }}>{id}</p>
        </div>
        <button onClick={e => { e.stopPropagation(); onClose(); }}
          style={{ background: "rgba(0,0,0,0.25)", border: "none", color: "white", cursor: "pointer", borderRadius: 5, width: 20, height: 20, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ padding: "12px 14px" }}>
        {suspicious && (
          <>
            <div style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 8, color: "#9ca3af", letterSpacing: "0.1em" }}>SUSPICION SCORE</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: "#ef4444" }}>{suspicious.suspicion_score}%</span>
              </div>
              <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${suspicious.suspicion_score}%`, background: "linear-gradient(90deg,#f97316,#ef4444)", borderRadius: 3 }} />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 8, color: "#9ca3af", letterSpacing: "0.1em", marginBottom: 5 }}>DETECTED PATTERNS</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {suspicious.detected_patterns.map(p => (
                  <span key={p} style={{ fontSize: 7.5, fontWeight: 700, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 4, padding: "2px 6px" }}>
                    {p.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
        {ring && (
          <div style={{ background: ringColor.node + "12", border: `1px solid ${ringColor.edge}44`, borderRadius: 7, padding: "8px 10px" }}>
            <p style={{ fontSize: 8, color: ringColor.node, letterSpacing: "0.1em", marginBottom: 5, fontWeight: 700 }}>RING MEMBERSHIP</p>
            {[["Pattern", ring.pattern_type], ["Ring risk", `${ring.risk_score}%`], ["Total cycled", `₹${ring.total_amount_cycled?.toLocaleString("en-IN")}`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 9, color: "#374151" }}>{k}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: ringColor.node }}>{v}</span>
              </div>
            ))}
          </div>
        )}
        {!suspicious && !ring && (
          <p style={{ fontSize: 10, color: "#86efac", textAlign: "center", padding: "8px 0" }}>✓ No suspicious patterns</p>
        )}
      </div>
    </div>
  );
}

function DetailPanel({ selectedIds, nodes, edges, onClose }) {
  if (selectedIds.size === 0) return null;
  const selectedNodes = nodes.filter(n => selectedIds.has(n.id));
  const sent          = edges.filter(e => selectedIds.has(e.source));
  const received      = edges.filter(e => selectedIds.has(e.target));
  const tSent         = sent.reduce((s, e) => s + e.amount, 0);
  const tRecv         = received.reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ width: 290, borderLeft: "1px solid #dcfce7", background: "white", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "monospace" }}>
      <div style={{ background: "#14532d", padding: "13px 15px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 9, color: "#4ade80", letterSpacing: "0.15em", marginBottom: 4 }}>
            {selectedIds.size === 1 ? "ACCOUNT" : `${selectedIds.size} ACCOUNTS`}
          </p>
          {selectedNodes.map(n => {
            const ring = accountRingMap[n.id];
            const susp = suspiciousMap[n.id];
            const c    = getNodeColors(n.id);
            return (
              <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                {(ring || susp) && <span style={{ fontSize: 10 }}>⚠</span>}
                <p style={{ fontSize: 11, fontWeight: 800, color: (ring || susp) ? c.stroke : "white", wordBreak: "break-all", lineHeight: 1.5 }}>{n.id}</p>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} style={{ background: "#166534", border: "none", color: "#4ade80", cursor: "pointer", borderRadius: 6, width: 26, height: 26, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8 }}>✕</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ padding: "12px 14px", background: "#fef2f2", borderRight: "1px solid #fecaca", borderBottom: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: 9, color: "#9ca3af", marginBottom: 3 }}>SENT</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>{sent.length}<span style={{ fontSize: 9, color: "#9ca3af", marginLeft: 3 }}>tx</span></p>
          <p style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>₹{tSent.toLocaleString()}</p>
        </div>
        <div style={{ padding: "12px 14px", background: "#f0fdf4", borderBottom: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: 9, color: "#9ca3af", marginBottom: 3 }}>RECEIVED</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>{received.length}<span style={{ fontSize: 9, color: "#9ca3af", marginLeft: 3 }}>tx</span></p>
          <p style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>₹{tRecv.toLocaleString()}</p>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
        {sent.length > 0 && (
          <>
            <p style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", letterSpacing: "0.15em", marginBottom: 7 }}>↑ SENT ({sent.length})</p>
            {sent.map(e => (
              <div key={e.id} style={{ border: "1px solid #f3f4f6", borderRadius: 7, padding: "8px 10px", marginBottom: 5, background: "#fafafa" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.source}</span>
                  <span style={{ fontSize: 12, color: "#16a34a" }}>→</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#16a34a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{e.target}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>{e.id}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626" }}>−₹{e.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </>
        )}
        {received.length > 0 && (
          <>
            <p style={{ fontSize: 9, fontWeight: 700, color: "#16a34a", letterSpacing: "0.15em", marginBottom: 7, marginTop: sent.length > 0 ? 12 : 0 }}>↓ RECEIVED ({received.length})</p>
            {received.map(e => (
              <div key={e.id} style={{ border: "1px solid #f3f4f6", borderRadius: 7, padding: "8px 10px", marginBottom: 5, background: "#fafafa" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.source}</span>
                  <span style={{ fontSize: 12, color: "#16a34a" }}>→</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#16a34a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{e.target}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>{e.id}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a" }}>+₹{e.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
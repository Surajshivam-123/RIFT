/*
  Arrow.jsx
  - Shows transaction ID above the arrow
  - Shows timestamp below the arrow
  - Green colored arrows
  - Curved so A→B and B→A don't overlap
*/

import { NODE_RADIUS } from "./GraphNode";

const OFFSET = NODE_RADIUS + 4;

function getEdgePoints(src, tgt) {
  const dx  = tgt.x - src.x;
  const dy  = tgt.y - src.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux  = dx / len;
  const uy  = dy / len;

  return {
    x1: src.x + ux * OFFSET,
    y1: src.y + uy * OFFSET,
    x2: tgt.x - ux * OFFSET,
    y2: tgt.y - uy * OFFSET,
    ux,
    uy,
  };
}

export default function Arrow({ edge, nodeMap }) {
  const src = nodeMap[edge.source];
  const tgt = nodeMap[edge.target];
  if (!src || !tgt) return null;

  // ── SELF LOOP ──────────────────────────────────────────────────────────────
  if (edge.source === edge.target) {
    const loopCX = src.x;
    const loopCY = src.y - NODE_RADIUS - 22;
    return (
      <g>
        <circle
          cx={loopCX} cy={loopCY} r={18}
          fill="none"
          stroke="#16a34a"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          markerEnd="url(#arrowhead-green)"
        />
        <text
          x={loopCX} y={loopCY - 24}
          textAnchor="middle"
          fontSize={8}
          fontFamily="monospace"
          fill="#15803d"
          fontWeight="600"
        >
          {edge.id}
        </text>
      </g>
    );
  }

  // ── STRAIGHT + SLIGHT CURVE ────────────────────────────────────────────────
  const { x1, y1, x2, y2, ux, uy } = getEdgePoints(src, tgt);

  // Perpendicular offset for curve (so A→B and B→A are distinct)
  const mx  = (x1 + x2) / 2 - uy * 24;
  const my  = (y1 + y2) / 2 + ux * 24;

  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;

  // Label positions — slightly above and below the midpoint of the curve
  const labelX = mx;
  const labelY = my;

  // Format timestamp short: "2024-01-01 10:00" (drop seconds)
  const shortTime = edge.timestamp?.slice(0, 16) || "";

  return (
    <g className="group/arrow">

      {/* Invisible wide stroke for easier hover */}
      <path d={d} stroke="transparent" strokeWidth={12} fill="none" className="cursor-pointer" />

      {/* Visible green arrow */}
      <path
        d={d}
        stroke="#16a34a"
        strokeWidth={2}
        fill="none"
        markerEnd="url(#arrowhead-green)"
        className="group-hover/arrow:stroke-green-400 transition-colors duration-200"
      />

      {/* Transaction ID — above the midpoint */}
      <text
        x={labelX}
        y={labelY - 10}
        textAnchor="middle"
        fontSize={8}
        fontFamily="monospace"
        fill="#15803d"
        fontWeight="700"
        className="select-none pointer-events-none"
      >
        {edge.id}
      </text>

      {/* Amount */}
      <text
        x={labelX}
        y={labelY + 2}
        textAnchor="middle"
        fontSize={7.5}
        fontFamily="monospace"
        fill="#16a34a"
        className="select-none pointer-events-none"
      >
        ₹{edge.amount.toLocaleString()}
      </text>

      {/* Timestamp — below */}
      <text
        x={labelX}
        y={labelY + 13}
        textAnchor="middle"
        fontSize={7}
        fontFamily="monospace"
        fill="#4ade80"
        className="select-none pointer-events-none"
      >
        {shortTime}
      </text>

      {/* Native tooltip */}
      <title>
        {edge.id}{"\n"}
        {edge.source} → {edge.target}{"\n"}
        Amount: ₹{edge.amount} | {edge.timestamp}
      </title>
    </g>
  );
}
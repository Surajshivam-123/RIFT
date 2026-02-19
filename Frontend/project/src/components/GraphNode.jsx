/*
  GraphNode.jsx
  - White background theme
  - Green filled nodes
  - Shows full account ID inside the node
  - Sends / receives count below the ID
*/

export const NODE_RADIUS = 36; // exported so Arrow.jsx can offset correctly

export default function GraphNode({ node }) {
  const { id, x, y, sentCount, receivedCount } = node;

  // If ID is long, truncate smartly for display inside the circle
  const displayId = id.length > 9 ? id.slice(0, 9) + "…" : id;

  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer group">

      {/* Outer glow ring on hover */}
      <circle
        r={NODE_RADIUS + 10}
        fill="none"
        stroke="#16a34a"
        strokeWidth={2}
        opacity={0}
        className="transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* White border ring */}
      <circle
        r={NODE_RADIUS + 2}
        fill="white"
        stroke="#15803d"
        strokeWidth={2}
      />

      {/* Green filled main circle */}
      <circle
        r={NODE_RADIUS}
        fill="#22c55e"
        stroke="#16a34a"
        strokeWidth={2}
        className="group-hover:fill-green-400 transition-colors duration-200"
      />

      {/* Account ID — main label */}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight="700"
        fontFamily="monospace"
        fill="white"
        dy={-8}
        className="select-none pointer-events-none"
      >
        {displayId}
      </text>

      {/* Divider line */}
      <line
        x1={-NODE_RADIUS + 10}
        y1={0}
        x2={NODE_RADIUS - 10}
        y2={0}
        stroke="white"
        strokeWidth={0.8}
        opacity={0.5}
      />

      {/* Sent / Received stats */}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={8}
        fontFamily="monospace"
        fill="white"
        dy={10}
        opacity={0.9}
        className="select-none pointer-events-none"
      >
        ↑{sentCount} ↓{receivedCount}
      </text>

      {/* Full ID tooltip on native hover */}
      <title>{id} | Sent: {sentCount} | Received: {receivedCount}</title>
    </g>
  );
}
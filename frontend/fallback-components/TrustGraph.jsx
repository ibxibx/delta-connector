import { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

/**
 * TrustGraph — interactive, animated trust graph for Delta Connector.
 * Drop-in fallback for the moving/cursor-responsive graph when Lovable can't deliver it.
 *
 * Requires: npm i reactflow
 *
 * PRD privacy rule (§20): render CONFIRMED, opted-in actors only.
 * The component drops any node with confirmed === false defensively, but the
 * backend/data layer must not send unconfirmed invitees in the first place.
 *
 * Props:
 *   nodes: [{ id, label, type, confirmed }]
 *   edges: [{ id, source, target, category }]
 */

const TYPE_COLORS = {
  Founder: "#6366f1",
  Investor: "#10b981",
  Lawyer: "#f59e0b",
  "Tax Advisor": "#f59e0b",
  Mentor: "#ec4899",
  "Coworking Space": "#0ea5e9",
  default: "#64748b",
};

function toFlow(nodes, edges) {
  const safe = nodes.filter((n) => n.confirmed !== false); // privacy: confirmed only
  const flowNodes = safe.map((n, i) => {
    const angle = (i / Math.max(safe.length, 1)) * Math.PI * 2;
    const radius = 220;
    return {
      id: n.id,
      data: { label: n.label },
      position: { x: 300 + radius * Math.cos(angle), y: 240 + radius * Math.sin(angle) },
      style: {
        background: TYPE_COLORS[n.type] || TYPE_COLORS.default,
        color: "white",
        border: "none",
        borderRadius: 12,
        padding: "8px 14px",
        fontWeight: 600,
        fontSize: 13,
        transition: "transform 150ms ease, box-shadow 150ms ease",
      },
    };
  });
  const ids = new Set(safe.map((n) => n.id));
  const flowEdges = edges
    .filter((e) => ids.has(e.source) && ids.has(e.target))
    .map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.category,
      animated: true, // moving dashed edges
      style: { stroke: "#94a3b8" },
      labelStyle: { fontSize: 10, fill: "#64748b" },
    }));
  return { flowNodes, flowEdges };
}

export default function TrustGraph({ nodes = [], edges = [] }) {
  const { flowNodes, flowEdges } = toFlow(nodes, edges);
  const [rfNodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [rfEdges, , onEdgesChange] = useEdgesState(flowEdges);
  const [hovered, setHovered] = useState(null);

  // hover-highlight: lift and glow the node under the cursor
  const onNodeMouseEnter = useCallback((_, node) => {
    setHovered(node.id);
    setNodes((ns) =>
      ns.map((n) =>
        n.id === node.id
          ? { ...n, style: { ...n.style, transform: "scale(1.12)", boxShadow: "0 0 0 4px rgba(99,102,241,0.35)" } }
          : n
      )
    );
  }, [setNodes]);

  const onNodeMouseLeave = useCallback((_, node) => {
    setHovered(null);
    setNodes((ns) =>
      ns.map((n) =>
        n.id === node.id
          ? { ...n, style: { ...n.style, transform: "scale(1)", boxShadow: "none" } }
          : n
      )
    );
  }, [setNodes]);

  return (
    <div style={{ width: "100%", height: 520, borderRadius: 16, overflow: "hidden" }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} color="#e2e8f0" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

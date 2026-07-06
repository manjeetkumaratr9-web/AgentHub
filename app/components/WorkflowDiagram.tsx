"use client";

import { motion } from "motion/react";

/**
 * Animated agent-flow diagram (n8n-inspired): Customer message → AI Agent →
 * three parallel actions (book, log, notify). Built as a responsive SVG with
 * Framer Motion: nodes scale/fade in on view, edges draw in, and a continuous
 * light pulse flows along each edge (CSS `stream-line`).
 */

type OutNode = { y: number; icon: string; label: string; sub: string; accent: string; delay: number };

const OUTPUTS: OutNode[] = [
  { y: 70, icon: "📅", label: "Books Slot", sub: "Google Calendar", accent: "#34d399", delay: 0.5 },
  { y: 178, icon: "📊", label: "Logs Lead", sub: "Google Sheet", accent: "#22d3ee", delay: 0.6 },
  { y: 286, icon: "🔔", label: "Notifies You", sub: "instant alert", accent: "#fbbf24", delay: 0.7 },
];

const EDGES = [
  "M210,210 C 300,210 320,210 400,210",
  "M610,196 C 700,150 730,128 820,100",
  "M610,214 C 700,214 730,210 820,208",
  "M610,232 C 700,282 730,300 820,316",
];

export default function WorkflowDiagram() {
  return (
    <div className="relative w-full overflow-x-auto pb-2">
      <svg
        viewBox="0 0 1000 400"
        className="w-full min-w-[700px] max-w-4xl mx-auto"
        role="img"
        aria-label="How an AgentHub agent works: customer message goes to the AI agent, which books a slot, logs the lead, and notifies you."
      >
        <defs>
          <linearGradient id="wf-flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id="wf-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* edges */}
        {EDGES.map((d, i) => (
          <g key={i}>
            <motion.path
              d={d}
              fill="none"
              stroke="#334155"
              strokeWidth={2}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.12 }}
            />
            <path d={d} fill="none" stroke="url(#wf-flow)" strokeWidth={2} className="stream-line" />
          </g>
        ))}

        {/* Customer node */}
        <motion.g
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ transformOrigin: "125px 210px" }}
        >
          <rect x={40} y={176} width={170} height={68} rx={16} fill="#0f1630" stroke="#38bdf8" strokeWidth={1.5} filter="url(#wf-glow)" />
          <text x={70} y={218} fontSize={24} textAnchor="middle">💬</text>
          <text x={94} y={206} fill="#e2e8f0" fontSize={15} fontWeight={600}>Customer</text>
          <text x={94} y={224} fill="#94a3b8" fontSize={11}>sawaal / booking</text>
        </motion.g>

        {/* AI Agent node (center, bigger) */}
        <motion.g
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{ transformOrigin: "505px 210px" }}
        >
          <rect x={400} y={150} width={210} height={120} rx={20} fill="#0f1630" stroke="#818cf8" strokeWidth={2} filter="url(#wf-glow)" />
          <text x={505} y={196} fontSize={30} textAnchor="middle">🤖</text>
          <text x={505} y={228} fill="#ffffff" fontSize={18} fontWeight={700} textAnchor="middle">AI Agent</text>
          <text x={505} y={248} fill="#a5b4fc" fontSize={12} textAnchor="middle">Gemini + Memory</text>
        </motion.g>

        {/* Output nodes */}
        {OUTPUTS.map((o) => (
          <motion.g
            key={o.label}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: o.delay }}
            style={{ transformOrigin: `900px ${o.y + 30}px` }}
          >
            <rect x={820} y={o.y} width={160} height={60} rx={14} fill="#0f1630" stroke={o.accent} strokeWidth={1.5} filter="url(#wf-glow)" />
            <text x={848} y={o.y + 38} fontSize={20} textAnchor="middle">{o.icon}</text>
            <text x={870} y={o.y + 27} fill="#e2e8f0" fontSize={14} fontWeight={600}>{o.label}</text>
            <text x={870} y={o.y + 43} fill="#94a3b8" fontSize={10}>{o.sub}</text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

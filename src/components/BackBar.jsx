import { Link } from "react-router-dom";

export default function BackBar({ title }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 900,
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 2rem",
      background: "rgba(255,248,225,0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,213,79,0.4)",
    }}>
      <Link
        to="/"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          textDecoration: "none", color: "#2D3748",
          fontWeight: 600, fontSize: "0.9rem",
          padding: "7px 16px", borderRadius: 30,
          background: "rgba(255,167,38,0.12)",
          border: "1px solid rgba(255,167,38,0.3)",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,167,38,0.22)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,167,38,0.12)"; }}
      >
        ← Back to Home
      </Link>
      {title && (
        <span style={{ fontWeight: 700, color: "#2D3748", fontSize: "1rem" }}>
          {title}
        </span>
      )}
    </div>
  );
}